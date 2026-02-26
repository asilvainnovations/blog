import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ArticleCardSkeletonProps {
  variant?: 'default' | 'featured' | 'compact' | 'horizontal';
  className?: string;
}

export function ArticleCardSkeleton({
  variant = 'default',
  className,
}: ArticleCardSkeletonProps) {
  // Featured variant
  if (variant === 'featured') {
    return (
      <div className={cn('rounded-2xl bg-white shadow-lg overflow-hidden', className)}>
        <div className="grid md:grid-cols-2 gap-0">
          <Skeleton className="aspect-[4/3] md:aspect-auto" />
          <div className="p-6 md:p-8 space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex items-center justify-between pt-4">
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-9 w-9 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-start gap-4 p-4', className)}>
        <Skeleton className="w-20 h-20 flex-shrink-0 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    );
  }

  // Horizontal variant
  if (variant === 'horizontal') {
    return (
      <div className={cn('flex gap-4 p-4 rounded-xl border', className)}>
        <Skeleton className="w-48 h-32 flex-shrink-0 rounded-lg" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex items-center justify-between mt-auto">
            <Skeleton className="h-3 w-24" />
            <div className="flex gap-1">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn('rounded-xl overflow-hidden border border-slate-100', className)}>
      <Skeleton className="aspect-[16/10]" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}
