import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function PaymentsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton shimmer className="h-9 w-32" />
        <Skeleton shimmer className="h-5 w-64" />
      </div>

      {/* Connection Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton shimmer className="h-6 w-48" />
              <Skeleton shimmer className="h-4 w-72" />
            </div>
            <Skeleton shimmer className="h-6 w-24" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton shimmer className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton shimmer className="h-5 w-40" />
              <Skeleton shimmer className="h-4 w-32" />
            </div>
          </div>
          <Skeleton shimmer className="h-10 w-40" />
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton shimmer className="h-4 w-28" />
              <Skeleton shimmer className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton shimmer className="h-8 w-24 mb-1" />
              <Skeleton shimmer className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <Skeleton shimmer className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="space-y-1">
                  <Skeleton shimmer className="h-4 w-48" />
                  <Skeleton shimmer className="h-3 w-32" />
                </div>
                <div className="text-right space-y-1">
                  <Skeleton shimmer className="h-4 w-20" />
                  <Skeleton shimmer className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
