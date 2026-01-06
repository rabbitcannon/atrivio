import Link from 'next/link';
import { Ghost } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center px-4">
        <Ghost className="h-24 w-24 mx-auto mb-6 text-muted-foreground animate-bounce" />
        <h1 className="text-4xl font-heading font-bold mb-4">Page Not Found</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          Looks like this page has vanished into the shadows. Let&apos;s get you back on track.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-storefront-primary px-6 py-3 font-semibold text-white hover:opacity-90 transition-opacity"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
