export function BookCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-[16/10] w-full skeleton" />
      <div className="p-4">
        <div className="h-4 w-2/3 skeleton" />
        <div className="mt-2 h-3 w-1/2 skeleton" />
        <div className="mt-4 h-8 w-full skeleton" />
        <div className="mt-2 h-8 w-full skeleton" />
      </div>
    </div>
  );
}
