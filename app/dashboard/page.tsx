"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookPlus, Heart, PackageSearch, Inbox, Sparkles } from "lucide-react";

import { apiFetch } from "@/lib/http";
import { useAuth } from "@/lib/auth/client";
import type { Book, Order, WishlistItem } from "@/lib/types";

function StatCard({
  title,
  value,
  icon,
  hint,
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  hint: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-[rgb(var(--muted))]">{title}</div>
          <div className="mt-1 text-3xl font-semibold tracking-tight">{value}</div>
          <div className="mt-1 text-xs text-[rgb(var(--muted))]">{hint}</div>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg1))]">
          {icon}
        </div>
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

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="card relative overflow-hidden p-6"
      >
        <div className="relative">
          <div className="chip chip-brand">
            <Sparkles className="h-4 w-4" />
            Dashboard
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">Welcome{profile?.name ? `, ${profile.name}` : ""} 👋</h1>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">
            Manage listings, orders, and your profile. Everything updates instantly.
          </p>
        </div>
      </motion.section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="My listings"
          value={booksQ.isLoading ? <span className="inline-block h-8 w-12 skeleton" /> : booksQ.data?.length ?? 0}
          icon={<PackageSearch className="h-5 w-5" />}
          hint="Books you've posted"
        />
        <StatCard
          title="Wishlist"
          value={wishlistQ.isLoading ? <span className="inline-block h-8 w-12 skeleton" /> : wishlistQ.data?.length ?? 0}
          icon={<Heart className="h-5 w-5" />}
          hint="Saved favorites"
        />
        <StatCard
          title="My orders"
          value={ordersQ.isLoading ? <span className="inline-block h-8 w-12 skeleton" /> : ordersQ.data?.length ?? 0}
          icon={<Inbox className="h-5 w-5" />}
          hint="Orders you placed"
        />
        <StatCard
          title="Received"
          value={receivedQ.isLoading ? <span className="inline-block h-8 w-12 skeleton" /> : receivedQ.data?.receivedOrders?.length ?? 0}
          icon={<BookPlus className="h-5 w-5" />}
          hint="Orders on your books"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-6">
          <div className="text-sm font-semibold">Quick actions</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link href="/dashboard/add-book" className="btn btn-primary justify-center">
              <BookPlus className="h-4 w-4" />
              Add a book
            </Link>
            <Link href="/dashboard/my-books" className="btn btn-ghost justify-center">
              <PackageSearch className="h-4 w-4" />
              Manage my books
            </Link>
            <Link href="/dashboard/orders" className="btn btn-ghost justify-center">
              <Inbox className="h-4 w-4" />
              View my orders
            </Link>
            <Link href="/dashboard/profile" className="btn btn-ghost justify-center">
              <Sparkles className="h-4 w-4" />
              Update profile
            </Link>
          </div>
        </div>

        <div className="card p-6">
          <div className="text-sm font-semibold">How it works</div>
          <ol className="mt-4 grid gap-3 text-sm text-[rgb(var(--muted))]">
            <li className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg1))] p-4">
              <span className="font-semibold text-[rgb(var(--fg))]">1.</span> Add a listing with photo + type (Sale/Loan/Giveaway).
            </li>
            <li className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg1))] p-4">
              <span className="font-semibold text-[rgb(var(--fg))]">2.</span> Buyers place orders; sellers confirm or discard.
            </li>
            <li className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg1))] p-4">
              <span className="font-semibold text-[rgb(var(--fg))]">3.</span> After a transaction, leave rating + review to build trust.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
