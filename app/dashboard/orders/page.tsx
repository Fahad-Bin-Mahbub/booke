"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Inbox, Sparkles } from "lucide-react";

import { apiFetch } from "@/lib/http";
import { useAuth } from "@/lib/auth/client";
import type { Order } from "@/lib/types";
import { EmptyState } from "@/components/EmptyState";

function statusLabel(is_confirmed: number) {
  if (is_confirmed === 1) return { label: "Confirmed", cls: "badge badge-good" };
  if (is_confirmed === 2) return { label: "Discarded", cls: "badge badge-bad" };
  return { label: "Pending", cls: "badge badge-warn" };
}

export default function OrdersPage() {
  const { token } = useAuth();

  const ordersQ = useQuery({
    queryKey: ["orders"],
    enabled: !!token,
    queryFn: () => apiFetch<Order[]>("/api/order/user-orders", { token: token ?? undefined }),
  });

  const orders = ordersQ.data ?? [];

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="card p-6"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg1))] px-3 py-1 text-xs font-medium dark:bg-slate-900">
          <Sparkles className="h-4 w-4" />
          My orders
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Orders you placed</h1>
        <p className="mt-1 text-sm text-[rgb(var(--muted))]">Track the status of your purchases/requests.</p>
      </motion.section>

      {ordersQ.isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-5">
              <div className="h-5 w-1/2 skeleton" />
              <div className="mt-2 h-4 w-1/3 skeleton" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="When you place an order on a book, it will show up here."
          action={
            <Link href="/" className="btn btn-primary">
              <Inbox className="h-4 w-4" />
              Browse books
            </Link>
          }
        />
      ) : (
        <div className="grid gap-3">
          {orders.map((o) => {
            const s = statusLabel(o.is_confirmed);
            const cover = (o as any)?.Book?.book_img_url as string | undefined;
            const title = o.Book?.title ?? `Book #${o.book_id}`;

            return (
              <div key={o.order_id} className="card p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <div className="h-24 w-20 shrink-0 overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg1))]">
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cover} alt={title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-[rgba(var(--brand)/0.18)] via-[rgba(var(--mint)/0.14)] to-[rgba(var(--brand2)/0.16)]" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="truncate text-base font-semibold">{title}</div>
                        <span className={s.cls}>{s.label}</span>
                      </div>
                      <div className="mt-1 text-sm text-[rgb(var(--muted))]">Order #{o.order_id} · seller {o.seller_id}</div>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <Link href={`/book/${o.book_id}`} className="btn btn-ghost">
                      View book
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
