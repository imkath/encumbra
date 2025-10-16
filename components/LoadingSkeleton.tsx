import { Skeleton } from "@/components/ui/skeleton";

export function TopParksRankingSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Filtros de zona */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-neutral-200 dark:border-neutral-700">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>

      {/* Lista de parques */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="w-full rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4"
          >
            <div className="flex items-start gap-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-10 w-16 rounded-full" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Skeleton className="h-16 w-full rounded-lg" />
    </div>
  );
}

export function AtGlanceCardSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-6 border-2 border-neutral-100 dark:border-neutral-700">
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="flex items-center justify-center py-6">
          <Skeleton className="h-24 w-24 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function BestWindowPanelSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-6 border-2 border-neutral-100 dark:border-neutral-700">
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
            >
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HourlyChartSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-6 border-2 border-neutral-100 dark:border-neutral-700">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </div>
    </div>
  );
}

export function MapViewSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-6 border-2 border-neutral-100 dark:border-neutral-700">
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    </div>
  );
}

export function EducationalWindowsSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-6 border-2 border-neutral-100 dark:border-neutral-700">
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900"
            >
              <div className="flex items-start gap-3">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FullPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="space-y-8">
        {/* Top Parques Skeleton */}
        <div className="bg-gradient-to-br from-white via-sky-50 to-blue-50 dark:from-neutral-900 dark:via-purple-950/20 dark:to-purple-900/20 rounded-3xl shadow-2xl p-8">
          <TopParksRankingSkeleton />
        </div>

        {/* Detalles del parque - 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <AtGlanceCardSkeleton />
            <BestWindowPanelSkeleton />
          </div>
          <div className="space-y-6">
            <HourlyChartSkeleton />
            <MapViewSkeleton />
          </div>
        </div>

        {/* Educational Windows */}
        <EducationalWindowsSkeleton />
      </div>
    </div>
  );
}
