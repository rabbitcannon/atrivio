'use client';

import {
  ArrowUpIcon,
  Calendar,
  Loader2,
  Star,
  Ticket,
  TrendingUp,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
import { UpgradePrompt } from '@/components/features/upgrade-prompt';
import {
  getAnalyticsTickets,
  getAttractions,
  getRequiredTier,
  isFeatureNotEnabledError,
  type AnalyticsQueryParams,
  type ApiError,
} from '@/lib/api/client';
import type { AttractionListItem, AnalyticsPeriod, TicketAnalyticsResponse } from '@/lib/api/types';
import { formatCurrency } from '@atrivio/shared/utils/money';

const EASE = [0.4, 0, 0.2, 1] as const;

const PERIOD_OPTIONS: { value: AnalyticsPeriod; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'Last 30 Days' },
  { value: 'quarter', label: 'Last 90 Days' },
  { value: 'year', label: 'Last 12 Months' },
];

function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  iconColor: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

export default function TicketsAnalyticsPage() {
  const params = useParams();
  const shouldReduceMotion = useReducedMotion();
  const orgId = params['orgId'] as string;

  const [attractions, setAttractions] = useState<AttractionListItem[]>([]);
  const [selectedAttraction, setSelectedAttraction] = useState<string>('all');
  const [period, setPeriod] = useState<AnalyticsPeriod>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<TicketAnalyticsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [featureError, setFeatureError] = useState<ApiError | null>(null);

  useEffect(() => {
    async function loadAttractions() {
      try {
        const res = await getAttractions(orgId);
        if (res.data?.data) {
          setAttractions(res.data.data);
        }
      } catch {
        // Non-critical
      }
    }
    loadAttractions();
  }, [orgId]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setFeatureError(null);

    try {
      const queryParams: AnalyticsQueryParams = { period };
      if (selectedAttraction !== 'all') {
        queryParams.attractionId = selectedAttraction;
      }

      const res = await getAnalyticsTickets(orgId, queryParams);
      if (res.error) {
        if (isFeatureNotEnabledError(res.error)) {
          setFeatureError(res.error);
        } else {
          setError(res.error.message);
        }
      } else if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ticket analytics');
    } finally {
      setIsLoading(false);
    }
  }, [orgId, period, selectedAttraction]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sort ticket types by revenue for display
  const sortedTicketTypes = [...(data?.ticketTypes || [])].sort((a, b) => b.revenue - a.revenue);
  const topPerformer = sortedTicketTypes[0];

  return (
    <div className="space-y-6">
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="flex flex-col gap-2"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Ticket className="h-8 w-8 text-purple-500" />
              Ticket Performance
            </h1>
            <p className="text-muted-foreground">
              Analyze ticket type sales and check-in rates.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE, delay: 0.1 }}
        className="flex flex-wrap gap-4"
      >
        <Select value={period} onValueChange={(v) => setPeriod(v as AnalyticsPeriod)}>
          <SelectTrigger className="w-48">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {attractions.length > 0 && (
          <Select value={selectedAttraction} onValueChange={setSelectedAttraction}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All attractions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Attractions</SelectItem>
              {attractions.map((attr) => (
                <SelectItem key={attr.id} value={attr.id}>
                  {attr.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button variant="outline" onClick={loadData} disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Refresh
        </Button>
      </motion.div>

      {featureError && (
        <UpgradePrompt
          feature="Ticket Analytics"
          description="Track ticket type performance, sales metrics, and check-in rates."
          requiredTier={getRequiredTier(featureError)}
        />
      )}

      {error && !featureError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={loadData}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : data ? (
        <>
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Ticket Types"
              value={data.totalTicketTypes}
              subtitle="Active ticket types"
              icon={Ticket}
              iconColor="text-purple-500"
            />
            <StatsCard
              title="Total Sold"
              value={data.totalQuantitySold.toLocaleString()}
              subtitle="Tickets sold"
              icon={TrendingUp}
              iconColor="text-blue-500"
            />
            <StatsCard
              title="Total Revenue"
              value={formatCurrency(data.totalRevenue)}
              icon={ArrowUpIcon}
              iconColor="text-green-500"
            />
            <StatsCard
              title="Top Performer"
              value={sortedTicketTypes[0]?.name || 'N/A'}
              subtitle={sortedTicketTypes[0] ? `${sortedTicketTypes[0].checkInRate.toFixed(0)}% check-in rate` : ''}
              icon={Star}
              iconColor="text-orange-500"
            />
          </div>

          {/* Top Performer Highlight */}
          {topPerformer && (
            <Card className="border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Top Performing Ticket
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold">{topPerformer.name}</h3>
                    <Badge variant="outline" className="mt-1">
                      {topPerformer.attractionName}
                    </Badge>
                  </div>
                  <div className="flex gap-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Sold</p>
                      <p className="text-2xl font-bold">{topPerformer.quantitySold.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Revenue</p>
                      <p className="text-2xl font-bold">{formatCurrency(topPerformer.revenue)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Check-In Rate</p>
                      <p className="text-2xl font-bold">{topPerformer.checkInRate.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ticket Types Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Type Performance</CardTitle>
              <CardDescription>
                {data.startDate} - {data.endDate}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket Type</TableHead>
                    <TableHead>Attraction</TableHead>
                    <TableHead className="text-right">Sold</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Check-Ins</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Avg/Order</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTicketTypes.length > 0 ? (
                    sortedTicketTypes.map((ticket, index) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {index === 0 && (
                              <Star className="h-4 w-4 text-yellow-500" />
                            )}
                            {ticket.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{ticket.attractionName}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {ticket.quantitySold.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(ticket.revenue)}
                        </TableCell>
                        <TableCell className="text-right">
                          {ticket.checkedIn.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Progress
                              value={ticket.checkInRate}
                              className="w-16 h-2"
                            />
                            <span className="w-12 text-right">
                              {ticket.checkInRate.toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {ticket.avgPerOrder.toFixed(1)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No ticket data for this period
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Performance Summary Cards */}
          {sortedTicketTypes.length > 1 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Highest Revenue */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Highest Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-bold">{sortedTicketTypes[0].name}</p>
                  <p className="text-2xl font-bold text-green-500">
                    {formatCurrency(sortedTicketTypes[0].revenue)}
                  </p>
                </CardContent>
              </Card>

              {/* Best Check-In Rate */}
              {(() => {
                const bestRate = [...sortedTicketTypes].sort((a, b) => b.checkInRate - a.checkInRate)[0];
                return (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Best Check-In Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-bold">{bestRate.name}</p>
                      <p className="text-2xl font-bold text-blue-500">
                        {bestRate.checkInRate.toFixed(1)}%
                      </p>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Most Popular (by quantity) */}
              {(() => {
                const mostPopular = [...sortedTicketTypes].sort((a, b) => b.quantitySold - a.quantitySold)[0];
                return (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Most Popular
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-bold">{mostPopular.name}</p>
                      <p className="text-2xl font-bold text-purple-500">
                        {mostPopular.quantitySold.toLocaleString()} sold
                      </p>
                    </CardContent>
                  </Card>
                );
              })()}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
