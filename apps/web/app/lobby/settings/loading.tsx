import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden animate-in fade-in duration-300">
      {/* Settings nav skeleton */}
      <aside className="w-full md:w-64 flex-shrink-0 border-b md:border-b-0 md:border-r border-white/10 p-4 md:p-6">
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-4 w-48 mb-8 hidden md:block" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-11 w-full rounded-xl" />
          ))}
        </div>
      </aside>

      {/* Content skeleton */}
      <div className="flex-1 overflow-y-auto py-8 md:py-12 px-4 sm:px-8">
        <div className="max-w-3xl mx-auto space-y-16">
          {/* Profile card skeleton */}
          <div className="rounded-[2rem] p-8 sm:p-10 border border-white/10 space-y-6">
            <Skeleton className="h-7 w-32" />
            <div className="flex items-center gap-4">
              <Skeleton className="w-24 h-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-44" />
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full rounded-xl" />
              <div className="grid grid-cols-2 gap-6">
                <Skeleton className="h-12 rounded-xl" />
                <Skeleton className="h-12 rounded-xl" />
              </div>
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          </div>

          {/* Account card skeleton */}
          <div className="rounded-[2rem] p-8 sm:p-10 border border-white/10 space-y-6">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
