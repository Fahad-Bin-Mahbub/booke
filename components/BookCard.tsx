"use client";

import Link from "next/link";
import { Heart, ShoppingBag, ArrowUpRight, HandHeart, Clock3, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { apiFetch } from "@/lib/http";
import { useAuth } from "@/lib/auth/client";
import type { Book } from "@/lib/types";

function kind(book: Book) {
  if (book.is_for_sale) return "Sale";
  if (book.is_for_loan) return "Loan";
  return "Giveaway";
}

export function BookCard({ book, wished, onWishedChange }: { book: Book; wished?: boolean; onWishedChange?: (book_id: number, wished: boolean) => void }) {
  const { token } = useAuth();
  const label = kind(book);

  const toggleWish = async () => {
    if (!token) {
      toast.message("Login to use wishlist");
      return;
    }
    try {
      const res = await apiFetch<{ wished: boolean }>("/api/wishlist/toggle", {
        method: "POST",
        token,
        body: { book_id: book.book_id },
      });
      onWishedChange?.(book.book_id, res.wished);
    } catch (e: any) {
      toast.error(e.message ?? "Failed");
    }
  };

  const placeOrder = async () => {
    if (!token) {
      toast.message("Login to place an order");
      return;
    }
    try {
      const res = await apiFetch<{ message: string }>("/api/order/place-order", {
        method: "POST",
        token,
        body: { book_id: book.book_id },
      });
      toast.success(res.message);
    } catch (e: any) {
      toast.error(e.message ?? "Failed");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="card card-hover overflow-hidden"
    >
      <div className="relative">
        <div className="aspect-[16/10] w-full overflow-hidden bg-white/30 dark:bg-white/5">
          {book.book_img_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={book.book_img_url} alt={book.title} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[rgba(var(--brand)/0.22)] to-[rgba(var(--brand2)/0.18)]" />
          )}
        </div>
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="chip">
            {label === "Sale" ? <Tag className="h-3.5 w-3.5" /> : label === "Loan" ? <Clock3 className="h-3.5 w-3.5" /> : <HandHeart className="h-3.5 w-3.5" />}
            {label}
          </span>
          <span className="chip opacity-90">{book.book_condition === "new" ? "New" : "Used"}</span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold tracking-tight">{book.title}</h3>
            <p className="mt-1 truncate text-xs text-[rgb(var(--muted))]">
              {book.author ? book.author : "Unknown author"} · @{book.User?.username ?? "uploader"}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-sm font-semibold">
              {label === "Sale" ? `৳${book.price ?? 0}` : label === "Loan" ? "Loan" : "Free"}
            </div>
            <div className="text-[10px] text-[rgb(var(--muted))]">#{book.book_id}</div>
          </div>
        </div>

        {book.description ? (
          <p className="mt-3 line-clamp-2 text-xs text-[rgb(var(--muted))]">{book.description}</p>
        ) : (
          <div className="mt-3 text-xs text-[rgb(var(--muted))]">No description provided.</div>
        )}

        <div className="mt-4 flex items-center gap-2">
          <button onClick={toggleWish} className={`btn btn-ghost flex-1 ${wished ? "ring-2 ring-[rgba(var(--brand2)/0.35)]" : ""}`}>
            <Heart className={`h-4 w-4 ${wished ? "fill-[rgb(var(--brand2))]" : ""}`} />
            Wishlist
          </button>
          <button onClick={placeOrder} className="btn btn-primary flex-1">
            <ShoppingBag className="h-4 w-4" />
            Order
          </button>
          <Link href={`/book/${book.book_id}`} className="btn btn-ghost">
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
