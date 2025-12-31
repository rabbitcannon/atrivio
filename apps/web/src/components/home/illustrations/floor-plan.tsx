'use client';

export function FloorPlan() {
  return (
    <div
      className="relative h-[500px] w-full overflow-hidden rounded-xl border border-[hsl(var(--landing-border))] bg-[radial-gradient(circle_at_center,hsl(var(--landing-bg-card))_0%,hsl(var(--landing-bg-darkest))_100%)] sm:h-[600px]"
      role="img"
      aria-label="3D attraction planner and scene mapping visualization"
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--landing-accent-primary)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--landing-accent-primary)) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Isometric floor plan */}
      <svg
        className="absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2"
        viewBox="0 0 400 300"
        fill="none"
        aria-hidden="true"
      >
        {/* Main pathway */}
        <path
          d="M50 200 L150 150 L250 150 L350 200"
          stroke="hsl(var(--landing-accent-primary))"
          strokeWidth="3"
          strokeOpacity="0.4"
          strokeDasharray="8 4"
          fill="none"
        />

        {/* Rooms/Zones */}
        <g className="animate-[landing-pulse_4s_ease-in-out_infinite]">
          <rect
            x="80"
            y="100"
            width="60"
            height="40"
            rx="4"
            fill="hsl(var(--landing-bg-card))"
            stroke="hsl(var(--landing-border))"
            strokeWidth="2"
          />
          <text
            x="110"
            y="125"
            textAnchor="middle"
            className="fill-[hsl(var(--landing-text-muted))] text-[10px]"
          >
            Zone A
          </text>
        </g>

        <g className="animate-[landing-pulse_4s_ease-in-out_infinite_0.5s]">
          <rect
            x="170"
            y="80"
            width="60"
            height="40"
            rx="4"
            fill="hsl(var(--landing-bg-card))"
            stroke="hsl(var(--landing-border))"
            strokeWidth="2"
          />
          <text
            x="200"
            y="105"
            textAnchor="middle"
            className="fill-[hsl(var(--landing-text-muted))] text-[10px]"
          >
            Zone B
          </text>
        </g>

        <g className="animate-[landing-pulse_4s_ease-in-out_infinite_1s]">
          <rect
            x="260"
            y="100"
            width="60"
            height="40"
            rx="4"
            fill="hsl(var(--landing-bg-card))"
            stroke="hsl(var(--landing-border))"
            strokeWidth="2"
          />
          <text
            x="290"
            y="125"
            textAnchor="middle"
            className="fill-[hsl(var(--landing-text-muted))] text-[10px]"
          >
            Zone C
          </text>
        </g>

        {/* Actor positions */}
        <g>
          <circle
            cx="100"
            cy="170"
            r="12"
            className="animate-[landing-glow_3s_ease-in-out_infinite] fill-[hsl(var(--landing-accent-secondary)/0.3)] stroke-[hsl(var(--landing-accent-secondary))]"
            strokeWidth="2"
          />
          <circle
            cx="100"
            cy="170"
            r="5"
            className="fill-[hsl(var(--landing-accent-secondary))]"
          />
        </g>

        <g>
          <circle
            cx="200"
            cy="140"
            r="12"
            className="animate-[landing-glow_3s_ease-in-out_infinite_0.5s] fill-[hsl(var(--landing-accent-secondary)/0.3)] stroke-[hsl(var(--landing-accent-secondary))]"
            strokeWidth="2"
          />
          <circle
            cx="200"
            cy="140"
            r="5"
            className="fill-[hsl(var(--landing-accent-secondary))]"
          />
        </g>

        <g>
          <circle
            cx="300"
            cy="170"
            r="12"
            className="animate-[landing-glow_3s_ease-in-out_infinite_1s] fill-[hsl(var(--landing-accent-secondary)/0.3)] stroke-[hsl(var(--landing-accent-secondary))]"
            strokeWidth="2"
          />
          <circle
            cx="300"
            cy="170"
            r="5"
            className="fill-[hsl(var(--landing-accent-secondary))]"
          />
        </g>

        {/* Emergency exit */}
        <g className="animate-[landing-pulse_2s_ease-in-out_infinite]">
          <rect
            x="340"
            y="60"
            width="40"
            height="24"
            rx="4"
            fill="hsl(0 70% 50% / 0.2)"
            stroke="hsl(0 70% 50%)"
            strokeWidth="2"
          />
          <text
            x="360"
            y="76"
            textAnchor="middle"
            className="fill-[hsl(0_70%_50%)] text-[8px] font-bold"
          >
            EXIT
          </text>
        </g>

        {/* Entry arrow */}
        <path
          d="M30 200 L50 200"
          stroke="hsl(var(--landing-text-muted))"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />
        <text
          x="40"
          y="220"
          textAnchor="middle"
          className="fill-[hsl(var(--landing-text-muted))] text-[10px]"
        >
          Entry
        </text>

        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="hsl(var(--landing-text-muted))"
            />
          </marker>
        </defs>
      </svg>

      {/* Actor position labels */}
      <div className="absolute left-[15%] top-[45%] text-sm font-medium text-[hsl(var(--landing-accent-secondary))]">
        Actor Position A
      </div>
      <div className="absolute left-[55%] top-[35%] hidden text-sm font-medium text-[hsl(var(--landing-accent-secondary))] sm:block">
        Actor Position B
      </div>
      <div className="absolute right-[12%] top-[50%] hidden text-sm font-medium text-[hsl(var(--landing-accent-secondary))] sm:block">
        Actor Position C
      </div>

      {/* Label */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-[hsl(var(--landing-bg-darkest)/0.9)] px-5 py-2.5 text-sm font-medium text-[hsl(var(--landing-text-muted))] backdrop-blur-sm">
        3D Attraction Planner & Scene Mapping
      </div>
    </div>
  );
}
