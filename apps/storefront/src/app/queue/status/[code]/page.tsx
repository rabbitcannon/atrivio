import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getQueuePosition } from '@/lib/api';
import { QueuePositionTracker } from '@/components/queue/queue-position-tracker';

export const metadata: Metadata = {
  title: 'Queue Position',
  description: 'Track your position in the virtual queue',
};

interface QueueStatusPageProps {
  params: Promise<{ code: string }>;
}

export default async function QueueStatusPage({ params }: QueueStatusPageProps) {
  const { code } = await params;
  const confirmationCode = code.toUpperCase();

  const position = await getQueuePosition(confirmationCode);

  // Not found
  if (!position) {
    return (
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4 max-w-md">
          <div className="text-center">
            <h1 className="text-4xl font-heading font-bold mb-4">Not Found</h1>
            <p className="text-lg text-muted-foreground mb-8">
              We couldn&apos;t find a queue entry with code <span className="font-mono font-bold">{confirmationCode}</span>.
            </p>
            <p className="text-muted-foreground text-sm mb-8">
              The code may have expired, or you may have already been served.
            </p>
            <Link
              href="/queue"
              className="inline-flex items-center gap-2 text-storefront-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Queue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">Your Queue Position</h1>
          <p className="text-muted-foreground">{position.attractionName}</p>
        </div>

        <QueuePositionTracker
          initialPosition={position}
          confirmationCode={confirmationCode}
        />

        <div className="mt-8 text-center">
          <Link
            href="/queue"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Queue
          </Link>
        </div>
      </div>
    </div>
  );
}
