"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, BookPlus, LibraryBig, ShoppingCart, Inbox, User2, Heart } from "lucide-react";

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

  return (
    <aside className="card p-3">
      <div className="px-3 pb-2 text-xs font-semibold tracking-wide text-[rgb(var(--muted))]">Dashboard</div>
      <div className="grid gap-1">
        {items.map((it) => {
          const active = pathname === it.href;
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                active
                  ? "bg-[rgb(var(--bg1))] ring-1 ring-[rgb(var(--border))]"
                  : "hover:bg-[rgb(var(--bg1))]"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
