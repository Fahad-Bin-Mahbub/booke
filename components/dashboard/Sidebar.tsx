"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookPlus,
  Heart,
  Package,
  Receipt,
  User2,
  ChevronRight,
  Sparkles,
  LayoutDashboard,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/add-book", label: "Add Book", icon: BookPlus },
  { href: "/dashboard/my-books", label: "My Books", icon: Receipt },
  { href: "/dashboard/orders", label: "My Orders", icon: Package },
  { href: "/dashboard/received", label: "Received Orders", icon: Package },
  { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
  { href: "/dashboard/profile", label: "Profile", icon: User2 },
];

function NavItem({
  href,
  label,
  icon: Icon,
  exact = false,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`
        group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
        transition-all duration-200
        ${isActive
          ? "bg-gradient-to-r from-[rgba(var(--brand)/0.12)] to-[rgba(var(--mint)/0.08)] text-[rgb(var(--brand))]"
          : "text-[rgb(var(--muted))] hover:bg-[rgba(var(--brand)/0.06)] hover:text-[rgb(var(--fg))]"
        }
      `}
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-indicator"
          className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-[rgb(var(--brand))] to-[rgb(var(--brand2))]"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <Icon className={`h-4 w-4 transition-colors ${isActive ? "" : "opacity-70"}`} />
      <span className="flex-1">{label}</span>
      <ChevronRight
        className={`h-4 w-4 transition-all ${
          isActive ? "opacity-100" : "opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0"
        }`}
      />
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-24 h-fit space-y-4">
      {/* Navigation */}
      <div className="card p-3">
        <div className="mb-3 flex items-center gap-2 px-3 text-[10px] font-bold uppercase tracking-widest text-[rgb(var(--muted))]">
          <LayoutDashboard className="h-3.5 w-3.5" />
          Navigation
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              exact={item.exact}
            />
          ))}
        </nav>
      </div>

      {/* Tips Card */}
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-br from-[rgba(var(--brand)/0.08)] to-[rgba(var(--mint)/0.05)] p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[rgb(var(--fg))]">
            <div className="grid h-6 w-6 place-items-center rounded-lg bg-gradient-to-br from-[rgb(var(--brand))] to-[rgb(var(--brand2))]">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            Pro Tips
          </div>
          <ul className="mt-3 space-y-2 text-xs text-[rgb(var(--muted))]">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[rgb(var(--brand))]" />
              Seed demo data for a ready-made experience
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[rgb(var(--mint))]" />
              Use Wishlist to bookmark your favorites
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[rgb(var(--brand2))]" />
              Rate sellers after transactions
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
