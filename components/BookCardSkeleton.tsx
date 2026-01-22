export function BookCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="p-4">
        <div className="overflow-hidden rounded-2xl border border-[rgb(var(--border))]">
          <div className="aspect-[16/11] w-full skeleton" />
        </div>
        <div className="mt-4 h-5 w-2/3 skeleton" />
        <div className="mt-2 h-4 w-1/2 skeleton" />
        <div className="mt-4 h-12 w-full skeleton" />
        <div className="mt-4 flex gap-2">
          <div className="h-9 w-9 skeleton" />
          <div className="h-9 w-9 skeleton" />
          <div className="h-9 flex-1 skeleton" />
        </div>
      </div>
    </div>
  );
}
