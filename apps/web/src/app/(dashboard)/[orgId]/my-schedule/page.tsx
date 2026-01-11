import { Calendar } from 'lucide-react';
import type { Metadata } from 'next';
import { AnimatedPageHeader } from '@/components/features/attractions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn } from '@/components/ui/motion';

export const metadata: Metadata = {
  title: 'My Schedule',
};

export default function MySchedulePage() {
  return (
    <div className="space-y-6">
      <AnimatedPageHeader>
        <h1 className="text-3xl font-bold">My Schedule</h1>
        <p className="text-muted-foreground">View your upcoming shifts and schedule.</p>
      </AnimatedPageHeader>

      <FadeIn delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Coming Soon
            </CardTitle>
            <CardDescription>The scheduling feature is currently under development.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This feature will show your assigned shifts, allow you to view your upcoming schedule,
              and request time off. Check back soon for updates.
            </p>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
