'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  QrCode,
  Scan,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  User,
  Ticket,
  Hash,
  Loader2,
  ArrowLeft,
  FileWarning,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils/cn';
import { scanCheckIn, getAttractions, listStations } from '@/lib/api/client';
import type { CheckInScanResponse, AttractionListItem, CheckInStation } from '@/lib/api/types';

type ScanStatus = 'idle' | 'scanning' | 'success' | 'error' | 'warning';

interface RecentScan {
  success: boolean;
  ticketNumber?: string;
  customerName?: string | null;
  ticketType?: string;
  errorCode?: string;
  errorMessage?: string;
  timestamp: Date;
}

function ScanPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orgId = params['orgId'] as string;
  const attractionIdFromUrl = searchParams.get('attractionId');

  const inputRef = useRef<HTMLInputElement>(null);

  const [barcode, setBarcode] = useState('');
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [result, setResult] = useState<CheckInScanResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);

  // Attraction and station selection
  const [attractions, setAttractions] = useState<AttractionListItem[]>([]);
  const [stations, setStations] = useState<CheckInStation[]>([]);
  const [attractionId, setAttractionId] = useState<string | null>(attractionIdFromUrl);
  const [stationId, setStationId] = useState<string | null>(null);
  const [isLoadingAttractions, setIsLoadingAttractions] = useState(true);

  // Load attractions on mount
  useEffect(() => {
    async function loadAttractions() {
      setIsLoadingAttractions(true);
      try {
        const res = await getAttractions(orgId);
        if (res.data?.data) {
          setAttractions(res.data.data);
          // If no attractionId in URL, use saved or first
          if (!attractionIdFromUrl) {
            const saved = localStorage.getItem(`check-in-attraction-${orgId}`);
            const defaultAttraction = res.data.data.find(a => a.id === saved) || res.data.data[0];
            if (defaultAttraction) {
              setAttractionId(defaultAttraction.id);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load attractions:', error);
      } finally {
        setIsLoadingAttractions(false);
      }
    }
    loadAttractions();
  }, [orgId, attractionIdFromUrl]);

  // Load stations when attraction changes
  useEffect(() => {
    if (!attractionId) return;

    async function loadStations() {
      try {
        const res = await listStations(orgId, attractionId!);
        if (res.data?.stations) {
          setStations(res.data.stations);
          // Auto-select first active station
          const activeStation = res.data.stations.find(s => s.isActive);
          if (activeStation && !stationId) {
            setStationId(activeStation.id);
          }
        }
      } catch (error) {
        console.error('Failed to load stations:', error);
      }
    }
    loadStations();
  }, [orgId, attractionId, stationId]);

  // Auto-focus the input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Re-focus input after processing
  useEffect(() => {
    if (!isProcessing && status !== 'idle') {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isProcessing, status]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim() || isProcessing || !attractionId) return;

    setIsProcessing(true);
    setStatus('scanning');

    try {
      const response = await scanCheckIn(orgId, attractionId, {
        barcode: barcode.trim(),
        method: 'barcode_scan',
        stationId: stationId || undefined,
      });

      if (response.error) {
        setResult({
          success: false,
          error: response.error.error || 'UNKNOWN_ERROR',
          message: response.error.message,
          waiverRequired: false,
          waiverSigned: false,
        });
        setStatus('error');
        setRecentScans((prev) => [
          {
            success: false,
            errorCode: response.error?.error || 'UNKNOWN_ERROR',
            errorMessage: response.error?.message,
            timestamp: new Date(),
          },
          ...prev,
        ].slice(0, 10));
      } else if (response.data) {
        const data = response.data;
        setResult(data);

        if (data.success) {
          setStatus('success');
          setRecentScans((prev) => [
            {
              success: true,
              ticketNumber: data.ticket?.ticketNumber,
              customerName: data.ticket?.guestName,
              ticketType: data.ticket?.ticketType,
              timestamp: new Date(),
            },
            ...prev,
          ].slice(0, 10));
        } else if (data.requiresWaiver) {
          setStatus('warning');
          setRecentScans((prev) => [
            {
              success: false,
              errorCode: 'WAIVER_REQUIRED',
              errorMessage: 'Guest must sign waiver',
              ticketNumber: data.ticket?.ticketNumber,
              timestamp: new Date(),
            },
            ...prev,
          ].slice(0, 10));
        } else {
          setStatus('error');
          setRecentScans((prev) => [
            {
              success: false,
              errorCode: data.error || 'CHECK_IN_FAILED',
              errorMessage: data.message,
              timestamp: new Date(),
            },
            ...prev,
          ].slice(0, 10));
        }
      }
    } catch (err) {
      console.error('Scan error:', err);
      setResult({
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Failed to connect to server',
        waiverRequired: false,
        waiverSigned: false,
      });
      setStatus('error');
      setRecentScans((prev) => [
        {
          success: false,
          errorCode: 'NETWORK_ERROR',
          errorMessage: 'Failed to connect to server',
          timestamp: new Date(),
        },
        ...prev,
      ].slice(0, 10));
    } finally {
      setIsProcessing(false);
      setBarcode('');
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-500/10 border-green-500';
      case 'error':
        return 'bg-red-500/10 border-red-500';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500';
      case 'scanning':
        return 'bg-blue-500/10 border-blue-500';
      default:
        return 'bg-muted border-border';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-16 w-16 text-green-500" />;
      case 'error':
        return <XCircle className="h-16 w-16 text-red-500" />;
      case 'warning':
        return <FileWarning className="h-16 w-16 text-yellow-500" />;
      case 'scanning':
        return <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />;
      default:
        return <QrCode className="h-16 w-16 text-muted-foreground" />;
    }
  };

  if (isLoadingAttractions) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (attractions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/${orgId}/check-in`}>
            <Button variant="ghost" size="icon" aria-label="Back to check-in">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Scan Tickets</h1>
            <p className="text-muted-foreground">No attractions available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${orgId}/check-in`}>
          <Button variant="ghost" size="icon" aria-label="Back to check-in">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Scan Tickets</h1>
          <p className="text-muted-foreground">
            Scan barcodes or QR codes to check in guests.
          </p>
        </div>
      </div>

      {/* Attraction & Station Selection */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Attraction</Label>
          <Select value={attractionId ?? ''} onValueChange={setAttractionId}>
            <SelectTrigger>
              <SelectValue placeholder="Select attraction" />
            </SelectTrigger>
            <SelectContent>
              {attractions.map((attr) => (
                <SelectItem key={attr.id} value={attr.id}>
                  {attr.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Station (optional)</Label>
          <Select value={stationId ?? 'none'} onValueChange={(v) => setStationId(v === 'none' ? null : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select station" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No station</SelectItem>
              {stations.filter(s => s.isActive).map((station) => (
                <SelectItem key={station.id} value={station.id}>
                  {station.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Scan Input Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="h-5 w-5" />
              Scanner Input
            </CardTitle>
            <CardDescription>
              Use a barcode scanner or enter the ticket code manually.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleScan} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="barcode">Ticket Barcode / QR Code</Label>
                <Input
                  ref={inputRef}
                  id="barcode"
                  placeholder="Scan or enter ticket code..."
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  disabled={isProcessing || !attractionId}
                  autoComplete="off"
                  className="text-lg font-mono"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={!barcode.trim() || isProcessing || !attractionId}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Scan className="h-4 w-4 mr-2" />
                    Check In
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Result Display Card */}
        <Card
          className={cn(
            'lg:col-span-1 transition-all duration-300 border-2',
            getStatusColor()
          )}
        >
          <CardHeader>
            <CardTitle>Scan Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              {getStatusIcon()}
              {status === 'idle' ? (
                <p className="text-muted-foreground text-center">
                  Ready to scan. Enter a ticket code to check in a guest.
                </p>
              ) : status === 'scanning' ? (
                <p className="text-blue-600 font-medium">Processing scan...</p>
              ) : result?.success ? (
                <div className="w-full space-y-4">
                  <p className="text-green-600 font-bold text-xl text-center">
                    Check-In Successful!
                  </p>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{result.ticket?.guestName || 'Guest'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-muted-foreground" />
                      <span>{result.ticket?.ticketType}</span>
                    </div>
                    {result.ticket?.ticketNumber && (
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span>Ticket #{result.ticket.ticketNumber}</span>
                      </div>
                    )}
                    {result.ticket?.timeSlot && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{result.ticket.timeSlot}</span>
                      </div>
                    )}
                    {result.order && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                        <span className="text-muted-foreground">Order Progress:</span>
                        <span className="font-medium">
                          {result.order.checkedInCount} / {result.order.ticketCount} checked in
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : result?.requiresWaiver ? (
                <div className="w-full space-y-4">
                  <p className="text-yellow-600 font-bold text-xl text-center">
                    Waiver Required
                  </p>
                  <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-lg p-4">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      This guest must sign a waiver before check-in.
                    </p>
                    {result.ticket && (
                      <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                        <p>Ticket: {result.ticket.ticketNumber}</p>
                        <p>Type: {result.ticket.ticketType}</p>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      // Navigate to waiver signing page (could be implemented later)
                      alert('Waiver signing UI would open here');
                    }}
                  >
                    <FileWarning className="h-4 w-4 mr-2" />
                    Sign Waiver
                  </Button>
                </div>
              ) : (
                <div className="w-full space-y-4">
                  <p className="text-red-600 font-bold text-xl text-center">
                    Check-In Failed
                  </p>
                  <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-4">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      {result?.message || 'Unknown error occurred'}
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Error Code: {result?.error}
                    </p>
                    {result?.checkedInAt && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Already checked in at: {new Date(result.checkedInAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Scans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Scans
          </CardTitle>
          <CardDescription>
            Last {Math.min(recentScans.length, 10)} check-in attempts this session.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentScans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <QrCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No scans yet this session.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentScans.map((scan, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border',
                    scan.success
                      ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {scan.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      {scan.success ? (
                        <>
                          <p className="font-medium">
                            {scan.customerName || 'Guest'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {scan.ticketType} - #{scan.ticketNumber}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-medium text-red-700 dark:text-red-300">
                            {scan.errorCode}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {scan.errorMessage}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {scan.timestamp.toLocaleTimeString()}
                    </span>
                    <Badge variant={scan.success ? 'default' : 'destructive'}>
                      {scan.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <ScanPageContent />
    </Suspense>
  );
}
