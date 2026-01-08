import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton with shimmer */}
      <div className="space-y-2">
        <Skeleton shimmer className="h-9 w-48" />
        <Skeleton shimmer className="h-5 w-96 max-w-full" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton shimmer className="h-4 w-24" />
              <Skeleton shimmer className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton shimmer className="h-8 w-16 mb-1" />
              <Skeleton shimmer className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader>
              <Skeleton shimmer className="h-5 w-32 mb-1" />
              <Skeleton shimmer className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <SkeletonText lines={3} shimmer />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
