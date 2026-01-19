import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="h-9 w-9 rounded-2xl" style={{ background: "linear-gradient(135deg, rgb(var(--brand)), rgb(var(--mint)))" }} />
      <div className="leading-tight">
        <div className="text-sm font-semibold tracking-tight">BookE</div>
        <div className="text-xs text-[rgb(var(--muted))]">Marketplace</div>
      </div>
    </Link>
  );
}
