"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Inbox, Sparkles, ExternalLink, Clock, CheckCircle2, XCircle } from "lucide-react";

import { apiFetch } from "@/lib/http";
import { useAuth } from "@/lib/auth/client";
import type { Order } from "@/lib/types";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

function getStatusConfig(is_confirmed: number) {
  if (is_confirmed === 1) return { 
    label: "Confirmed", 
    variant: "good" as const, 
    icon: CheckCircle2,
    color: "text-[rgb(var(--good))]"
  };
  if (is_confirmed === 2) return { 
    label: "Discarded", 
    variant: "bad" as const, 
    icon: XCircle,
    color: "text-[rgb(var(--bad))]"
  };
  return { 
    label: "Pending", 
    variant: "warn" as const, 
    icon: Clock,
    color: "text-[rgb(var(--warn))]"
  };
}

function OrderCard({ order }: { order: Order }) {
  const status = getStatusConfig(order.is_confirmed);
  const StatusIcon = status.icon;
  const cover = (order as any)?.Book?.book_img_url as string | undefined;
  const title = order.Book?.title ?? `Book #${order.book_id}`;

  return (
    <Card variant="interactive" className="overflow-hidden">
      <div className="flex gap-4">
        {/* Cover */}
        <div className="h-28 w-20 shrink-0 overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg1))]">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[rgba(var(--brand)/0.1)] to-[rgba(var(--mint)/0.1)]">
              <Inbox className="h-6 w-6 text-[rgb(var(--muted))]" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-1 flex-col justify-between py-1">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-1 font-semibold">{title}</h3>
              <Badge variant={status.variant}>
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-[rgb(var(--muted))]">
              Order #{order.order_id} · Seller #{order.seller_id}
            </p>
          </div>

          <div className="flex gap-2">
            <Link href={`/book/${order.book_id}`}>
              <Button variant="ghost" size="sm" leftIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                View Book
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
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
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-gradient-to-br from-white to-[rgba(var(--mint)/0.03)] p-6 dark:from-slate-900"
      >
        <Badge variant="mint" className="mb-3">
          <Inbox className="h-3 w-3" />
          My Orders
        </Badge>
        <h1 className="text-2xl font-bold tracking-tight">Orders You Placed</h1>
        <p className="mt-1 text-sm text-[rgb(var(--muted))]">
          Track the status of your purchases and loan requests.
        </p>
      </motion.section>

      {/* Orders List */}
      {ordersQ.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="h-32 animate-pulse">
              <div className="flex gap-4">
                <div className="h-28 w-20 rounded-xl skeleton" />
                <div className="flex-1 space-y-3 py-2">
                  <div className="h-5 w-2/3 skeleton rounded" />
                  <div className="h-4 w-1/3 skeleton rounded" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-10 w-10 text-[rgb(var(--muted))]" />}
          title="No orders yet"
          description="When you place an order on a book, it will show up here."
          action={
            <Link href="/">
              <Button leftIcon={<Sparkles className="h-4 w-4" />}>Browse Books</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard key={order.order_id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
