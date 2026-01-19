import { Skeleton } from "@/components/ui/Skeleton";

export function BookCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="aspect-[16/11] w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-8 w-20 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
