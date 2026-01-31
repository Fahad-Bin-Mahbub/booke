"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BookPlus,
  Heart,
  PackageSearch,
  Inbox,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

import { apiFetch } from "@/lib/http";
import { useAuth } from "@/lib/auth/client";
import type { Book, Order, WishlistItem } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

// Stat Card Component
function StatCard({
  title,
  value,
  icon,
  hint,
  gradient,
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  hint: string;
  gradient: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium text-[rgb(var(--muted))]">{title}</div>
          <div className="mt-1 text-3xl font-bold tracking-tight">{value}</div>
          <div className="mt-1 text-xs text-[rgb(var(--muted))]">{hint}</div>
        </div>
        <div className={`grid h-12 w-12 place-items-center rounded-2xl ${gradient}`}>
          {icon}
        </div>
      </div>
      <div className={`absolute -bottom-6 -right-6 h-24 w-24 rounded-full ${gradient} opacity-10 blur-2xl`} />
    </Card>
  );
}

// Quick Action Card
function QuickAction({
  href,
  icon,
  title,
  description,
  variant = "default",
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  variant?: "default" | "primary";
}) {
  return (
    <Link href={href} className="group">
      <Card
        variant="interactive"
        className={`h-full transition-all ${
          variant === "primary"
            ? "bg-gradient-to-br from-[rgba(var(--brand)/0.08)] to-[rgba(var(--mint)/0.05)] hover:from-[rgba(var(--brand)/0.12)] hover:to-[rgba(var(--mint)/0.08)]"
            : ""
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-transform group-hover:scale-105 ${
              variant === "primary"
                ? "bg-gradient-to-br from-[rgb(var(--brand))] to-[rgb(var(--brand2))] text-white shadow-lg"
                : "bg-[rgba(var(--brand)/0.1)] text-[rgb(var(--brand))]"
            }`}
          >
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{title}</span>
              <ArrowRight className="h-4 w-4 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
            </div>
            <p className="mt-0.5 text-xs text-[rgb(var(--muted))]">{description}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

// Step Card
function StepCard({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-[rgb(var(--border))] bg-white p-4 dark:bg-slate-900">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[rgb(var(--brand))] to-[rgb(var(--brand2))] text-sm font-bold text-white">
        {number}
      </div>
      <div>
        <div className="font-semibold">{title}</div>
        <p className="mt-0.5 text-xs text-[rgb(var(--muted))]">{description}</p>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const { token, profile } = useAuth();
  const userId = profile?.user_id;

  const booksQ = useQuery({
    queryKey: ["userbooks", userId],
    enabled: !!userId,
    queryFn: () => apiFetch<Book[]>(`/api/book/userbooks/${userId}`),
  });

  const wishlistQ = useQuery({
    queryKey: ["wishlist"],
    enabled: !!token,
    queryFn: () => apiFetch<WishlistItem[]>("/api/wishlist/list", { token: token ?? undefined }),
  });

  const ordersQ = useQuery({
    queryKey: ["orders"],
    enabled: !!token,
    queryFn: () => apiFetch<Order[]>("/api/order/user-orders", { token: token ?? undefined }),
  });

  const receivedQ = useQuery({
    queryKey: ["received"],
    enabled: !!token,
    queryFn: () => apiFetch<{ receivedOrders: Order[] }>("/api/order/received-orders", { token: token ?? undefined }),
  });

  const LoadingValue = () => <span className="inline-block h-8 w-10 skeleton rounded-lg" />;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-gradient-to-br from-white via-[rgba(var(--brand)/0.03)] to-[rgba(var(--mint)/0.05)] p-6 shadow-sm dark:from-slate-900"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-[rgba(var(--brand)/0.15)] to-transparent blur-3xl" />
        
        <div className="relative">
          <Badge variant="brand" className="mb-3">
            <Sparkles className="h-3 w-3" />
            Dashboard
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""} 👋
          </h1>
          <p className="mt-2 text-sm text-[rgb(var(--muted))]">
            Manage your listings, track orders, and grow your reputation.
          </p>
        </div>
      </motion.section>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="My Listings"
          value={booksQ.isLoading ? <LoadingValue /> : booksQ.data?.length ?? 0}
          icon={<PackageSearch className="h-6 w-6 text-white" />}
          hint="Books you've posted"
          gradient="bg-gradient-to-br from-[rgb(var(--brand))] to-[rgb(var(--brand2))]"
        />
        <StatCard
          title="Wishlist"
          value={wishlistQ.isLoading ? <LoadingValue /> : wishlistQ.data?.length ?? 0}
          icon={<Heart className="h-6 w-6 text-white" />}
          hint="Saved favorites"
          gradient="bg-gradient-to-br from-[rgb(var(--brand2))] to-[rgb(var(--bad))]"
        />
        <StatCard
          title="My Orders"
          value={ordersQ.isLoading ? <LoadingValue /> : ordersQ.data?.length ?? 0}
          icon={<Inbox className="h-6 w-6 text-white" />}
          hint="Orders you placed"
          gradient="bg-gradient-to-br from-[rgb(var(--mint))] to-[rgb(var(--good))]"
        />
        <StatCard
          title="Received"
          value={receivedQ.isLoading ? <LoadingValue /> : receivedQ.data?.receivedOrders?.length ?? 0}
          icon={<TrendingUp className="h-6 w-6 text-white" />}
          hint="Orders on your books"
          gradient="bg-gradient-to-br from-[rgb(var(--good))] to-[rgb(var(--mint))]"
        />
      </div>

      {/* Quick Actions & How It Works */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card noPadding>
          <div className="border-b border-[rgb(var(--border))] p-6">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
            <p className="text-sm text-[rgb(var(--muted))]">Get things done faster</p>
          </div>
          <CardContent className="grid gap-3 p-6">
            <QuickAction
              href="/dashboard/add-book"
              icon={<BookPlus className="h-5 w-5" />}
              title="Add a Book"
              description="Post a new listing in seconds"
              variant="primary"
            />
            <QuickAction
              href="/dashboard/my-books"
              icon={<PackageSearch className="h-5 w-5" />}
              title="Manage Books"
              description="Edit or remove your listings"
            />
            <QuickAction
              href="/dashboard/orders"
              icon={<Inbox className="h-5 w-5" />}
              title="View Orders"
              description="Track your purchases"
            />
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card noPadding>
          <div className="border-b border-[rgb(var(--border))] p-6">
            <h2 className="text-lg font-semibold">How It Works</h2>
            <p className="text-sm text-[rgb(var(--muted))]">Three simple steps</p>
          </div>
          <CardContent className="space-y-3 p-6">
            <StepCard
              number={1}
              title="Add a Listing"
              description="Post with photo, type (Sale/Loan/Giveaway), and price"
            />
            <StepCard
              number={2}
              title="Manage Orders"
              description="Buyers order; you confirm or decline requests"
            />
            <StepCard
              number={3}
              title="Build Trust"
              description="Exchange ratings and reviews after transactions"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
