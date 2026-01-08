'use client';

import { Eye, MoreHorizontal, RefreshCw, Search, ShoppingCart, XCircle } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { apiClientDirect as apiClient, resolveOrgId } from '@/lib/api/client';

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  ticket_type: { id: string; name: string } | null;
  time_slot: { id: string; date: string; start_time: string; end_time: string } | null;
}

interface Ticket {
  id: string;
  barcode: string;
  status: string;
  valid_from: string | null;
  valid_until: string | null;
  used_at: string | null;
  ticket_type: { id: string; name: string } | null;
}

interface Order {
  id: string;
  order_number: string;
  customer_email: string;
  customer_name: string | null;
  customer_phone: string | null;
  status: string;
  subtotal: number;
  discount_amount: number;
  total: number;
  created_at: string;
  completed_at: string | null;
  attraction: { id: string; name: string } | null;
  source: { id: string; name: string } | null;
  promo: { id: string; code: string } | null;
  items: OrderItem[];
  tickets?: Ticket[];
}

const STATUS_COLORS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  processing: 'outline',
  completed: 'default',
  canceled: 'destructive',
  refunded: 'destructive',
};

export default function OrdersPage() {
  const params = useParams();
  const orgIdentifier = params['orgId'] as string;
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvedOrgId, setResolvedOrgId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Filters
  const [searchEmail, setSearchEmail] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    async function init() {
      const orgId = await resolveOrgId(orgIdentifier);
      if (orgId) {
        setResolvedOrgId(orgId);
        await loadOrders(orgId);
      }
      setIsLoading(false);
    }
    init();
  }, [orgIdentifier, loadOrders]);

  async function loadOrders(orgId: string, page = 1) {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pagination.limit),
      });
      if (searchEmail) params.append('customerEmail', searchEmail);
      if (statusFilter) params.append('status', statusFilter);

      const response = await apiClient.get<{
        data: Order[];
        pagination: typeof pagination;
      }>(`/organizations/${orgId}/orders?${params}`);

      setOrders(response?.data || []);
      if (response?.pagination) {
        setPagination(response.pagination);
      }
    } catch (_error) {}
  }

  async function handleSearch() {
    if (resolvedOrgId) {
      await loadOrders(resolvedOrgId, 1);
    }
  }

  async function viewOrderDetails(order: Order) {
    if (!resolvedOrgId) return;

    try {
      const fullOrder = await apiClient.get<Order>(
        `/organizations/${resolvedOrgId}/orders/${order.id}`
      );
      setSelectedOrder(fullOrder);
      setIsDetailsOpen(true);
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to load order details',
        variant: 'destructive',
      });
    }
  }

  async function handleCompleteOrder(order: Order) {
    if (!resolvedOrgId) return;

    try {
      await apiClient.post(`/organizations/${resolvedOrgId}/orders/${order.id}/complete`, {});
      toast({ title: 'Order completed and tickets generated' });
      await loadOrders(resolvedOrgId, pagination.page);
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to complete order',
        variant: 'destructive',
      });
    }
  }

  async function handleCancelOrder(order: Order) {
    if (!resolvedOrgId) return;
    if (!confirm(`Cancel order ${order.order_number}?`)) return;

    try {
      await apiClient.post(`/organizations/${resolvedOrgId}/orders/${order.id}/cancel`, {});
      toast({ title: 'Order canceled' });
      await loadOrders(resolvedOrgId, pagination.page);
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel order',
        variant: 'destructive',
      });
    }
  }

  async function handleRefundOrder(order: Order) {
    if (!resolvedOrgId) return;
    if (!confirm(`Refund order ${order.order_number}? This will void all tickets.`)) return;

    try {
      await apiClient.post(`/organizations/${resolvedOrgId}/orders/${order.id}/refund`, {
        reason: 'Customer request',
      });
      toast({ title: 'Order refunded' });
      await loadOrders(resolvedOrgId, pagination.page);
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to refund order',
        variant: 'destructive',
      });
    }
  }

  function formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  function formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours || '0', 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">View and manage ticket orders.</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by customer email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            {pagination.total} order{pagination.total !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No orders found.</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Attraction</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.order_number}
                        {order.promo && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {order.promo.code}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>{order.customer_email}</div>
                        {order.customer_name && (
                          <div className="text-sm text-muted-foreground">{order.customer_name}</div>
                        )}
                      </TableCell>
                      <TableCell>{order.attraction?.name || '—'}</TableCell>
                      <TableCell className="text-right">
                        <div className="font-medium">{formatPrice(order.total)}</div>
                        {order.discount_amount > 0 && (
                          <div className="text-sm text-green-600">
                            -{formatPrice(order.discount_amount)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_COLORS[order.status] || 'secondary'}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(order.created_at)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => viewOrderDetails(order)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {order.status === 'pending' && (
                              <DropdownMenuItem onClick={() => handleCompleteOrder(order)}>
                                Complete Order
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {['pending', 'processing'].includes(order.status) && (
                              <DropdownMenuItem
                                onClick={() => handleCancelOrder(order)}
                                className="text-destructive"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel
                              </DropdownMenuItem>
                            )}
                            {order.status === 'completed' && (
                              <DropdownMenuItem
                                onClick={() => handleRefundOrder(order)}
                                className="text-destructive"
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refund
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() =>
                        resolvedOrgId && loadOrders(resolvedOrgId, pagination.page - 1)
                      }
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() =>
                        resolvedOrgId && loadOrders(resolvedOrgId, pagination.page + 1)
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order {selectedOrder?.order_number}</DialogTitle>
            <DialogDescription>
              {selectedOrder && formatDate(selectedOrder.created_at)}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Customer</div>
                  <div>{selectedOrder.customer_email}</div>
                  {selectedOrder.customer_name && (
                    <div className="text-sm">{selectedOrder.customer_name}</div>
                  )}
                  {selectedOrder.customer_phone && (
                    <div className="text-sm">{selectedOrder.customer_phone}</div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Status</div>
                  <Badge variant={STATUS_COLORS[selectedOrder.status]}>
                    {selectedOrder.status}
                  </Badge>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Items</div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Time Slot</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item) => {
                      const ticketType = Array.isArray(item.ticket_type)
                        ? item.ticket_type[0]
                        : item.ticket_type;
                      const timeSlot = Array.isArray(item.time_slot)
                        ? item.time_slot[0]
                        : item.time_slot;

                      return (
                        <TableRow key={item.id}>
                          <TableCell>{ticketType?.name || '—'}</TableCell>
                          <TableCell>
                            {timeSlot ? `${timeSlot.date} ${formatTime(timeSlot.start_time)}` : '—'}
                          </TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            {formatPrice(item.unit_price)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatPrice(item.total_price)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Totals */}
              <div className="border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount {selectedOrder.promo && `(${selectedOrder.promo.code})`}</span>
                    <span>-{formatPrice(selectedOrder.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold mt-2">
                  <span>Total</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Tickets */}
              {selectedOrder.tickets && selectedOrder.tickets.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Tickets</div>
                  <div className="grid gap-2">
                    {selectedOrder.tickets.map((ticket) => {
                      const ticketType = Array.isArray(ticket.ticket_type)
                        ? ticket.ticket_type[0]
                        : ticket.ticket_type;

                      return (
                        <div
                          key={ticket.id}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div className="font-mono text-sm">{ticket.barcode}</div>
                          <div className="text-sm">{ticketType?.name}</div>
                          <Badge
                            variant={
                              ticket.status === 'valid'
                                ? 'default'
                                : ticket.status === 'used'
                                  ? 'secondary'
                                  : 'destructive'
                            }
                          >
                            {ticket.status}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
