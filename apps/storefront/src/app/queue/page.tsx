import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getPublicStorefront, getQueueInfo } from '@/lib/api';
import { QueueStatusChecker } from '@/components/queue/queue-status-checker';
import { JoinQueueForm } from '@/components/queue/join-queue-form';

export const metadata: Metadata = {
  title: 'Virtual Queue',
  description: 'Join the virtual queue or check your position',
};

export default async function QueuePage() {
  const headersList = await headers();
  const identifier = headersList.get('x-storefront-identifier');

  if (!identifier) return null;

  const storefront = await getPublicStorefront(identifier);
  if (!storefront) return null;

  const { attraction } = storefront;
  const queueInfo = await getQueueInfo(attraction.slug);

  // Queue not available for this attraction
  if (!queueInfo) {
    return (
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-heading font-bold mb-4">Virtual Queue</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              The virtual queue is not currently available for {attraction.name}.
            </p>
            <p className="text-muted-foreground text-sm">
              Please visit our box office or check back later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold mb-4">Virtual Queue</h1>
          <p className="text-lg text-muted-foreground">
            Skip the physical line at {attraction.name}
          </p>
        </div>

        {/* Check Your Position */}
        <div className="mb-12">
          <QueueStatusChecker />
        </div>

        {/* Divider */}
        <div className="relative mb-12">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or join the queue
            </span>
          </div>
        </div>

        {/* Queue Status & Join */}
        <JoinQueueForm
          queueInfo={queueInfo}
          attractionSlug={attraction.slug}
          attractionName={attraction.name}
        />
      </div>
    </div>
  );
}
