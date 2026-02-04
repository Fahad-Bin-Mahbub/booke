"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, ShoppingBag, ArrowUpRight, HandHeart, Clock3, Tag, User2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { apiFetch } from "@/lib/http";
import { useAuth } from "@/lib/auth/client";
import type { Book } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

// Helpers
function getBookType(book: Book): "Sale" | "Loan" | "Giveaway" {
  if (book.is_for_sale) return "Sale";
  if (book.is_for_loan) return "Loan";
  return "Giveaway";
}

function getTypeConfig(type: "Sale" | "Loan" | "Giveaway") {
  const configs = {
    Sale: { icon: Tag, variant: "brand" as const, color: "text-[rgb(var(--brand))]" },
    Loan: { icon: Clock3, variant: "mint" as const, color: "text-[rgb(var(--mint))]" },
    Giveaway: { icon: HandHeart, variant: "pink" as const, color: "text-[rgb(var(--brand2))]" },
  };
  return configs[type];
}

interface BookCardProps {
  book: Book;
  wished?: boolean;
  onWishedChange?: (book_id: number, wished: boolean) => void;
  showActions?: boolean;
}

export function BookCard({ book, wished = false, onWishedChange, showActions = true }: BookCardProps) {
  const { token, profile } = useAuth();
  const [isOrdering, setIsOrdering] = React.useState(false);
  const [isWishing, setIsWishing] = React.useState(false);

  const type = getBookType(book);
  const typeConfig = getTypeConfig(type);
  const TypeIcon = typeConfig.icon;
  const isOwnBook = profile?.user_id === book.user_id;

  const toggleWish = async () => {
    if (!token) {
      toast.message("Login to use wishlist");
      return;
    }
    if (isOwnBook) {
      toast.error("Cannot wishlist your own book");
      return;
    }
    setIsWishing(true);
    try {
      const res = await apiFetch<{ wished: boolean }>("/api/wishlist/toggle", {
        method: "POST",
        token,
        body: { book_id: book.book_id },
      });
      onWishedChange?.(book.book_id, res.wished);
      toast.success(res.wished ? "Added to wishlist" : "Removed from wishlist");
    } catch (e: any) {
      toast.error(e.message ?? "Failed");
    } finally {
      setIsWishing(false);
    }
  };

  const placeOrder = async () => {
    if (!token) {
      toast.message("Login to place an order");
      return;
    }
    if (isOwnBook) {
      toast.error("Cannot order your own book");
      return;
    }
    setIsOrdering(true);
    try {
      const res = await apiFetch<{ message: string }>("/api/order/place-order", {
        method: "POST",
        token,
        body: { book_id: book.book_id },
      });
      toast.success(res.message);
    } catch (e: any) {
      toast.error(e.message ?? "Failed");
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group card overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      {/* Image Section */}
      <div className="relative overflow-hidden">
        <div className="aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-[rgba(var(--brand)/0.08)] to-[rgba(var(--mint)/0.08)]">
          {book.book_img_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.book_img_url}
              alt={book.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-2 h-12 w-12 rounded-2xl bg-[rgba(var(--brand)/0.1)] grid place-items-center">
                  <TypeIcon className={`h-6 w-6 ${typeConfig.color}`} />
                </div>
                <span className="text-xs font-medium text-[rgb(var(--muted))]">No cover</span>
              </div>
            </div>
          )}
        </div>

        {/* Overlay Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge variant={typeConfig.variant} className="shadow-sm backdrop-blur-sm">
            <TypeIcon className="h-3 w-3" />
            {type}
          </Badge>
          {book.book_condition === "new" && (
            <Badge variant="good" className="shadow-sm backdrop-blur-sm">New</Badge>
          )}
        </div>

        {/* Price Tag */}
        <div className="absolute bottom-3 right-3">
          <span className="inline-flex items-center rounded-xl bg-white/95 px-3 py-1.5 text-sm font-bold shadow-lg backdrop-blur-sm dark:bg-slate-900/95">
            {type === "Sale" ? `৳${book.price ?? 0}` : type === "Loan" ? "Loan" : "Free"}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Genre */}
        {book.genre && (
          <span className="mb-2 inline-block text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--mint))]">
            {book.genre}
          </span>
        )}

        {/* Title & Author */}
        <h3 className="line-clamp-1 text-base font-semibold tracking-tight text-[rgb(var(--fg))]">
          {book.title}
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-[rgb(var(--muted))]">
          <span className="line-clamp-1">{book.author || "Unknown author"}</span>
          <span className="opacity-50">·</span>
          <span className="flex items-center gap-1">
            <User2 className="h-3 w-3" />
            @{book.User?.username ?? "uploader"}
          </span>
        </p>

        {/* Description */}
        {book.description ? (
          <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-[rgb(var(--muted))]">
            {book.description}
          </p>
        ) : (
          <p className="mt-3 text-xs italic text-[rgb(var(--muted))] opacity-60">
            No description provided
          </p>
        )}

        {/* Actions */}
        {showActions && (
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={toggleWish}
              disabled={isWishing}
              className={`
                btn-icon shrink-0 
                ${wished ? "bg-[rgba(var(--brand2)/0.1)] border-[rgba(var(--brand2)/0.3)]" : ""}
                ${isOwnBook ? "opacity-50 cursor-not-allowed" : ""}
              `}
              aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
              title={isOwnBook ? "Your book" : wished ? "Saved" : "Wishlist"}
            >
              <Heart
                className={`h-4 w-4 transition-colors ${
                  wished ? "fill-[rgb(var(--brand2))] text-[rgb(var(--brand2))]" : ""
                }`}
              />
            </button>

            <Link href={`/book/${book.book_id}`} className="btn-icon  shrink-0" aria-label="View details">
              <ArrowUpRight className="h-4 w-4" />
            </Link>

            <Button
              variant="primary"
              size="sm"
              onClick={placeOrder}
              disabled={isOrdering || isOwnBook}
              isLoading={isOrdering}
              leftIcon={<ShoppingBag className="h-4 w-4" />}
              className="flex-1"
            >
              {isOwnBook ? "Your Book" : "Order"}
            </Button>
          </div>
        )}
      </div>
    </motion.article>
  );
}
