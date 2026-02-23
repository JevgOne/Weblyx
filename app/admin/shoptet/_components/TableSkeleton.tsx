"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 5 }: TableSkeletonProps) {
  return (
    <Card>
      <div className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex gap-4 pb-2 border-b">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={`h-${i}`} className="h-4 flex-1" />
          ))}
        </div>
        {/* Data rows */}
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="flex gap-4 py-2">
            {Array.from({ length: columns }).map((_, colIdx) => (
              <Skeleton key={`${rowIdx}-${colIdx}`} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}
