'use client';

import {
  Clock,
  CreditCard,
  Package,
  ShoppingCart,
  Ticket,
  User,
  UserCheck,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClientDirect as apiClient } from '@/lib/api/client';

// Material Design ease curve
const EASE = [0.4, 0, 0.2, 1] as const;

interface RecentActivityWidgetProps {
  orgId: string;
}

interface ActivityItem {
  id: string;
  type: 'order' | 'checkin' | 'clock_in' | 'clock_out' | 'inventory';
  description: string;
  timestamp: Date;
  icon: 'ticket' | 'cart' | 'user' | 'clock' | 'package';
  amount?: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  customer_email?: string;
}

// Sample activities to show when there's no real data (for demo purposes)
const SAMPLE_ACTIVITIES: ActivityItem[] = [
  {
    id: 'sample-1',
    type: 'order',
    description: '4 tickets sold for Friday Night Fright',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
    icon: 'ticket',
    amount: 12000, // $120.00
  },
  {
    id: 'sample-2',
    type: 'clock_in',
    description: 'Sarah M. clocked in at Zone A',
    timestamp: new Date(Date.now() - 1000 * 60 * 32), // 32 mins ago
    icon: 'user',
  },
  {
    id: 'sample-3',
    type: 'order',
    description: 'VIP Experience package purchased',
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
    icon: 'cart',
    amount: 25000, // $250.00
  },
  {
    id: 'sample-4',
    type: 'checkin',
    description: 'Group of 6 checked in at Main Gate',
    timestamp: new Date(Date.now() - 1000 * 60 * 58), // 58 mins ago
    icon: 'user',
  },
  {
    id: 'sample-5',
    type: 'inventory',
    description: 'Fog machine checked out by Mike T.',
    timestamp: new Date(Date.now() - 1000 * 60 * 72), // 1h 12m ago
    icon: 'package',
  },
];

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

function getActivityIcon(icon: ActivityItem['icon']) {
  switch (icon) {
    case 'ticket':
      return <Ticket className="h-4 w-4" />;
    case 'cart':
      return <ShoppingCart className="h-4 w-4" />;
    case 'user':
      return <UserCheck className="h-4 w-4" />;
    case 'clock':
      return <Clock className="h-4 w-4" />;
    case 'package':
      return <Package className="h-4 w-4" />;
    default:
      return <CreditCard className="h-4 w-4" />;
  }
}

function ActivityItemComponent({
  item,
  shouldReduceMotion,
  index,
}: {
  item: ActivityItem;
  shouldReduceMotion: boolean | null;
  index: number;
}) {
  const content = (
    <div className="flex items-start gap-3 py-2">
      <div className="flex-shrink-0 mt-0.5 text-muted-foreground">
        {getActivityIcon(item.icon)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.description}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatTimeAgo(item.timestamp)}</span>
          {item.amount && (
            <>
              <span>•</span>
              <span className="text-green-600 dark:text-green-500 font-medium">
                +{formatMoney(item.amount)}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (shouldReduceMotion) {
    return content;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: EASE }}
    >
      {content}
    </motion.div>
  );
}

export function RecentActivityWidget({ orgId }: RecentActivityWidgetProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    async function fetchActivity() {
      try {
        setIsLoading(true);

        // Fetch recent orders
        const ordersResponse = await apiClient.get<{
          data: Order[];
          meta: { total: number };
        }>(`/organizations/${orgId}/orders?limit=5&sortBy=created_at&sortOrder=desc`);

        const orders = Array.isArray(ordersResponse?.data) ? ordersResponse.data : [];

        // Convert orders to activity items
        const orderActivities: ActivityItem[] = orders
          .filter((o) => o.status !== 'cancelled')
          .map((order) => ({
            id: order.id,
            type: 'order' as const,
            description: `Order #${order.order_number} - ${order.customer_email || 'Guest'}`,
            timestamp: new Date(order.created_at),
            icon: 'ticket' as const,
            amount: order.total_amount,
          }));

        if (orderActivities.length > 0) {
          setActivities(orderActivities.slice(0, 5));
          setUsingSampleData(false);
        } else {
          // Use sample data for demo purposes
          setActivities(SAMPLE_ACTIVITIES);
          setUsingSampleData(true);
        }
      } catch {
        // On error, show sample data
        setActivities(SAMPLE_ACTIVITIES);
        setUsingSampleData(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchActivity();
  }, [orgId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          {usingSampleData
            ? 'Sample activity preview'
            : 'Latest updates from your organization'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3 py-2">
                <Skeleton className="h-4 w-4 rounded" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity to display.</p>
        ) : (
          <div className="divide-y divide-border">
            {activities.map((activity, index) => (
              <ActivityItemComponent
                key={activity.id}
                item={activity}
                shouldReduceMotion={shouldReduceMotion}
                index={index}
              />
            ))}
          </div>
        )}
        {usingSampleData && !isLoading && (
          <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
            This is sample data. Real activity will appear as orders come in.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
