'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {
  Clock,
  Users,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  RefreshCw,
  User,
  Calendar,
  Loader2,
  Building2,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  getAttractions,
  getCheckInQueue,
  scanCheckIn,
} from '@/lib/api/client';
import type { AttractionListItem, QueueItem, QueueStatus } from '@/lib/api/types';

// Extended QueueItem with computed status for display
interface DisplayQueueItem extends QueueItem {
  displayStatus: 'pending' | 'late' | 'arriving_soon';
}

function QueuePageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const orgId = params['orgId'] as string;

  // Get attractionId from URL or localStorage
  const urlAttractionId = searchParams.get('attractionId');

  const [attractions, setAttractions] = useState<AttractionListItem[]>([]);
  const [selectedAttractionId, setSelectedAttractionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingGuests, setPendingGuests] = useState<QueueItem[]>([]);
  const [lateGuests, setLateGuests] = useState<QueueItem[]>([]);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  // Load attractions on mount
  useEffect(() => {
    async function loadAttractions() {
      try {
        const result = await getAttractions(orgId);
        if (result.data?.data) {
          setAttractions(result.data.data);
          // Determine initial attraction
          const savedAttractionId = localStorage.getItem(`check-in-attraction-${orgId}`);
          const targetId = urlAttractionId || savedAttractionId;
          const defaultAttraction =
            result.data.data.find((a) => a.id === targetId) || result.data.data[0];
          if (defaultAttraction) {
            setSelectedAttractionId(defaultAttraction.id);
          }
        }
      } catch (error) {
        console.error('Failed to load attractions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load attractions',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadAttractions();
  }, [orgId, urlAttractionId, toast]);

  // Load queue data when attraction changes
  const loadQueueData = useCallback(async () => {
    if (!selectedAttractionId) return;

    setIsRefreshing(true);
    try {
      const result = await getCheckInQueue(orgId, selectedAttractionId);
      if (result.data) {
        setPendingGuests(result.data.pending || []);
        setLateGuests(result.data.late || []);
      }
    } catch (error) {
      console.error('Failed to load queue:', error);
      toast({
        title: 'Error',
        description: 'Failed to load queue data',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [orgId, selectedAttractionId, toast]);

  useEffect(() => {
    if (selectedAttractionId) {
      localStorage.setItem(`check-in-attraction-${orgId}`, selectedAttractionId);
      loadQueueData();
    }
  }, [selectedAttractionId, orgId, loadQueueData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!selectedAttractionId) return;
    const interval = setInterval(loadQueueData, 30000);
    return () => clearInterval(interval);
  }, [selectedAttractionId, loadQueueData]);

  const handleAttractionChange = (attractionId: string) => {
    setSelectedAttractionId(attractionId);
  };

  const handleRefresh = async () => {
    await loadQueueData();
  };

  const handleManualCheckIn = async (guest: QueueItem) => {
    if (!selectedAttractionId) return;

    setCheckingIn(guest.ticketId);
    try {
      const response = await scanCheckIn(orgId, selectedAttractionId, {
        barcode: guest.ticketId, // Use ticketId as the barcode/identifier
        method: 'manual_lookup',
      });

      if (response.data?.success) {
        toast({
          title: 'Checked In',
          description: `${guest.guestName || 'Guest'} has been checked in.`,
        });
        // Refresh queue data
        await loadQueueData();
      } else if (response.data?.waiverRequired) {
        toast({
          title: 'Waiver Required',
          description: 'Guest must complete waiver before check-in.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Check-In Failed',
          description: response.data?.message || 'Unable to check in guest',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Check-in failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to check in guest',
        variant: 'destructive',
      });
    } finally {
      setCheckingIn(null);
    }
  };

  const getStatusBadge = (status: 'pending' | 'late' | 'arriving_soon') => {
    switch (status) {
      case 'arriving_soon':
        return <Badge variant="default">Arriving Soon</Badge>;
      case 'late':
        return <Badge variant="destructive">Late</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  // Combine and categorize guests with display status
  const allGuests: DisplayQueueItem[] = [
    ...lateGuests.map((g) => ({ ...g, displayStatus: 'late' as const })),
    ...pendingGuests.map((g) => {
      // Check if arriving soon (within 30 minutes)
      if (g.minutesUntil !== undefined && g.minutesUntil <= 30 && g.minutesUntil >= 0) {
        return { ...g, displayStatus: 'arriving_soon' as const };
      }
      return { ...g, displayStatus: 'pending' as const };
    }),
  ];

  const arrivingSoonCount = allGuests.filter((g) => g.displayStatus === 'arriving_soon').length;
  const pendingCount = allGuests.filter((g) => g.displayStatus === 'pending').length;
  const lateCount = lateGuests.length;

  const filteredGuests = allGuests.filter((guest) => {
    const matchesSearch =
      !searchQuery ||
      guest.guestName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.ticketId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || guest.displayStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-3xl font-bold">Guest Queue</h1>
          <p className="text-muted-foreground">
            View pending arrivals and manage late guests.
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Attractions Found</h3>
            <p className="text-muted-foreground text-center">
              Create an attraction first to view the guest queue.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Guest Queue</h1>
          <p className="text-muted-foreground">
            View pending arrivals and manage late guests.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={selectedAttractionId ?? ''}
            onValueChange={handleAttractionChange}
          >
            <SelectTrigger className="w-[200px]">
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
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing || !selectedAttractionId}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Arriving Soon
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isRefreshing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                arrivingSoonCount
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Expected in next 30 min
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Today
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isRefreshing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                pendingCount
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Not yet checked in
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {isRefreshing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                lateCount
              )}
            </div>
            <p className="text-xs text-muted-foreground">Past their time slot</p>
          </CardContent>
        </Card>
      </div>

      {/* Queue Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All ({allGuests.length})</TabsTrigger>
            <TabsTrigger value="arriving">
              Arriving Soon ({arrivingSoonCount})
            </TabsTrigger>
            <TabsTrigger value="late">Late ({lateCount})</TabsTrigger>
          </TabsList>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search guests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="arriving_soon">Arriving Soon</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="late">Late</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <QueueTable
            guests={filteredGuests}
            onCheckIn={handleManualCheckIn}
            getStatusBadge={getStatusBadge}
            checkingIn={checkingIn}
          />
        </TabsContent>

        <TabsContent value="arriving" className="space-y-4">
          <QueueTable
            guests={filteredGuests.filter((g) => g.displayStatus === 'arriving_soon')}
            onCheckIn={handleManualCheckIn}
            getStatusBadge={getStatusBadge}
            checkingIn={checkingIn}
          />
        </TabsContent>

        <TabsContent value="late" className="space-y-4">
          <QueueTable
            guests={filteredGuests.filter((g) => g.displayStatus === 'late')}
            onCheckIn={handleManualCheckIn}
            getStatusBadge={getStatusBadge}
            checkingIn={checkingIn}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface QueueTableProps {
  guests: DisplayQueueItem[];
  onCheckIn: (guest: QueueItem) => void;
  getStatusBadge: (status: 'pending' | 'late' | 'arriving_soon') => React.ReactNode;
  checkingIn: string | null;
}

function QueueTable({ guests, onCheckIn, getStatusBadge, checkingIn }: QueueTableProps) {
  if (guests.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No guests in queue</p>
            <p className="text-sm">
              All guests have been checked in or no arrivals are expected.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Guest Queue
        </CardTitle>
        <CardDescription>
          {guests.length} guest{guests.length !== 1 ? 's' : ''} in queue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guest</TableHead>
              <TableHead>Time Slot</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guests.map((guest) => (
              <TableRow key={guest.ticketId}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {guest.guestName || 'Guest'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {guest.ticketId.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {guest.timeSlot ? (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{guest.timeSlot}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">General Admission</span>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(guest.displayStatus)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCheckIn(guest)}
                    disabled={checkingIn === guest.ticketId}
                  >
                    {checkingIn === guest.ticketId ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                    )}
                    Check In
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function QueuePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <QueuePageContent />
    </Suspense>
  );
}
