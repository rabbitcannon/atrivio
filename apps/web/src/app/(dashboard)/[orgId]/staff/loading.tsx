import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function StaffLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton shimmer className="h-9 w-32" />
          <Skeleton shimmer className="h-5 w-64" />
        </div>
        <Skeleton shimmer className="h-10 w-32" />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Skeleton shimmer className="h-10 w-64" />
        <Skeleton shimmer className="h-10 w-32" />
      </div>

      {/* Staff Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center gap-4">
              <Skeleton shimmer className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton shimmer className="h-5 w-32" />
                <Skeleton shimmer className="h-4 w-24" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton shimmer className="h-4 w-full" />
              <Skeleton shimmer className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
