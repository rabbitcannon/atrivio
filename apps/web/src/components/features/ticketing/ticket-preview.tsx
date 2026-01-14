'use client';

import { QRCodeSVG } from 'qrcode.react';
import { motion, useReducedMotion } from 'motion/react';
import { Calendar, Clock, MapPin, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface TicketPreviewProps {
  /** Ticket number to display */
  ticketNumber?: string;
  /** Barcode/QR code data */
  barcode?: string;
  /** Attraction name */
  attractionName?: string;
  /** Event date */
  eventDate?: string;
  /** Time slot */
  timeSlot?: string;
  /** Ticket type name */
  ticketType?: string;
  /** Location */
  location?: string;
  /** Whether to animate on mount */
  animate?: boolean;
  /** Additional className */
  className?: string;
}

// Sample ticket data for demo purposes
const SAMPLE_TICKET = {
  ticketNumber: 'SPKY-2024-001234',
  barcode: 'DEMO-TICKET-QR-2024',
  attractionName: 'Nightmare Manor',
  eventDate: 'Saturday, Oct 31, 2024',
  timeSlot: '8:00 PM - 9:00 PM',
  ticketType: 'General Admission',
  location: '123 Haunted Lane, Spookyville',
};

/**
 * Realistic ticket preview component for demos.
 * Shows a sample ticket with QR code for demonstrations.
 */
export function TicketPreview({
  ticketNumber = SAMPLE_TICKET.ticketNumber,
  barcode = SAMPLE_TICKET.barcode,
  attractionName = SAMPLE_TICKET.attractionName,
  eventDate = SAMPLE_TICKET.eventDate,
  timeSlot = SAMPLE_TICKET.timeSlot,
  ticketType = SAMPLE_TICKET.ticketType,
  location = SAMPLE_TICKET.location,
  animate = true,
  className,
}: TicketPreviewProps) {
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = animate && !shouldReduceMotion;

  const ticketContent = (
    <div
      className={cn(
        'relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl',
        className
      )}
    >
      {/* Decorative perforated edge */}
      <div className="absolute left-0 right-0 top-[45%] flex justify-between">
        <div className="h-6 w-6 -translate-x-3 rounded-full bg-gray-100 dark:bg-gray-950" />
        <div className="h-6 w-6 translate-x-3 rounded-full bg-gray-100 dark:bg-gray-950" />
      </div>
      <div className="absolute left-6 right-6 top-[45%] border-t-2 border-dashed border-gray-200" />

      {/* Top section - Event info */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 text-white">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-purple-200">
              <Ticket className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">E-Ticket</span>
            </div>
            <h3 className="mt-1 text-xl font-bold">{attractionName}</h3>
          </div>
          <div className="text-right">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
              {ticketType}
            </span>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-300" />
            <span>{eventDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-300" />
            <span>{timeSlot}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-purple-300" />
            <span className="truncate">{location}</span>
          </div>
        </div>
      </div>

      {/* Bottom section - QR Code */}
      <div className="flex flex-col items-center px-6 pb-6 pt-8">
        <div className="rounded-xl bg-white p-4 shadow-inner ring-1 ring-gray-100">
          <QRCodeSVG
            value={barcode}
            size={140}
            level="M"
            includeMargin={false}
            bgColor="#ffffff"
            fgColor="#1f2937"
          />
        </div>
        <p className="mt-4 font-mono text-lg font-bold tracking-wider text-gray-900">
          {ticketNumber}
        </p>
        <p className="mt-1 text-xs text-gray-500">Scan this code at the entrance</p>
      </div>
    </div>
  );

  if (shouldAnimate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, rotateX: -15 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{
          duration: 0.6,
          ease: [0.4, 0, 0.2, 1],
        }}
        style={{ perspective: 1000 }}
      >
        {ticketContent}
      </motion.div>
    );
  }

  return ticketContent;
}

/**
 * Small ticket badge showing just the QR code and ticket number
 */
export function TicketQRBadge({
  ticketNumber = SAMPLE_TICKET.ticketNumber,
  barcode = SAMPLE_TICKET.barcode,
  className,
}: {
  ticketNumber?: string;
  barcode?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'inline-flex flex-col items-center rounded-lg bg-white p-3 shadow-md',
        className
      )}
    >
      <QRCodeSVG
        value={barcode}
        size={80}
        level="M"
        includeMargin={false}
        bgColor="#ffffff"
        fgColor="#1f2937"
      />
      <p className="mt-2 font-mono text-xs font-medium text-gray-700">{ticketNumber}</p>
    </div>
  );
}
