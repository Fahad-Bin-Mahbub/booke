"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, BookPlus, LibraryBig, ShoppingCart, Inbox, User2, Heart } from "lucide-react";
import { useAuth } from "@/lib/auth/client";

const items = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/add-book", label: "Add Book", icon: BookPlus },
  { href: "/dashboard/my-books", label: "My Books", icon: LibraryBig },
  { href: "/dashboard/orders", label: "My Orders", icon: ShoppingCart },
  { href: "/dashboard/received", label: "Received", icon: Inbox },
  { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
  { href: "/dashboard/profile", label: "Profile", icon: User2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const displayName = profile?.name ?? user?.name ?? "";
  const username = profile?.username ?? user?.username ?? "";

  return (
    <aside className="card sticky top-20 p-3">
      <div className="rounded-2xl border border-[rgb(var(--border))] bg-white p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-white">
            <div className="h-full w-full bg-gradient-to-br from-[rgba(var(--brand)/0.35)] to-[rgba(var(--brand2)/0.35)]" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{displayName || "Your account"}</div>
            <div className="truncate text-xs text-[rgb(var(--muted))]">{username ? `@${username}` : "Dashboard"}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 px-3 pb-2 text-xs font-semibold tracking-wide text-[rgb(var(--muted))]">Navigate</div>
      <div className="grid gap-1">
        {items.map((it) => {
          const active = pathname === it.href;
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-[rgb(var(--bg1))] ring-1 ring-[rgba(var(--ring)/0.20)]"
                  : "hover:bg-[rgb(var(--bg1))]"
              )}
            >
              <span
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-xl border border-[rgb(var(--border))] bg-white shadow-sm transition",
                  active ? "ring-1 ring-[rgba(var(--ring)/0.18)]" : "group-hover:shadow"
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex-1">{it.label}</span>
              {active ? <span className="h-2 w-2 rounded-full bg-[rgb(var(--brand))]" /> : null}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
