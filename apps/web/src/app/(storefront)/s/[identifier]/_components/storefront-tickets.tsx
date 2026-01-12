'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, ShoppingCart, Ticket } from 'lucide-react';
import type { PublicTicketType } from '@/lib/api/types';
import { formatCurrency } from '@atrivio/shared/utils/money';

interface StorefrontTicketsProps {
  identifier: string;
  ticketTypes: PublicTicketType[];
  attractionName: string;
}

interface CartItem {
  ticketType: PublicTicketType;
  quantity: number;
}

export function StorefrontTickets({
  identifier,
  ticketTypes,
  attractionName,
}: StorefrontTicketsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());

  // Restore cart from sessionStorage on mount
  useEffect(() => {
    const savedCart = sessionStorage.getItem(`cart-${identifier}`);
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart) as Array<{
          ticketTypeId: string;
          ticketTypeName: string;
          price: number;
          quantity: number;
        }>;

        const restoredCart = new Map<string, CartItem>();
        cartData.forEach((item) => {
          // Find the matching ticket type from props to get full data
          const ticketType = ticketTypes.find((t) => t.id === item.ticketTypeId);
          if (ticketType) {
            restoredCart.set(item.ticketTypeId, {
              ticketType,
              quantity: item.quantity,
            });
          }
        });

        if (restoredCart.size > 0) {
          setCart(restoredCart);
        }
      } catch {
        // Invalid cart data, ignore
      }
    }
  }, [identifier, ticketTypes]);

  // Build URL helper that preserves storefront query param for local dev
  const buildUrl = (path: string) => {
    const storefrontParam = searchParams.get('storefront');
    if (storefrontParam) {
      return `${path}?storefront=${storefrontParam}`;
    }
    return path;
  };

  const updateQuantity = (ticketType: PublicTicketType, delta: number) => {
    setCart((prev) => {
      const newCart = new Map(prev);
      const existing = newCart.get(ticketType.id);
      const currentQty = existing?.quantity ?? 0;
      const newQty = Math.max(0, Math.min(ticketType.maxPerOrder, currentQty + delta));

      if (newQty === 0) {
        newCart.delete(ticketType.id);
      } else {
        newCart.set(ticketType.id, { ticketType, quantity: newQty });
      }

      return newCart;
    });
  };

  const getQuantity = (ticketTypeId: string) => {
    return cart.get(ticketTypeId)?.quantity ?? 0;
  };

  const cartItems = Array.from(cart.values());
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.ticketType.price * item.quantity,
    0
  );
  const totalTickets = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    // Store cart in sessionStorage for the checkout page
    const cartData = cartItems.map((item) => ({
      ticketTypeId: item.ticketType.id,
      ticketTypeName: item.ticketType.name,
      price: item.ticketType.price,
      quantity: item.quantity,
    }));
    sessionStorage.setItem(`cart-${identifier}`, JSON.stringify(cartData));
    router.push(buildUrl(`/s/${identifier}/checkout`));
  };

  // Group tickets by category
  const ticketsByCategory = ticketTypes.reduce<Record<string, PublicTicketType[]>>(
    (acc, ticket) => {
      const category = ticket.category || 'General';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(ticket);
      return acc;
    },
    {}
  );

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Ticket Selection */}
      <div className="lg:col-span-2 space-y-8">
        {Object.entries(ticketsByCategory).map(([category, tickets]) => (
          <div key={category}>
            <h3 className="mb-4 text-lg font-semibold">{category}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {tickets.map((ticket) => {
                const quantity = getQuantity(ticket.id);
                const isInCart = quantity > 0;

                return (
                  <Card key={ticket.id} className={isInCart ? 'ring-2 ring-primary' : ''}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{ticket.name}</CardTitle>
                          {ticket.description && (
                            <CardDescription className="mt-1">
                              {ticket.description}
                            </CardDescription>
                          )}
                        </div>
                        {ticket.comparePrice && ticket.comparePrice > ticket.price && (
                          <Badge variant="secondary" className="ml-2">
                            Save {formatCurrency(ticket.comparePrice - ticket.price)}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {ticket.includes && ticket.includes.length > 0 && (
                        <ul className="mb-4 text-sm text-muted-foreground">
                          {ticket.includes.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <Ticket className="h-3 w-3" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold">
                            {formatCurrency(ticket.price)}
                          </span>
                          {ticket.comparePrice && ticket.comparePrice > ticket.price && (
                            <span className="ml-2 text-sm text-muted-foreground line-through">
                              {formatCurrency(ticket.comparePrice)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(ticket, -1)}
                            disabled={quantity === 0}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(ticket, 1)}
                            disabled={quantity >= ticket.maxPerOrder}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {ticket.maxPerOrder < 10 && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Max {ticket.maxPerOrder} per order
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary - Sticky on desktop */}
      <div className="lg:col-span-1">
        <div className="sticky top-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Your Cart
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cartItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Select tickets to add them to your cart
                </p>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.ticketType.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div>
                        <p className="font-medium">{item.ticketType.name}</p>
                        <p className="text-muted-foreground">
                          {item.quantity} x {formatCurrency(item.ticketType.price)}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatCurrency(item.ticketType.price * item.quantity)}
                      </p>
                    </div>
                  ))}

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Total ({totalTickets} tickets)</p>
                      <p className="text-xl font-bold">{formatCurrency(cartTotal)}</p>
                    </div>
                  </div>

                  <Button className="w-full" size="lg" onClick={handleCheckout}>
                    Proceed to Checkout
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
