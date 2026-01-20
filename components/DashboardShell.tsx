"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookPlus, Heart, Package, Receipt, Settings, User2 } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Overview", icon: <Package className="h-4 w-4" /> },
  { href: "/dashboard/add-book", label: "Add book", icon: <BookPlus className="h-4 w-4" /> },
  { href: "/dashboard/my-books", label: "My books", icon: <Receipt className="h-4 w-4" /> },
  { href: "/dashboard/orders", label: "My orders", icon: <Package className="h-4 w-4" /> },
  { href: "/dashboard/received-orders", label: "Received", icon: <Package className="h-4 w-4" /> },
  { href: "/dashboard/wishlist", label: "Wishlist", icon: <Heart className="h-4 w-4" /> },
  { href: "/dashboard/profile", label: "Profile", icon: <User2 className="h-4 w-4" /> },
];

export function DashboardShell({ title, children }: { title: string; children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="card h-fit p-3">
        <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted))]">Dashboard</div>
        <nav className="flex flex-col gap-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`btn btn-ghost !justify-start ${active ? "ring-2 ring-[rgba(var(--ring)/0.35)]" : ""}`}
              >
                {l.icon}
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg1))] p-3 text-xs text-[rgb(var(--muted))] dark:bg-slate-900">
          <div className="flex items-center gap-2 font-medium text-[rgb(var(--fg))]">
            <Settings className="h-4 w-4" /> Pro tips
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>Try auto-seed for a ready-made demo.</li>
            <li>Use Wishlist as your “bookmark”.</li>
          </ul>
        </div>
      </aside>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-[rgb(var(--muted))]">Everything you need in one clean admin-style layout.</p>
          </div>
        </div>
        {children}
      </section>
    </div>
  );
}
