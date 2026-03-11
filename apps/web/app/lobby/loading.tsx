import { Skeleton } from "@/components/ui/skeleton";

export default function LobbyLoading() {
  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Welcome header skeleton */}
      <div>
        <Skeleton className="h-9 w-3/4 mb-2" />
        <Skeleton className="h-5 w-1/2" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <Skeleton className="h-8 w-12 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="rounded-lg border bg-card p-4">
          <Skeleton className="h-8 w-12 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="rounded-lg border bg-card p-4 col-span-2 md:col-span-1">
          <Skeleton className="h-8 w-8 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Recent conversations skeleton */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-7 w-32" />
        </div>

        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border bg-card p-3"
            >
              <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions skeleton */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border bg-card p-4 flex flex-col items-center">
          <Skeleton className="h-8 w-8 mb-2" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="rounded-lg border bg-card p-4 flex flex-col items-center">
          <Skeleton className="h-8 w-8 mb-2" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}
