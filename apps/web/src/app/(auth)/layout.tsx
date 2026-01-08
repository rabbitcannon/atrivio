import Image from 'next/image';
import Link from 'next/link';
import atrivioLogo from '@/assets/images/atrivio-logo.png';
import { FadeTransition } from '@/components/ui/page-transition';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b px-6">
        <Link href="/" className="flex items-center">
          <Image src={atrivioLogo} alt="Atrivio" height={32} className="h-8 w-auto" priority />
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <FadeTransition className="w-full max-w-md">{children}</FadeTransition>
      </main>

      {/* Footer */}
      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Atrivio. All rights reserved.</p>
      </footer>
    </div>
  );
}
