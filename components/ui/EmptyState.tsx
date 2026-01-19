import { Sparkles } from "lucide-react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card p-8 text-center">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-white/40 dark:bg-white/10">
        <Sparkles className="h-5 w-5" />
      </div>
      <div className="text-base font-semibold">{title}</div>
      {description ? <div className="mt-1 text-sm text-[rgb(var(--muted))]">{description}</div> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
