'use client';

import dynamic from 'next/dynamic';
import { Toaster } from 'sonner';

// Dynamically import the editor to reduce initial bundle size
// The editor is ~1.3MB, so lazy loading it significantly improves performance
const PlateEditor = dynamic(
  () => import('@/components/editor/plate-editor').then((mod) => mod.PlateEditor),
  {
    loading: () => <EditorSkeleton />,
    ssr: false, // Editor requires browser APIs
  }
);

function EditorSkeleton() {
  return (
    <div className="h-screen w-full flex flex-col animate-pulse">
      {/* Toolbar skeleton */}
      <div className="h-12 border-b bg-muted/50 flex items-center gap-2 px-4">
        <div className="h-6 w-6 rounded bg-muted" />
        <div className="h-6 w-6 rounded bg-muted" />
        <div className="h-6 w-px bg-border mx-2" />
        <div className="h-6 w-6 rounded bg-muted" />
        <div className="h-6 w-6 rounded bg-muted" />
        <div className="h-6 w-6 rounded bg-muted" />
      </div>
      {/* Content area skeleton */}
      <div className="flex-1 p-8 max-w-4xl mx-auto w-full">
        <div className="h-8 w-64 bg-muted rounded mb-6" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-5/6 bg-muted rounded" />
          <div className="h-4 w-4/5 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <div className="h-screen w-full">
      <PlateEditor />
      <Toaster />
    </div>
  );
}
