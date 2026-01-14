'use client';

import { ArrowRight, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function QueueStatusChecker() {
  const router = useRouter();
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = code.trim().toUpperCase();
    if (trimmedCode.length >= 4) {
      router.push(`/queue/status/${trimmedCode}`);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-storefront-primary/10 flex items-center justify-center">
          <Search className="h-5 w-5 text-storefront-primary" />
        </div>
        <div>
          <h2 className="font-semibold">Already in line?</h2>
          <p className="text-sm text-muted-foreground">Check your position</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter confirmation code"
          className="flex-1 h-11 rounded-md border border-input bg-background px-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 uppercase tracking-widest font-mono"
          maxLength={10}
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="submit"
          disabled={code.trim().length < 4}
          className="h-11 px-4 inline-flex items-center justify-center gap-2 rounded-md bg-storefront-primary text-white font-medium hover:bg-storefront-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          Check
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
