import { Skeleton } from '@/components/ui/skeleton';

export default function EroWebAnalyzaLoading() {
  return (
    <div className="flex h-screen bg-[#0F0F0F]">
      {/* Sidebar skeleton */}
      <aside className="w-80 border-r border-[#2A2A2A] hidden lg:block p-4">
        <Skeleton className="h-8 w-40 mb-4 bg-[#252525]" />
        <Skeleton className="h-10 w-full mb-4 bg-[#252525]" />
        <Skeleton className="h-10 w-full mb-6 bg-[#252525]" />

        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="w-10 h-10 rounded-full bg-[#252525]" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-2 bg-[#252525]" />
                <Skeleton className="h-3 w-16 bg-[#252525]" />
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main content skeleton */}
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <Skeleton className="h-8 w-48 mb-2 bg-[#252525]" />
            <Skeleton className="h-4 w-64 bg-[#252525]" />
          </div>

          {/* Form card skeleton */}
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
            <Skeleton className="h-6 w-32 mb-2 bg-[#252525]" />
            <Skeleton className="h-4 w-48 mb-6 bg-[#252525]" />

            <div className="space-y-4">
              <div>
                <Skeleton className="h-4 w-20 mb-2 bg-[#252525]" />
                <Skeleton className="h-10 w-full bg-[#252525]" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2 bg-[#252525]" />
                <Skeleton className="h-10 w-full bg-[#252525]" />
              </div>
              <Skeleton className="h-10 w-full bg-[#7C3AED]/20" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
