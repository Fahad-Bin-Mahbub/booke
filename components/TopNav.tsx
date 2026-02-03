"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  LayoutDashboard,
  LogIn,
  LogOut,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth/client";
import { Button } from "@/components/ui/Button";

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}

function NavLink({ href, icon, children, onClick }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        group relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium
        transition-all duration-200 hover:bg-[rgba(var(--brand)/0.08)]
        ${isActive
          ? "bg-[rgba(var(--brand)/0.1)] text-[rgb(var(--brand))]"
          : "text-[rgb(var(--fg))]"
        }
      `}
    >
      <span className={`transition-colors ${isActive ? "text-[rgb(var(--brand))]" : "opacity-70 group-hover:opacity-100"}`}>
        {icon}
      </span>
      <span className="hidden sm:inline">{children}</span>
      {isActive && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-gradient-to-r from-[rgb(var(--brand))] to-[rgb(var(--brand2))]"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
    </Link>
  );
}

function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-3">
      <motion.div
        initial={{ rotate: -6, scale: 0.95 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="relative grid h-11 w-11 place-items-center rounded-2xl border border-[rgb(var(--border))] bg-gradient-to-br from-[rgba(var(--brand)/0.15)] via-white to-[rgba(var(--mint)/0.15)] shadow-sm transition-transform group-hover:scale-105"
      >
        <Sparkles className="h-5 w-5 text-[rgb(var(--brand))]" />
        <div className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-gradient-to-br from-[rgb(var(--brand))] to-[rgb(var(--brand2))]" />
      </motion.div>
      <div className="leading-tight">
        <div className="bg-gradient-to-r from-[rgb(var(--brand))] to-[rgb(var(--brand2))] bg-clip-text text-base font-bold tracking-tight text-transparent">
          BookE
        </div>
        <div className="text-[11px] font-medium text-[rgb(var(--muted))]">
          Sell · Loan · Giveaway
        </div>
      </div>
    </Link>
  );
}

function UserProfile({ username, name }: { username: string; name?: string }) {
  return (
    <div className="hidden items-center gap-2.5 rounded-xl border border-[rgb(var(--border))] bg-white px-3 py-2 shadow-sm sm:flex dark:bg-slate-900">
      <div className="h-8 w-8 overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-gradient-to-br from-[rgba(var(--brand)/0.4)] to-[rgba(var(--brand2)/0.4)]" />
      <div className="max-w-[140px]">
        <div className="truncate text-xs font-semibold">@{username}</div>
        {name && (
          <div className="truncate text-[10px] text-[rgb(var(--muted))]">{name}</div>
        )}
      </div>
    </div>
  );
}

export function TopNav() {
  const { user, token, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[rgb(var(--border))] bg-white/80 backdrop-blur-xl dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Logo />

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          <NavLink href="/" icon={<BookOpen className="h-4 w-4" />}>
            Explore
          </NavLink>
          <NavLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>
            Dashboard
          </NavLink>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {token ? (
            <>
              {user && <UserProfile username={user.username} name={user.name} />}
              <Button
                variant="primary"
                size="sm"
                onClick={logout}
                leftIcon={<LogOut className="h-4 w-4" />}
              >
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="primary" size="sm" leftIcon={<LogIn className="h-4 w-4" />}>
                <span className="hidden sm:inline">Login</span>
              </Button>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn-icon md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-[rgb(var(--border))] bg-white px-4 py-3 md:hidden dark:bg-slate-950"
        >
          <div className="flex flex-col gap-1">
            <NavLink
              href="/"
              icon={<BookOpen className="h-4 w-4" />}
              onClick={() => setMobileMenuOpen(false)}
            >
              Explore
            </NavLink>
            <NavLink
              href="/dashboard"
              icon={<LayoutDashboard className="h-4 w-4" />}
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </NavLink>
          </div>
        </motion.nav>
      )}
    </header>
  );
}
