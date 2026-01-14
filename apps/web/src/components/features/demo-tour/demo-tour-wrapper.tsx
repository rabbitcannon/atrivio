'use client';

import { DemoTourProvider } from './demo-tour-context';
import { DemoTourOverlay } from './demo-tour-overlay';

export function DemoTourWrapper({ children }: { children: React.ReactNode }) {
  return (
    <DemoTourProvider>
      {children}
      <DemoTourOverlay />
    </DemoTourProvider>
  );
}
