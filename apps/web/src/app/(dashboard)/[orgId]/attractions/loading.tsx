import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AttractionsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton shimmer className="h-9 w-40" />
          <Skeleton shimmer className="h-5 w-64" />
        </div>
        <Skeleton shimmer className="h-10 w-40" />
      </div>

      {/* Attractions Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <Skeleton shimmer className="h-48 w-full rounded-t-lg" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton shimmer className="h-6 w-40" />
                <Skeleton shimmer className="h-6 w-16" />
              </div>
              <Skeleton shimmer className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <Skeleton shimmer className="h-4 w-20" />
                <Skeleton shimmer className="h-4 w-16" />
              </div>
              <div className="flex gap-2">
                <Skeleton shimmer className="h-9 w-full" />
                <Skeleton shimmer className="h-9 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
