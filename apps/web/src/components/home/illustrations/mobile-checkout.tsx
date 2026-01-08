'use client';

export function MobileCheckout() {
  return (
    <div
      className="relative flex h-[350px] items-center justify-center gap-6 sm:h-[450px]"
      role="img"
      aria-label="Mobile branded checkout and gate POS application visualization"
    >
      {/* Phone */}
      <div className="relative animate-[landing-float_6s_ease-in-out_infinite]">
        <div className="relative h-[280px] w-[140px] overflow-hidden rounded-[24px] border-4 border-[hsl(var(--landing-border))] bg-[hsl(var(--landing-bg-darkest))] shadow-[0_10px_40px_hsl(var(--landing-shadow))] sm:h-[340px] sm:w-[170px]">
          {/* Phone notch */}
          <div className="absolute left-1/2 top-2 h-5 w-20 -translate-x-1/2 rounded-full bg-[hsl(var(--landing-bg-card))]" />

          {/* Phone content */}
          <div className="flex h-full flex-col p-4 pt-10">
            {/* Header */}
            <div className="mb-4 flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[hsl(var(--landing-accent-primary))]" />
              <div className="h-3 w-16 rounded bg-[hsl(var(--landing-text-muted)/0.3)]" />
            </div>

            {/* Ticket preview */}
            <div className="mb-4 rounded-lg bg-gradient-to-br from-[hsl(var(--landing-accent-primary)/0.2)] to-[hsl(var(--landing-bg-card))] p-3">
              <div className="mb-2 h-2 w-12 rounded bg-[hsl(var(--landing-text-muted)/0.4)]" />
              <div className="mb-1 h-4 w-full rounded bg-[hsl(var(--landing-accent-primary)/0.4)]" />
              <div className="h-2 w-2/3 rounded bg-[hsl(var(--landing-text-muted)/0.3)]" />
            </div>

            {/* QR code placeholder */}
            <div className="mx-auto mb-4 grid h-20 w-20 grid-cols-5 gap-0.5 rounded-lg bg-white p-2 sm:h-24 sm:w-24">
              {[
                { id: 'qr-0', fill: true },
                { id: 'qr-1', fill: true },
                { id: 'qr-2', fill: false },
                { id: 'qr-3', fill: true },
                { id: 'qr-4', fill: false },
                { id: 'qr-5', fill: false },
                { id: 'qr-6', fill: true },
                { id: 'qr-7', fill: true },
                { id: 'qr-8', fill: true },
                { id: 'qr-9', fill: false },
                { id: 'qr-10', fill: true },
                { id: 'qr-11', fill: false },
                { id: 'qr-12', fill: true },
                { id: 'qr-13', fill: false },
                { id: 'qr-14', fill: true },
                { id: 'qr-15', fill: false },
                { id: 'qr-16', fill: true },
                { id: 'qr-17', fill: false },
                { id: 'qr-18', fill: true },
                { id: 'qr-19', fill: true },
                { id: 'qr-20', fill: true },
                { id: 'qr-21', fill: false },
                { id: 'qr-22', fill: false },
                { id: 'qr-23', fill: true },
                { id: 'qr-24', fill: true },
              ].map((cell) => (
                <div
                  key={cell.id}
                  className={`rounded-sm ${cell.fill ? 'bg-black' : 'bg-white'}`}
                />
              ))}
            </div>

            {/* Button */}
            <div className="mt-auto rounded-lg bg-[hsl(var(--landing-accent-primary))] py-3 text-center text-xs font-semibold text-white">
              Complete Purchase
            </div>
          </div>
        </div>
        {/* Phone glow */}
        <div className="absolute -inset-4 -z-10 rounded-[32px] bg-[hsl(var(--landing-glow-primary))] blur-2xl" />
      </div>

      {/* Tablet */}
      <div className="relative hidden animate-[landing-float_6s_ease-in-out_infinite_1s] sm:block">
        <div className="relative h-[200px] w-[280px] overflow-hidden rounded-[16px] border-4 border-[hsl(var(--landing-border))] bg-[hsl(var(--landing-bg-darkest))] shadow-[0_10px_40px_hsl(var(--landing-shadow))]">
          {/* Tablet content */}
          <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-16 border-r border-[hsl(var(--landing-border-subtle))] bg-[hsl(var(--landing-bg-card))] p-2">
              {['nav-active', 'nav-2', 'nav-3', 'nav-4'].map((id, idx) => (
                <div
                  key={id}
                  className={`mb-2 h-10 w-full rounded-lg ${
                    idx === 0
                      ? 'bg-[hsl(var(--landing-accent-primary))]'
                      : 'bg-[hsl(var(--landing-bg-darkest))]'
                  }`}
                />
              ))}
            </div>

            {/* Main content */}
            <div className="flex-1 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="h-3 w-20 rounded bg-[hsl(var(--landing-text-muted)/0.3)]" />
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 animate-[landing-pulse_2s_ease-in-out_infinite] rounded-full bg-[hsl(var(--landing-accent-secondary))]" />
                  <span className="text-[10px] text-[hsl(var(--landing-accent-secondary))]">
                    Online
                  </span>
                </div>
              </div>

              {/* Ticket items */}
              <div className="space-y-2">
                {['ticket-1', 'ticket-2'].map((id) => (
                  <div
                    key={id}
                    className="flex items-center gap-2 rounded-lg bg-[hsl(var(--landing-bg-card))] p-2"
                  >
                    <div className="h-8 w-8 rounded bg-[hsl(var(--landing-accent-secondary)/0.3)]" />
                    <div className="flex-1">
                      <div className="mb-1 h-2 w-16 rounded bg-[hsl(var(--landing-text-muted)/0.4)]" />
                      <div className="h-2 w-10 rounded bg-[hsl(var(--landing-text-muted)/0.2)]" />
                    </div>
                    <div className="h-3 w-8 rounded bg-[hsl(var(--landing-accent-primary)/0.4)]" />
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-3 flex items-center justify-between border-t border-[hsl(var(--landing-border-subtle))] pt-2">
                <span className="text-xs text-[hsl(var(--landing-text-muted))]">Total</span>
                <span className="text-sm font-bold text-[hsl(var(--landing-accent-secondary))]">
                  $89.00
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Tablet glow */}
        <div className="absolute -inset-4 -z-10 rounded-[24px] bg-[hsl(var(--landing-glow-secondary))] opacity-50 blur-2xl" />
      </div>

      {/* Label */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[hsl(var(--landing-bg-darkest)/0.9)] px-4 py-2 text-sm font-medium text-[hsl(var(--landing-text-muted))] backdrop-blur-sm">
        Mobile Branded Checkout & Gate POS App
      </div>
    </div>
  );
}
