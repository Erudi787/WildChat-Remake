import { Skeleton } from "@/components/ui/skeleton";

export default function MessagesLoading() {
  return (
    <div className="flex h-full animate-in fade-in duration-300">
      {/* Conversation list skeleton */}
      <div className="w-80 border-r border-white/10 flex-shrink-0 hidden md:block">
        <div className="p-3 border-b border-white/10">
          <Skeleton className="h-7 w-24" />
        </div>
        <div className="p-3">
          <Skeleton className="h-9 w-full rounded-md mb-4" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <Skeleton className="w-11 h-11 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message area skeleton */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="w-24 h-24 rounded-full mx-auto" />
          <Skeleton className="h-6 w-40 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </div>
    </div>
  );
}
