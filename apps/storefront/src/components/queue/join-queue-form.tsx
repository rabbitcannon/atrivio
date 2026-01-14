'use client';

import {
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Users,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { joinQueue, type JoinQueueRequest, type QueueInfo } from '@/lib/api';

interface JoinQueueFormProps {
  queueInfo: QueueInfo;
  attractionSlug: string;
  attractionName: string;
}

interface FormState {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  partySize: number;
}

export function JoinQueueForm({
  queueInfo,
  attractionSlug,
  attractionName,
}: JoinQueueFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    partySize: 1,
  });

  const canJoin = queueInfo.status === 'accepting';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canJoin || !formData.guestName.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const payload: JoinQueueRequest = {
      guestName: formData.guestName.trim(),
      partySize: formData.partySize,
    };
    if (formData.guestEmail?.trim()) {
      payload.guestEmail = formData.guestEmail.trim();
    }
    if (formData.guestPhone?.trim()) {
      payload.guestPhone = formData.guestPhone.trim();
    }
    const { data, error: apiError } = await joinQueue(attractionSlug, payload);

    setIsSubmitting(false);

    if (apiError) {
      // Check if already in queue
      if (apiError.statusCode === 409 && apiError.existingCode) {
        router.push(`/queue/status/${apiError.existingCode}`);
        return;
      }
      setError(apiError.message);
      return;
    }

    if (data) {
      router.push(`/queue/status/${data.confirmationCode}`);
    }
  };

  const getStatusInfo = () => {
    switch (queueInfo.status) {
      case 'accepting':
        return {
          icon: CheckCircle,
          iconColor: 'text-green-500',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20',
          title: 'Queue is Open',
          description: queueInfo.message,
        };
      case 'paused':
        return {
          icon: Clock,
          iconColor: 'text-amber-500',
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/20',
          title: 'Queue is Paused',
          description: 'The queue is temporarily paused. Please check back shortly.',
        };
      case 'full':
        return {
          icon: Users,
          iconColor: 'text-orange-500',
          bgColor: 'bg-orange-500/10',
          borderColor: 'border-orange-500/20',
          title: 'Queue is Full',
          description: 'The queue is at capacity. Please try again later.',
        };
      case 'closed':
      default:
        return {
          icon: XCircle,
          iconColor: 'text-red-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
          title: 'Queue is Closed',
          description: 'The virtual queue is currently closed.',
        };
    }
  };

  const status = getStatusInfo();
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      {/* Queue Status Card */}
      <div className={`rounded-xl border ${status.borderColor} ${status.bgColor} p-6`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-full ${status.bgColor} flex items-center justify-center flex-shrink-0`}>
            <StatusIcon className={`h-6 w-6 ${status.iconColor}`} />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-lg">{status.title}</h2>
            <p className="text-muted-foreground">{status.description}</p>

            {canJoin && (
              <div className="flex items-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{queueInfo.peopleInQueue} in line</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>~{queueInfo.currentWaitMinutes} min wait</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Join Queue Form */}
      {canJoin && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-4">Join the Queue</h3>

          {error && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="guestName" className="block text-sm font-medium mb-1.5">
                Your Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                id="guestName"
                value={formData.guestName}
                onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                placeholder="Enter your name"
                required
                className="w-full h-11 rounded-md border border-input bg-background px-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                maxLength={200}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="guestEmail" className="block text-sm font-medium mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  id="guestEmail"
                  value={formData.guestEmail}
                  onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                  placeholder="For notifications"
                  className="w-full h-11 rounded-md border border-input bg-background px-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div>
                <label htmlFor="guestPhone" className="block text-sm font-medium mb-1.5">
                  Phone
                </label>
                <input
                  type="tel"
                  id="guestPhone"
                  value={formData.guestPhone}
                  onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                  placeholder="For SMS alerts"
                  className="w-full h-11 rounded-md border border-input bg-background px-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  maxLength={20}
                />
              </div>
            </div>

            <div>
              <label htmlFor="partySize" className="block text-sm font-medium mb-1.5">
                Party Size
              </label>
              <select
                id="partySize"
                value={formData.partySize}
                onChange={(e) => setFormData({ ...formData, partySize: parseInt(e.target.value) })}
                className="w-full h-11 rounded-md border border-input bg-background px-3 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((size) => (
                  <option key={size} value={size}>
                    {size} {size === 1 ? 'person' : 'people'}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !formData.guestName.trim()}
              className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-md bg-storefront-primary text-white font-medium hover:bg-storefront-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Joining Queue...
                </>
              ) : (
                `Join Queue for ${attractionName}`
              )}
            </button>

            <p className="text-xs text-muted-foreground text-center">
              You&apos;ll receive a confirmation code to track your position.
            </p>
          </form>
        </div>
      )}

      {/* Closed state - no form */}
      {!canJoin && (
        <div className="text-center text-muted-foreground">
          <p>Please check back later or visit our box office.</p>
        </div>
      )}
    </div>
  );
}
