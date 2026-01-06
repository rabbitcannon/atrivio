'use client';

export function CheckInIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* Main device frame */}
      <div className="rounded-3xl bg-[hsl(var(--landing-bg-card))] p-6 shadow-2xl">
        {/* Device header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[hsl(var(--landing-accent-secondary))]" />
            <span className="text-sm font-semibold text-[hsl(var(--landing-text-primary))]">
              Check-In Station
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[hsl(var(--landing-text-muted))]">
            <span className="h-2 w-2 rounded-full bg-[hsl(var(--landing-accent-secondary))]" />
            Online
          </div>
        </div>

        {/* Scanner area */}
        <div className="relative mb-6 overflow-hidden rounded-2xl bg-[hsl(var(--landing-bg-dark))] p-8">
          {/* Scanner animation */}
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[hsl(var(--landing-accent-primary))] to-transparent opacity-50"
              style={{
                animation: 'landing-scan 2s ease-in-out infinite',
                top: '50%',
              }}
            />
          </div>

          {/* QR Code representation */}
          <div className="relative mx-auto h-32 w-32">
            <svg viewBox="0 0 64 64" className="h-full w-full text-[hsl(var(--landing-text-muted)/0.3)]" fill="currentColor">
              <rect x="4" y="4" width="20" height="20" />
              <rect x="40" y="4" width="20" height="20" />
              <rect x="4" y="40" width="20" height="20" />
              <rect x="28" y="28" width="8" height="8" />
              <rect x="40" y="40" width="8" height="8" />
              <rect x="52" y="40" width="8" height="8" />
              <rect x="40" y="52" width="8" height="8" />
              <rect x="8" y="8" width="12" height="12" className="text-[hsl(var(--landing-bg-dark))]" />
              <rect x="44" y="8" width="12" height="12" className="text-[hsl(var(--landing-bg-dark))]" />
              <rect x="8" y="44" width="12" height="12" className="text-[hsl(var(--landing-bg-dark))]" />
            </svg>
          </div>

          <p className="mt-4 text-center text-sm text-[hsl(var(--landing-text-muted))]">
            Scan ticket barcode or QR code
          </p>
        </div>

        {/* Recent check-ins */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[hsl(var(--landing-text-muted))]">Recent Check-ins</span>
            <span className="font-semibold text-[hsl(var(--landing-accent-secondary))]">847 today</span>
          </div>

          {/* Check-in entries */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-lg bg-[hsl(var(--landing-bg-dark))] p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--landing-accent-secondary)/0.2)]">
                <svg className="h-4 w-4 text-[hsl(var(--landing-accent-secondary))]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-[hsl(var(--landing-text-primary))]">VIP Fast Pass</div>
                <div className="text-xs text-[hsl(var(--landing-text-muted))]">Just now</div>
              </div>
              <div className="text-xs text-[hsl(var(--landing-text-muted))]">#4821</div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-[hsl(var(--landing-bg-dark))] p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--landing-accent-secondary)/0.2)]">
                <svg className="h-4 w-4 text-[hsl(var(--landing-accent-secondary))]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-[hsl(var(--landing-text-primary))]">General Admission</div>
                <div className="text-xs text-[hsl(var(--landing-text-muted))]">2 min ago</div>
              </div>
              <div className="text-xs text-[hsl(var(--landing-text-muted))]">#4820</div>
            </div>
          </div>
        </div>

        {/* Capacity indicator */}
        <div className="mt-6 rounded-lg bg-[hsl(var(--landing-bg-dark))] p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-[hsl(var(--landing-text-muted))]">Current Capacity</span>
            <span className="font-semibold text-[hsl(var(--landing-text-primary))]">412 / 500</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--landing-bg-card))]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--landing-accent-secondary))] to-[hsl(var(--landing-accent-primary))]"
              style={{ width: '82%' }}
            />
          </div>
          <div className="mt-2 text-xs text-[hsl(var(--landing-text-muted))]">
            88 spots remaining for 8:00 PM timeslot
          </div>
        </div>
      </div>

      {/* Floating waiver badge */}
      <div className="absolute -right-4 top-8 rounded-lg bg-[hsl(var(--landing-accent-primary))] p-3 shadow-lg shadow-[hsl(var(--landing-glow-primary))]">
        <div className="flex items-center gap-2 text-white">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
          </svg>
          <span className="text-sm font-semibold">Waiver Signed</span>
        </div>
      </div>

      {/* Add scanner animation keyframes */}
      <style jsx>{`
        @keyframes landing-scan {
          0%, 100% { transform: translateY(-100%); }
          50% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
}
