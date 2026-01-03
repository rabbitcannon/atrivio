'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
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
import { cn } from '@/lib/utils/cn';

interface CheckInResult {
  success: boolean;
  checkIn?: {
    id: string;
    ticketId: string;
    status: string;
    checkedInAt: string;
    ticketType: string;
    customerName: string | null;
    orderNumber: string | null;
    timeSlot: {
      date: string;
      startTime: string;
      endTime: string;
    } | null;
  };
  error?: {
    code: string;
    message: string;
  };
}

type ScanStatus = 'idle' | 'scanning' | 'success' | 'error' | 'warning';

export default function ScanPage() {
  const params = useParams();
  const orgId = params['orgId'] as string;
  const inputRef = useRef<HTMLInputElement>(null);

  const [barcode, setBarcode] = useState('');
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentScans, setRecentScans] = useState<CheckInResult[]>([]);

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
    if (!barcode.trim() || isProcessing) return;

    setIsProcessing(true);
    setStatus('scanning');

    try {
      // TODO: Implement actual API call
      // const response = await fetch(`/api/v1/organizations/${orgId}/check-ins/scan`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ barcode: barcode.trim(), method: 'barcode_scan' }),
      // });
      // const data = await response.json();

      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock response - in real implementation, parse API response
      const mockResult: CheckInResult = {
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'Check-in API integration pending',
        },
      };

      setResult(mockResult);
      setStatus(mockResult.success ? 'success' : 'error');

      // Add to recent scans
      setRecentScans((prev) => [mockResult, ...prev].slice(0, 10));
    } catch {
      setResult({
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to connect to server',
        },
      });
      setStatus('error');
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
        return <AlertTriangle className="h-16 w-16 text-yellow-500" />;
      case 'scanning':
        return <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />;
      default:
        return <QrCode className="h-16 w-16 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Scan Tickets</h1>
        <p className="text-muted-foreground">
          Scan barcodes or QR codes to check in guests.
        </p>
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
                  disabled={isProcessing}
                  autoComplete="off"
                  className="text-lg font-mono"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={!barcode.trim() || isProcessing}
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
                      <span>{result.checkIn?.customerName || 'Guest'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-muted-foreground" />
                      <span>{result.checkIn?.ticketType}</span>
                    </div>
                    {result.checkIn?.orderNumber && (
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span>Order #{result.checkIn.orderNumber}</span>
                      </div>
                    )}
                    {result.checkIn?.timeSlot && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {result.checkIn.timeSlot.date} at{' '}
                          {result.checkIn.timeSlot.startTime}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full space-y-4">
                  <p className="text-red-600 font-bold text-xl text-center">
                    Check-In Failed
                  </p>
                  <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-4">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      {result?.error?.message || 'Unknown error occurred'}
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Error Code: {result?.error?.code}
                    </p>
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
            Last {Math.min(recentScans.length, 10)} check-in attempts this
            session.
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
                            {scan.checkIn?.customerName || 'Guest'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {scan.checkIn?.ticketType}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-medium text-red-700 dark:text-red-300">
                            {scan.error?.code}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {scan.error?.message}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge variant={scan.success ? 'default' : 'destructive'}>
                    {scan.success ? 'Success' : 'Failed'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
