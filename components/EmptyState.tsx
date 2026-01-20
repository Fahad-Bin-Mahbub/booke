import { Sparkles } from "lucide-react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card p-8 text-center">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg1))]">
        <Sparkles className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-[rgb(var(--muted))]">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
