export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-white/10 backdrop-blur-xl dark:bg-black/10">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 text-sm text-[rgb(var(--muted))] sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="font-medium text-[rgb(var(--fg))]">BookE</div>
          <div className="text-xs">Made for your Database Lab — rebuilt in Next.js + TypeScript + MongoDB</div>
        </div>
        <div className="text-xs opacity-80">
          Tip: demo users are seeded on first run (password: <span className="font-mono">password123</span>).
        </div>
      </div>
    </footer>
  );
}
