import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="space-y-3 rounded-2xl border border-border bg-card p-3">
        <Skeleton className="aspect-[4/5] w-full rounded-xl" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    ))}
  </div>
);
