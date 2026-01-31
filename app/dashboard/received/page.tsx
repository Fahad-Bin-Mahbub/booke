"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowUpRight, Check, Inbox, Package, XCircle, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

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
  };
  if (is_confirmed === 2) return { 
    label: "Discarded", 
    variant: "bad" as const, 
    icon: XCircle,
  };
  return { 
    label: "Pending", 
    variant: "warn" as const, 
    icon: Clock,
  };
}

function ReceivedOrderCard({ 
  order, 
  onConfirm, 
  onDiscard,
  isConfirming,
  isDiscarding,
}: { 
  order: Order;
  onConfirm: () => void;
  onDiscard: () => void;
  isConfirming: boolean;
  isDiscarding: boolean;
}) {
  const status = getStatusConfig(order.is_confirmed);
  const StatusIcon = status.icon;
  const cover = (order as any)?.Book?.book_img_url as string | undefined;
  const title = order.Book?.title ?? `Book #${order.book_id}`;
  const canAct = order.is_confirmed === 0;

  return (
    <Card variant="interactive" className="overflow-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-4">
          {/* Cover */}
          <div className="h-28 w-20 shrink-0 overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg1))]">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt={title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[rgba(var(--brand)/0.1)] to-[rgba(var(--mint)/0.1)]">
                <Package className="h-6 w-6 text-[rgb(var(--muted))]" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="line-clamp-1 font-semibold">{title}</h3>
              <Badge variant={status.variant}>
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </Badge>
              {order.Book?.genre && <Badge>{order.Book.genre}</Badge>}
            </div>
            <p className="mt-1 text-xs text-[rgb(var(--muted))]">
              Order #{order.order_id} · Buyer #{order.buyer_id}
            </p>
            {order.Book?.description && (
              <p className="mt-2 line-clamp-2 text-xs text-[rgb(var(--muted))]">
                {order.Book.description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link href={`/book/${order.book_id}`}>
            <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight className="h-3.5 w-3.5" />}>
              View
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            disabled={!canAct || isConfirming}
            isLoading={isConfirming}
            onClick={onConfirm}
            leftIcon={<Check className="h-3.5 w-3.5" />}
          >
            Confirm
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!canAct || isDiscarding}
            isLoading={isDiscarding}
            onClick={onDiscard}
            leftIcon={<XCircle className="h-3.5 w-3.5" />}
          >
            Discard
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function ReceivedOrdersPage() {
  const { token, profile } = useAuth();
  const qc = useQueryClient();
  const [actioningId, setActioningId] = React.useState<number | null>(null);

  const receivedQ = useQuery({
    queryKey: ["received"],
    enabled: !!token,
    queryFn: () => apiFetch<{ receivedOrders: Order[] }>("/api/order/received-orders", { token: token ?? undefined }),
  });

  const confirmM = useMutation({
    mutationFn: async (order_id: number) => {
      if (!token) throw new Error("Login required");
      setActioningId(order_id);
      return apiFetch<{ message: string }>(`/api/order/confirm-order/${order_id}`, { method: "POST", token });
    },
    onSuccess: async (res) => {
      toast.success(res.message);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["received"] }),
        qc.invalidateQueries({ queryKey: ["orders"] }),
        qc.invalidateQueries({ queryKey: ["books"] }),
        qc.invalidateQueries({ queryKey: ["userbooks", profile?.user_id] }),
      ]);
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not confirm"),
    onSettled: () => setActioningId(null),
  });

  const discardM = useMutation({
    mutationFn: async (order_id: number) => {
      if (!token) throw new Error("Login required");
      setActioningId(order_id);
      return apiFetch<{ message: string }>(`/api/order/discard-order/${order_id}`, { method: "POST", token });
    },
    onSuccess: async (res) => {
      toast.success(res.message);
      await qc.invalidateQueries({ queryKey: ["received"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not discard"),
    onSettled: () => setActioningId(null),
  });

  const orders = receivedQ.data?.receivedOrders ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-gradient-to-br from-white to-[rgba(var(--brand)/0.03)] p-6 dark:from-slate-900"
      >
        <Badge variant="brand" className="mb-3">
          <Package className="h-3 w-3" />
          Received Orders
        </Badge>
        <h1 className="text-2xl font-bold tracking-tight">Requests for Your Books</h1>
        <p className="mt-1 text-sm text-[rgb(var(--muted))]">
          Confirm to mark as transacted, or discard if unavailable.
        </p>
      </motion.section>

      {/* Orders List */}
      {receivedQ.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="h-36 animate-pulse">
              <div className="flex gap-4">
                <div className="h-28 w-20 rounded-xl skeleton" />
                <div className="flex-1 space-y-3 py-2">
                  <div className="h-5 w-2/3 skeleton rounded" />
                  <div className="h-4 w-1/2 skeleton rounded" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<Package className="h-10 w-10 text-[rgb(var(--muted))]" />}
          title="No received orders"
          description="When someone orders one of your listings, you'll manage it here."
          action={
            <Link href="/dashboard/my-books">
              <Button leftIcon={<Inbox className="h-4 w-4" />}>Manage Books</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <ReceivedOrderCard
              key={order.order_id}
              order={order}
              onConfirm={() => confirmM.mutate(order.order_id)}
              onDiscard={() => discardM.mutate(order.order_id)}
              isConfirming={confirmM.isPending && actioningId === order.order_id}
              isDiscarding={discardM.isPending && actioningId === order.order_id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
