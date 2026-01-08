'use client';

export function DashboardViz() {
  return (
    <div
      className="relative h-[400px] w-full overflow-hidden rounded-xl border border-[hsl(var(--landing-border))] bg-gradient-to-br from-[hsl(var(--landing-bg-card))] to-[hsl(var(--landing-bg-dark))] shadow-[0_20px_50px_hsl(var(--landing-shadow))] sm:h-[500px]"
      role="img"
      aria-label="Dashboard visualization showing real-time sales, capacity, and staff check-ins"
    >
      {/* Window controls */}
      <div className="flex h-8 items-center gap-2 border-b border-[hsl(var(--landing-border-subtle))] bg-[hsl(var(--landing-bg-darkest)/0.5)] px-4">
        <div className="h-3 w-3 rounded-full bg-red-500/60" />
        <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
        <div className="h-3 w-3 rounded-full bg-green-500/60" />
      </div>

      {/* Dashboard content */}
      <div className="grid h-[calc(100%-2rem)] grid-cols-3 gap-4 p-4 sm:p-6">
        {/* Main stat card */}
        <div className="animate-[landing-float_6s_ease-in-out_infinite] rounded-lg bg-[hsl(var(--landing-accent-primary)/0.2)] p-4">
          <div className="mb-2 h-3 w-16 rounded bg-[hsl(var(--landing-text-muted)/0.3)]" />
          <div className="mb-4 h-8 w-24 rounded bg-[hsl(var(--landing-accent-primary))]" />
          <div className="flex gap-1">
            {[
              { id: 'bar-1', height: 35 },
              { id: 'bar-2', height: 45 },
              { id: 'bar-3', height: 28 },
              { id: 'bar-4', height: 52 },
              { id: 'bar-5', height: 38 },
            ].map((bar) => (
              <div
                key={bar.id}
                className="h-12 w-full rounded bg-[hsl(var(--landing-accent-primary)/0.4)]"
                style={{ height: `${bar.height}px` }}
              />
            ))}
          </div>
        </div>

        {/* Secondary cards */}
        <div className="animate-[landing-float_6s_ease-in-out_infinite_0.5s] rounded-lg bg-[hsl(var(--landing-bg-card-hover))] p-4">
          <div className="mb-3 h-3 w-20 rounded bg-[hsl(var(--landing-text-muted)/0.3)]" />
          <div className="space-y-2">
            {['item-1', 'item-2', 'item-3'].map((id) => (
              <div key={id} className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-[hsl(var(--landing-accent-secondary)/0.3)]" />
                <div className="flex-1">
                  <div className="mb-1 h-2 w-full rounded bg-[hsl(var(--landing-border))]" />
                  <div className="h-2 w-2/3 rounded bg-[hsl(var(--landing-border))]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="animate-[landing-float_6s_ease-in-out_infinite_1s] rounded-lg bg-[hsl(var(--landing-bg-card-hover))] p-4">
          <div className="mb-3 h-3 w-16 rounded bg-[hsl(var(--landing-text-muted)/0.3)]" />
          <div className="relative h-24 w-24 mx-auto">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="hsl(var(--landing-border))"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="hsl(var(--landing-accent-secondary))"
                strokeWidth="10"
                strokeDasharray="188"
                strokeDashoffset="60"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-[hsl(var(--landing-text-primary))]">
              68%
            </div>
          </div>
        </div>

        {/* Wide bottom card */}
        <div className="col-span-3 animate-[landing-float_6s_ease-in-out_infinite_1.5s] rounded-lg bg-[hsl(var(--landing-bg-card-hover))] p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-3 w-24 rounded bg-[hsl(var(--landing-text-muted)/0.3)]" />
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-[landing-pulse_2s_ease-in-out_infinite] rounded-full bg-[hsl(var(--landing-accent-secondary))]" />
              <span className="text-xs text-[hsl(var(--landing-accent-secondary))]">LIVE</span>
            </div>
          </div>
          <div className="flex h-16 items-end gap-1">
            {[
              { id: 'h-0', height: 35 },
              { id: 'h-1', height: 42 },
              { id: 'h-2', height: 55 },
              { id: 'h-3', height: 48 },
              { id: 'h-4', height: 62 },
              { id: 'h-5', height: 58 },
              { id: 'h-6', height: 70 },
              { id: 'h-7', height: 65 },
              { id: 'h-8', height: 78 },
              { id: 'h-9', height: 72 },
              { id: 'h-10', height: 85 },
              { id: 'h-11', height: 80 },
              { id: 'h-12', height: 75 },
              { id: 'h-13', height: 68 },
              { id: 'h-14', height: 60 },
              { id: 'h-15', height: 52 },
              { id: 'h-16', height: 45 },
              { id: 'h-17', height: 38 },
              { id: 'h-18', height: 42 },
              { id: 'h-19', height: 48 },
              { id: 'h-20', height: 55 },
              { id: 'h-21', height: 50 },
              { id: 'h-22', height: 45 },
              { id: 'h-23', height: 40 },
            ].map((bar) => (
              <div
                key={bar.id}
                className="flex-1 rounded-t bg-gradient-to-t from-[hsl(var(--landing-accent-primary))] to-[hsl(var(--landing-accent-primary)/0.3)]"
                style={{ height: `${bar.height}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Floating label */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-[hsl(var(--landing-bg-darkest)/0.9)] px-5 py-2.5 text-sm font-medium text-[hsl(var(--landing-text-muted))] backdrop-blur-sm">
        Real-Time Dashboard: Live Sales, Capacity, Staff Check-ins
      </div>
    </div>
  );
}
