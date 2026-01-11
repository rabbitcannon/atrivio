'use client';

import { AlertCircle, Clock, DollarSign, ExternalLink, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getMyTimeStatus, getStaffMember, getTimeEntries } from '@/lib/api/client';
import { AnimatedNumber, LoadingTransition } from './animated-dashboard';

interface MyHoursWidgetProps {
  orgId: string;
  orgSlug: string;
}

function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function formatMoney(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

function getWeekRange(): { start: string; end: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  // Start of week (Sunday)
  const start = new Date(now);
  start.setDate(now.getDate() - dayOfWeek);
  start.setHours(0, 0, 0, 0);
  // End of week (Saturday)
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return {
    start: start.toISOString().split('T')[0]!,
    end: end.toISOString().split('T')[0]!,
  };
}

export function MyHoursWidget({ orgId, orgSlug }: MyHoursWidgetProps) {
  const [totalHours, setTotalHours] = useState<number>(0);
  const [hourlyRate, setHourlyRate] = useState<number | null>(null);
  const [pendingApproval, setPendingApproval] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHours() {
      try {
        setIsLoading(true);
        setError(null);

        // First get the staff ID from time status
        const statusResponse = await getMyTimeStatus(orgId);
        if (statusResponse.error || !statusResponse.data) {
          // User might not be a staff member
          setIsLoading(false);
          return;
        }

        const staffId = statusResponse.data.staff_id;
        const { start, end } = getWeekRange();

        // Fetch staff profile and time entries in parallel
        const [staffResponse, entriesResponse] = await Promise.all([
          getStaffMember(orgId, staffId),
          getTimeEntries(orgId, staffId, { start_date: start, end_date: end }),
        ]);

        if (staffResponse.error) {
          setError(staffResponse.error.message || 'Failed to load profile');
          return;
        }

        if (entriesResponse.error) {
          setError(entriesResponse.error.message || 'Failed to load hours');
          return;
        }

        // Set hourly rate (stored in cents in DB)
        setHourlyRate(staffResponse.data?.hourly_rate ?? null);

        // Set hours from summary
        const summary = entriesResponse.data?.summary;
        setTotalHours(summary?.total_hours ?? 0);
        setPendingApproval(summary?.pending_approval ?? 0);
      } catch {
        setError('Failed to load hours');
      } finally {
        setIsLoading(false);
      }
    }
    fetchHours();
  }, [orgId]);

  const estimatedPay = hourlyRate && totalHours > 0 ? Math.round(hourlyRate * totalHours) : null;

  const skeletonContent = <Skeleton className="h-20 w-full" />;

  const mainContent = (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-3 w-3" />
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {!error && (
        <>
          {/* Hours This Week */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">This Week</p>
                <p className="text-2xl font-bold mt-1">
                  {totalHours > 0 ? (
                    <>
                      <AnimatedNumber
                        value={Math.floor(totalHours)}
                        duration={0.8}
                        formatFn={(v) => Math.round(v).toString()}
                      />
                      h
                      {totalHours % 1 > 0 && (
                        <>
                          {' '}
                          <AnimatedNumber
                            value={Math.round((totalHours % 1) * 60)}
                            duration={0.8}
                            formatFn={(v) => Math.round(v).toString()}
                          />
                          m
                        </>
                      )}
                    </>
                  ) : (
                    '0h'
                  )}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            {pendingApproval > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {pendingApproval} {pendingApproval === 1 ? 'entry' : 'entries'} pending approval
              </p>
            )}
          </div>

          {/* Estimated Pay */}
          {estimatedPay !== null && (
            <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 dark:text-green-400 uppercase tracking-wide">
                    Estimated Pay
                  </p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">
                    $
                    <AnimatedNumber
                      value={estimatedPay / 100}
                      duration={1}
                      formatFn={(v) => v.toFixed(2)}
                    />
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              {hourlyRate && (
                <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-2">
                  {formatMoney(hourlyRate)}/hr × {formatHours(totalHours)}
                </p>
              )}
            </div>
          )}

          {/* No pay rate set */}
          {hourlyRate === null && totalHours > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              Pay rate not set. Contact your manager.
            </p>
          )}

          {/* No hours this week */}
          {totalHours === 0 && (
            <p className="text-xs text-muted-foreground text-center">No hours logged this week</p>
          )}
        </>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            My Hours
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/${orgSlug}/my-time`}>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <LoadingTransition isLoading={isLoading} skeleton={skeletonContent}>
          {mainContent}
        </LoadingTransition>
      </CardContent>
    </Card>
  );
}
