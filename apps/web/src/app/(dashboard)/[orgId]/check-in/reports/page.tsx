'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Activity,
  Calendar,
  Clock,
  Download,
  TrendingUp,
  Users,
  CheckCircle2,
  XCircle,
  Timer,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

interface CheckInStats {
  totalCheckedIn: number;
  totalExpected: number;
  checkInRate: number;
  averageWaitTime: number;
  peakHour: string;
  successRate: number;
  byTimeSlot: {
    slot: string;
    checkedIn: number;
    expected: number;
  }[];
  byTicketType: {
    type: string;
    count: number;
    percentage: number;
  }[];
  byHour: {
    hour: string;
    count: number;
  }[];
}

export default function ReportsPage() {
  const params = useParams();
  const orgId = params['orgId'] as string;

  const [dateRange, setDateRange] = useState('today');
  const [isLoading, setIsLoading] = useState(false);

  // Mock stats - TODO: Fetch from API
  const stats: CheckInStats = {
    totalCheckedIn: 0,
    totalExpected: 0,
    checkInRate: 0,
    averageWaitTime: 0,
    peakHour: '--',
    successRate: 0,
    byTimeSlot: [],
    byTicketType: [],
    byHour: [],
  };

  const handleExport = async () => {
    // TODO: Implement CSV export
    console.log('Exporting check-in report...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Check-In Reports</h1>
          <p className="text-muted-foreground">
            Analytics and statistics for guest check-ins.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="season">This Season</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Checked In
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCheckedIn}</div>
            <p className="text-xs text-muted-foreground">
              of {stats.totalExpected} expected
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Check-In Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.checkInRate}%</div>
            <Progress value={stats.checkInRate} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
            <Timer className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageWaitTime > 0 ? `${stats.averageWaitTime} min` : '--'}
            </div>
            <p className="text-xs text-muted-foreground">
              From arrival to check-in
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              Successful scans
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Check-ins by Time Slot */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Check-Ins by Time Slot
            </CardTitle>
            <CardDescription>
              Attendance breakdown by scheduled time slot
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.byTimeSlot.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No time slot data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.byTimeSlot.map((slot) => (
                  <div key={slot.slot} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{slot.slot}</span>
                      <span className="text-muted-foreground">
                        {slot.checkedIn} / {slot.expected}
                      </span>
                    </div>
                    <Progress
                      value={
                        slot.expected > 0
                          ? (slot.checkedIn / slot.expected) * 100
                          : 0
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Check-ins by Ticket Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Check-Ins by Ticket Type
            </CardTitle>
            <CardDescription>
              Distribution across ticket categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.byTicketType.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No ticket type data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.byTicketType.map((type) => (
                  <div key={type.type} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{type.type}</span>
                      <span className="text-muted-foreground">
                        {type.count} ({type.percentage}%)
                      </span>
                    </div>
                    <Progress value={type.percentage} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hourly Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Hourly Check-In Distribution
          </CardTitle>
          <CardDescription>
            Check-ins throughout the day. Peak hour: {stats.peakHour}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.byHour.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No check-in data yet</p>
              <p className="text-sm">
                Check-in data will appear here once guests start arriving.
              </p>
            </div>
          ) : (
            <div className="flex items-end justify-between h-48 gap-1">
              {stats.byHour.map((hour) => {
                const maxCount = Math.max(...stats.byHour.map((h) => h.count));
                const height =
                  maxCount > 0 ? (hour.count / maxCount) * 100 : 0;
                return (
                  <div
                    key={hour.hour}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-full bg-primary rounded-t transition-all"
                      style={{ height: `${height}%`, minHeight: '4px' }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {hour.hour}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Successful Scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              First-attempt check-ins
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              Failed Scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              Invalid or duplicate attempts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              Late Arrivals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              Checked in after slot
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
