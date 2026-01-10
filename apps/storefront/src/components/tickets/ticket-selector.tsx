'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Minus, Plus, ShoppingCart, Ticket } from 'lucide-react';
import { useStorefront } from '@/lib/storefront-context';
import type { StorefrontTicketType } from '@/lib/api';
import { formatCurrency } from '@atrivio/shared/utils/money';

interface CartItem {
  ticketType: StorefrontTicketType;
  quantity: number;
}

interface TicketSelectorProps {
  ticketTypes: StorefrontTicketType[];
}

export function TicketSelector({ ticketTypes }: TicketSelectorProps) {
  const router = useRouter();
  const storefront = useStorefront();
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());
  const hasBackgroundImage = !!storefront.settings.theme.backgroundImageUrl;

  const updateQuantity = (ticketType: StorefrontTicketType, delta: number) => {
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
    sessionStorage.setItem(`cart-${storefront.attraction.slug}`, JSON.stringify(cartData));
    router.push('/checkout');
  };

  // Group tickets by category
  const ticketsByCategory = ticketTypes.reduce<Record<string, StorefrontTicketType[]>>(
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

  // Find popular ticket (second ticket if multiple exist)
  const popularIndex = ticketTypes.length > 1 ? 1 : -1;
  const popularTicketId = ticketTypes[popularIndex]?.id;

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Ticket Selection */}
      <div className="lg:col-span-2 space-y-8">
        {Object.entries(ticketsByCategory).map(([category, tickets]) => (
          <div key={category}>
            {Object.keys(ticketsByCategory).length > 1 && (
              <h3 className="mb-4 text-lg font-semibold">{category}</h3>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              {tickets.map((ticket) => {
                const quantity = getQuantity(ticket.id);
                const isInCart = quantity > 0;
                const isPopular = ticket.id === popularTicketId;

                return (
                  <div
                    key={ticket.id}
                    className={`relative flex flex-col rounded-xl border overflow-hidden ${
                      isInCart
                        ? 'border-2 border-storefront-primary'
                        : isPopular
                          ? 'border-2 border-storefront-primary'
                          : 'border-border'
                    } ${hasBackgroundImage ? 'bg-card/80 backdrop-blur-sm' : 'bg-card'}`}
                  >
                    {isPopular && !isInCart && (
                      <div className="absolute top-0 right-0 bg-storefront-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                        POPULAR
                      </div>
                    )}
                    <div className="p-6 flex-1">
                      <h3 className="text-xl font-heading font-bold mb-2">{ticket.name}</h3>
                      {ticket.description && (
                        <p className="text-muted-foreground text-sm mb-4">{ticket.description}</p>
                      )}

                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-3xl font-bold">{formatCurrency(ticket.price)}</span>
                        {ticket.comparePrice && ticket.comparePrice > ticket.price && (
                          <span className="text-muted-foreground line-through text-lg">
                            {formatCurrency(ticket.comparePrice)}
                          </span>
                        )}
                        <span className="text-muted-foreground">/person</span>
                      </div>

                      {ticket.includes && ticket.includes.length > 0 && (
                        <ul className="space-y-2 mb-4">
                          {ticket.includes.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <Check className="h-4 w-4 text-storefront-primary flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}

                      {ticket.category && Object.keys(ticketsByCategory).length === 1 && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                          <Ticket className="h-3 w-3" />
                          {ticket.category}
                        </div>
                      )}
                    </div>

                    <div className="p-6 pt-0">
                      {ticket.isAvailable ? (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => updateQuantity(ticket, -1)}
                            disabled={quantity === 0}
                            className="flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(ticket, 1)}
                            disabled={quantity >= ticket.maxPerOrder}
                            className="flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (quantity === 0) {
                                updateQuantity(ticket, 1);
                              }
                            }}
                            className={`flex-1 rounded-lg px-4 py-3 font-semibold transition-opacity ${
                              quantity > 0
                                ? 'bg-muted text-muted-foreground cursor-default'
                                : 'bg-storefront-primary text-white hover:opacity-90'
                            }`}
                          >
                            {quantity > 0 ? 'In Cart' : 'Add to Cart'}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="w-full rounded-lg px-4 py-3 font-semibold bg-muted text-muted-foreground cursor-not-allowed"
                        >
                          Sold Out
                        </button>
                      )}

                      {ticket.maxPerOrder < 10 && (
                        <p className="mt-2 text-xs text-muted-foreground text-center">
                          Max {ticket.maxPerOrder} per order
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary - Sticky on desktop */}
      <div className="lg:col-span-1">
        <div className="sticky top-4">
          <div className={`rounded-xl border border-border p-6 ${hasBackgroundImage ? 'bg-card/80 backdrop-blur-sm' : 'bg-card'}`}>
            <h3 className="flex items-center gap-2 text-lg font-heading font-bold mb-4">
              <ShoppingCart className="h-5 w-5" />
              Your Cart
            </h3>

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

                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Total ({totalTickets} tickets)</p>
                    <p className="text-xl font-bold">{formatCurrency(cartTotal)}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full rounded-lg bg-storefront-primary px-4 py-3 font-semibold text-white hover:opacity-90 transition-opacity"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
