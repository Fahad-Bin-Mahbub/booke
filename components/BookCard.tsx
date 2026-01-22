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
  const typeBadge = label === "Sale" ? "badge-brand" : label === "Loan" ? "badge-mint" : "badge-pink";

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
      <div className="p-4">
        <div className="relative overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg1))]">
          <div className="aspect-[16/11] w-full">
            {book.book_img_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={book.book_img_url}
                alt={book.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-[rgba(var(--brand)/0.18)] via-[rgba(var(--mint)/0.14)] to-[rgba(var(--brand2)/0.16)]" />
            )}
          </div>

          {/* top badges */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <span className={`badge ${typeBadge}`}>
              {label === "Sale" ? (
                <Tag className="h-3.5 w-3.5" />
              ) : label === "Loan" ? (
                <Clock3 className="h-3.5 w-3.5" />
              ) : (
                <HandHeart className="h-3.5 w-3.5" />
              )}
              {label}
            </span>
            <span className={`badge ${book.book_condition === "new" ? "badge-good" : ""}`}>
              {book.book_condition === "new" ? "New" : "Used"}
            </span>
            {book.genre ? <span className="badge">{book.genre}</span> : null}
          </div>

          {/* bottom price pill */}
          <div className="absolute bottom-3 right-3">
			  <span
				className="badge"
				style={{ background: "#fff", boxShadow: "var(--shadow-sm)", borderColor: "rgba(15,23,42,0.10)" }}
			  >
              {label === "Sale" ? `৳${book.price ?? 0}` : label === "Loan" ? "Loan" : "Free"}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold tracking-tight">{book.title}</h3>
            <p className="mt-1 truncate text-xs text-[rgb(var(--muted))]">
              {book.author ? book.author : "Unknown author"} · @{book.User?.username ?? "uploader"}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[10px] font-semibold text-[rgb(var(--muted))]">ID</div>
            <div className="text-sm font-semibold">#{book.book_id}</div>
          </div>
        </div>

        {book.description ? (
          <p className="mt-3 line-clamp-2 text-sm leading-5 text-[rgb(var(--muted))]">{book.description}</p>
        ) : (
          <div className="mt-3 text-sm text-[rgb(var(--muted))]">No description provided.</div>
        )}

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={toggleWish}
            className={`btn-icon ${wished ? "ring-2 ring-[rgba(var(--brand2)/0.35)]" : ""}`}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            title={wished ? "Saved" : "Wishlist"}
          >
            <Heart className={`h-4 w-4 ${wished ? "fill-[rgb(var(--brand2))]" : ""}`} />
          </button>

          <Link href={`/book/${book.book_id}`} className="btn-icon" aria-label="View details" title="View">
            <ArrowUpRight className="h-4 w-4" />
          </Link>

          <button onClick={placeOrder} className="btn btn-primary flex-1">
            <ShoppingBag className="h-4 w-4" />
            Order
          </button>
        </div>
      </div>
    </motion.div>
  );
}
