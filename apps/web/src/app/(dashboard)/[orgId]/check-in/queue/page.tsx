'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Clock,
  Users,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  RefreshCw,
  User,
  Ticket,
  Calendar,
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

interface QueuedGuest {
  id: string;
  ticketId: string;
  barcode: string;
  customerName: string | null;
  customerEmail: string | null;
  ticketType: string;
  timeSlot: {
    date: string;
    startTime: string;
    endTime: string;
  } | null;
  orderNumber: string;
  status: 'pending' | 'late' | 'arriving_soon';
  minutesUntilSlot: number | null;
}

export default function QueuePage() {
  const params = useParams();
  const orgId = params['orgId'] as string;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [guests, setGuests] = useState<QueuedGuest[]>([]);

  // TODO: Fetch queue data from API
  // useEffect(() => {
  //   fetchQueue();
  // }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    // TODO: Implement refresh API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsLoading(false);
  };

  const handleManualCheckIn = async (guestId: string) => {
    // TODO: Implement manual check-in
    console.log('Manual check-in for:', guestId);
  };

  const getStatusBadge = (status: QueuedGuest['status']) => {
    switch (status) {
      case 'arriving_soon':
        return <Badge variant="default">Arriving Soon</Badge>;
      case 'late':
        return <Badge variant="destructive">Late</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const pendingCount = guests.filter((g) => g.status === 'pending').length;
  const lateCount = guests.filter((g) => g.status === 'late').length;
  const arrivingSoonCount = guests.filter(
    (g) => g.status === 'arriving_soon'
  ).length;

  const filteredGuests = guests.filter((guest) => {
    const matchesSearch =
      !searchQuery ||
      guest.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.barcode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || guest.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Guest Queue</h1>
          <p className="text-muted-foreground">
            View pending arrivals and manage late guests.
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
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
            <div className="text-2xl font-bold">{arrivingSoonCount}</div>
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
            <div className="text-2xl font-bold">{pendingCount}</div>
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
            <div className="text-2xl font-bold text-red-600">{lateCount}</div>
            <p className="text-xs text-muted-foreground">Past their time slot</p>
          </CardContent>
        </Card>
      </div>

      {/* Queue Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All ({guests.length})</TabsTrigger>
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
          />
        </TabsContent>

        <TabsContent value="arriving" className="space-y-4">
          <QueueTable
            guests={filteredGuests.filter((g) => g.status === 'arriving_soon')}
            onCheckIn={handleManualCheckIn}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="late" className="space-y-4">
          <QueueTable
            guests={filteredGuests.filter((g) => g.status === 'late')}
            onCheckIn={handleManualCheckIn}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface QueueTableProps {
  guests: QueuedGuest[];
  onCheckIn: (guestId: string) => void;
  getStatusBadge: (status: QueuedGuest['status']) => React.ReactNode;
}

function QueueTable({ guests, onCheckIn, getStatusBadge }: QueueTableProps) {
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
              <TableHead>Ticket Type</TableHead>
              <TableHead>Time Slot</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guests.map((guest) => (
              <TableRow key={guest.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {guest.customerName || 'Guest'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Order #{guest.orderNumber}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-muted-foreground" />
                    {guest.ticketType}
                  </div>
                </TableCell>
                <TableCell>
                  {guest.timeSlot ? (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm">{guest.timeSlot.date}</p>
                        <p className="text-xs text-muted-foreground">
                          {guest.timeSlot.startTime} - {guest.timeSlot.endTime}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">--</span>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(guest.status)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCheckIn(guest.id)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
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
