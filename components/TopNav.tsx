"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, LayoutDashboard, LogIn, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth/client";

function NavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`btn btn-ghost !px-3 !py-2 ${active ? "ring-2 ring-[rgba(var(--ring)/0.35)]" : ""}`}
    >
      <span className="opacity-80">{icon}</span>
      <span className="hidden sm:inline">{children}</span>
    </Link>
  );
}

export function TopNav() {
  const { user, token, logout } = useAuth();

  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-white/40 backdrop-blur-xl dark:bg-black/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <motion.div
            initial={{ rotate: -6, scale: 0.95 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/60 shadow-sm dark:bg-white/5"
          >
            <Sparkles className="h-5 w-5" />
          </motion.div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">BookE</div>
            <div className="text-xs text-[rgb(var(--muted))]">Sell · Loan · Giveaway</div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <NavLink href="/" icon={<BookOpen className="h-4 w-4" />}>Explore</NavLink>
          <NavLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>Dashboard</NavLink>

          {token ? (
            <button onClick={logout} className="btn btn-primary !px-3 !py-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            <Link href="/login" className="btn btn-primary !px-3 !py-2">
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Login</span>
            </Link>
          )}

          {user ? (
            <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/50 px-3 py-2 text-sm dark:bg-white/5 sm:flex">
              <div className="h-7 w-7 overflow-hidden rounded-xl border border-white/10 bg-white/40">
                {/* placeholder avatar */}
                <div className="h-full w-full bg-gradient-to-br from-[rgba(var(--brand)/0.35)] to-[rgba(var(--brand2)/0.35)]" />
              </div>
              <div className="max-w-[160px] truncate text-xs">
                <div className="font-medium leading-4">@{user.username}</div>
                <div className="text-[10px] text-[rgb(var(--muted))]">{user.name}</div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
