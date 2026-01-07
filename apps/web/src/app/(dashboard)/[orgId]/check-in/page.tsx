'use client';

import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  Gauge,
  Loader2,
  MonitorSmartphone,
  QrCode,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAttractions, getCapacity, getCheckInQueue, getCheckInStats } from '@/lib/api/client';
import type {
  AttractionListItem,
  CapacityResponse,
  CheckInStats,
  QueueResponse,
} from '@/lib/api/types';

const NAV_ITEMS = [
  {
    title: 'Scan Tickets',
    description: 'Scan barcodes or QR codes to check in guests',
    href: '/check-in/scan',
    icon: QrCode,
  },
  {
    title: 'Stations',
    description: 'Manage check-in stations and devices',
    href: '/check-in/stations',
    icon: MonitorSmartphone,
  },
  {
    title: 'Queue',
    description: 'View pending arrivals and late guests',
    href: '/check-in/queue',
    icon: Clock,
  },
  {
    title: 'Reports',
    description: 'Check-in statistics and analytics',
    href: '/check-in/reports',
    icon: Activity,
  },
];

export default function CheckInPage() {
  const params = useParams();
  const orgIdentifier = params['orgId'] as string;

  const [attractions, setAttractions] = useState<AttractionListItem[]>([]);
  const [selectedAttractionId, setSelectedAttractionId] = useState<string | null>(null);
  const [stats, setStats] = useState<CheckInStats | null>(null);
  const [capacity, setCapacity] = useState<CapacityResponse | null>(null);
  const [queue, setQueue] = useState<QueueResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Load attractions on mount
  useEffect(() => {
    async function loadAttractions() {
      setIsLoading(true);
      try {
        const result = await getAttractions(orgIdentifier);
        if (result.data?.data) {
          setAttractions(result.data.data);
          // Auto-select first attraction or retrieve from localStorage
          const savedAttractionId = localStorage.getItem(`check-in-attraction-${orgIdentifier}`);
          const defaultAttraction =
            result.data.data.find((a) => a.id === savedAttractionId) || result.data.data[0];
          if (defaultAttraction) {
            setSelectedAttractionId(defaultAttraction.id);
          }
        }
      } catch (_error) {
      } finally {
        setIsLoading(false);
      }
    }
    loadAttractions();
  }, [orgIdentifier]);

  // Load stats when attraction changes
  useEffect(() => {
    if (!selectedAttractionId) return;

    // Save selection to localStorage
    localStorage.setItem(`check-in-attraction-${orgIdentifier}`, selectedAttractionId);

    async function loadStats() {
      setIsLoadingStats(true);
      try {
        const [statsResult, capacityResult, queueResult] = await Promise.all([
          getCheckInStats(orgIdentifier, selectedAttractionId!),
          getCapacity(orgIdentifier, selectedAttractionId!),
          getCheckInQueue(orgIdentifier, selectedAttractionId!),
        ]);

        if (statsResult.data) setStats(statsResult.data);
        if (capacityResult.data) setCapacity(capacityResult.data);
        if (queueResult.data) setQueue(queueResult.data);
      } catch (_error) {
      } finally {
        setIsLoadingStats(false);
      }
    }
    loadStats();
  }, [orgIdentifier, selectedAttractionId]);

  const handleAttractionChange = (attractionId: string) => {
    setSelectedAttractionId(attractionId);
  };

  const selectedAttraction = attractions.find((a) => a.id === selectedAttractionId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (attractions.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Check-In</h1>
          <p className="text-muted-foreground">
            Manage guest check-ins, stations, and monitor capacity.
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Attractions Found</h3>
            <p className="text-muted-foreground text-center">
              Create an attraction first to start using check-in features.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const lateCount = queue?.late.length ?? 0;
  const pendingCount = queue?.pending.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Check-In</h1>
          <p className="text-muted-foreground">
            Manage guest check-ins, stations, and monitor capacity.
          </p>
        </div>
        <div className="w-full sm:w-64">
          <Select value={selectedAttractionId ?? ''} onValueChange={handleAttractionChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select attraction" />
            </SelectTrigger>
            <SelectContent>
              {attractions.map((attraction) => (
                <SelectItem key={attraction.id} value={attraction.id}>
                  {attraction.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Checked In Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                (stats?.totalCheckedIn ?? '--')
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              of {stats?.totalExpected ?? '--'} expected
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Capacity</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : capacity ? (
                `${capacity.percentage}%`
              ) : (
                '--%'
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {capacity ? `${capacity.currentCount} / ${capacity.capacity}` : 'Of max capacity'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Arrivals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? <Loader2 className="h-5 w-5 animate-spin" /> : pendingCount}
            </div>
            <p className="text-xs text-muted-foreground">Expected soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? <Loader2 className="h-5 w-5 animate-spin" /> : lateCount}
            </div>
            <p className="text-xs text-muted-foreground">Past their slot</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={`/${orgIdentifier}${item.href}?attractionId=${selectedAttractionId}`}
          >
            <Card className="transition-colors hover:bg-muted/50 cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Current Attraction Info */}
      {selectedAttraction && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Currently viewing: {selectedAttraction.name}
            </CardTitle>
            <CardDescription>
              {selectedAttraction.type_name || selectedAttraction.type}
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
