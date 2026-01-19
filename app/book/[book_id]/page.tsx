"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, ShoppingBag, Star, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/http";
import { useAuth } from "@/lib/auth/client";
import type { Book, RatingStats, Review, WishlistItem } from "@/lib/types";
import { EmptyState } from "@/components/EmptyState";
import { BookCard } from "@/components/BookCard";
import { BookCardSkeleton } from "@/components/BookCardSkeleton";

export default function BookDetailPage() {
  const params = useParams<{ book_id: string }>();
  const book_id = Number(params.book_id);
  const qc = useQueryClient();
  const { token } = useAuth();

  const bookQ = useQuery({
    queryKey: ["book", book_id],
    queryFn: () => apiFetch<Book>(`/api/book/book/${book_id}`),
    enabled: Number.isFinite(book_id),
  });

  const wishQ = useQuery({
    queryKey: ["wishlist"],
    enabled: !!token,
    queryFn: () => apiFetch<WishlistItem[]>("/api/wishlist/list", { token: token ?? undefined }),
  });

  const wished = React.useMemo(() => {
    if (!bookQ.data) return false;
    return (wishQ.data ?? []).some((w) => w.book_id === bookQ.data!.book_id);
  }, [wishQ.data, bookQ.data]);

  const ratingQ = useQuery({
    queryKey: ["rating", bookQ.data?.user_id],
    enabled: !!bookQ.data?.user_id,
    queryFn: () => apiFetch<RatingStats>(`/api/rating/ratings/${bookQ.data!.user_id}`),
  });

  const reviewQ = useQuery({
    queryKey: ["reviews", bookQ.data?.user_id],
    enabled: !!bookQ.data?.user_id,
    queryFn: () => apiFetch<Review[]>(`/api/review/reviews/${bookQ.data!.user_id}`),
  });

  const moreQ = useQuery({
    queryKey: ["more-books", bookQ.data?.user_id],
    enabled: !!bookQ.data?.user_id,
    queryFn: () => apiFetch<Book[]>(`/api/book/userbooks/${bookQ.data!.user_id}`),
  });

  const toggleWish = async () => {
    if (!token) {
      toast.message("Login to use wishlist");
      return;
    }
    try {
      await apiFetch("/api/wishlist/toggle", { method: "POST", token, body: { book_id } });
      await qc.invalidateQueries({ queryKey: ["wishlist"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Could not update wishlist");
    }
  };

  const placeOrder = async () => {
    if (!token) {
      toast.message("Login to place an order");
      return;
    }
    try {
      const res = await apiFetch<{ message: string }>("/api/order/place-order", { method: "POST", token, body: { book_id } });
      toast.success(res.message);
    } catch (e: any) {
      toast.error(e?.message ?? "Could not place order");
    }
  };

  if (bookQ.isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card overflow-hidden">
          <div className="aspect-[16/10] w-full skeleton" />
          <div className="p-6">
            <div className="h-6 w-2/3 skeleton" />
            <div className="mt-3 h-4 w-1/2 skeleton" />
            <div className="mt-6 h-10 w-full skeleton" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="card p-6">
            <div className="h-5 w-1/2 skeleton" />
            <div className="mt-4 h-3 w-full skeleton" />
            <div className="mt-2 h-3 w-5/6 skeleton" />
          </div>
          <BookCardSkeleton />
        </div>
      </div>
    );
  }

  if (bookQ.isError || !bookQ.data) {
    return (
      <EmptyState
        title="Book not found"
        description={(bookQ.error as Error)?.message ?? "This listing may have been removed."}
        action={
          <Link href="/" className="btn btn-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to Explore
          </Link>
        }
      />
    );
  }

  const b = bookQ.data;
  const stats = ratingQ.data;
  const reviews = (reviewQ.data ?? []).slice(0, 3);
  const more = (moreQ.data ?? []).filter((x) => x.book_id !== b.book_id).slice(0, 3);

  return (
    <div className="space-y-6">
      <Link href="/" className="btn btn-ghost w-fit">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="card overflow-hidden"
        >
          <div className="relative">
            <div className="aspect-[16/10] w-full overflow-hidden bg-white/30 dark:bg-white/5">
              {b.book_img_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.book_img_url} alt={b.title} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-[rgba(var(--brand)/0.22)] to-[rgba(var(--brand2)/0.18)]" />
              )}
            </div>
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              <span className="chip">{b.genre ?? "General"}</span>
              <span className="chip">{b.book_condition === "new" ? "New" : "Used"}</span>
              <span className="chip">
                {b.is_for_sale ? "Sale" : b.is_for_loan ? "Loan" : "Giveaway"}
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight">{b.title}</h1>
                <p className="mt-1 text-sm text-[rgb(var(--muted))]">
                  {b.author ? `by ${b.author}` : "Unknown author"} · posted by @{b.User?.username ?? "uploader"}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-xl font-semibold">
                  {b.is_for_sale ? `৳${b.price ?? 0}` : b.is_for_loan ? "Loan" : "Free"}
                </div>
                <div className="text-xs text-[rgb(var(--muted))]">Listing #{b.book_id}</div>
              </div>
            </div>

            {b.description ? (
              <p className="mt-4 text-sm leading-6 text-[rgb(var(--muted))]">{b.description}</p>
            ) : (
              <div className="mt-4 text-sm text-[rgb(var(--muted))]">No description provided.</div>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button onClick={toggleWish} className={`btn btn-ghost ${wished ? "ring-2 ring-[rgba(var(--brand2)/0.35)]" : ""}`}>
                <Heart className={`h-4 w-4 ${wished ? "fill-[rgb(var(--brand2))]" : ""}`} />
                {wished ? "Saved" : "Add to wishlist"}
              </button>
              <button onClick={placeOrder} className="btn btn-primary">
                <ShoppingBag className="h-4 w-4" />
                Place order
              </button>
            </div>

            <div className="mt-4 text-xs text-[rgb(var(--muted))]">
              Want to rate/review the uploader? Visit their profile after you complete a transaction.
            </div>
          </div>
        </motion.section>

        <div className="space-y-6">
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Uploader</div>
                <div className="mt-1 text-xs text-[rgb(var(--muted))]">User ID: {b.user_id}</div>
              </div>
              <Link href={`/user/${b.user_id}`} className="btn btn-ghost">
                View profile
              </Link>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/50 p-4 dark:bg-white/5">
                <div className="flex items-center gap-2 text-xs text-[rgb(var(--muted))]">
                  <Star className="h-4 w-4" /> Rating
                </div>
                <div className="mt-1 text-2xl font-semibold">
                  {stats ? stats.averageRating.toFixed(1) : "—"}
                </div>
                <div className="text-xs text-[rgb(var(--muted))]">from {stats ? stats.ratingCount : "—"} ratings</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/50 p-4 dark:bg-white/5">
                <div className="flex items-center gap-2 text-xs text-[rgb(var(--muted))]">
                  <MessageSquare className="h-4 w-4" /> Reviews
                </div>
                <div className="mt-1 text-2xl font-semibold">{reviewQ.data ? reviewQ.data.length : "—"}</div>
                <div className="text-xs text-[rgb(var(--muted))]">latest feedback</div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {reviews.length === 0 ? (
                <div className="text-sm text-[rgb(var(--muted))]">No reviews yet.</div>
              ) : (
                reviews.map((r) => (
                  <div key={r.review_id} className="rounded-2xl border border-white/10 bg-white/50 p-4 text-sm dark:bg-white/5">
                    <div className="text-xs text-[rgb(var(--muted))]">@{r.Reviewer?.username ?? "reviewer"}</div>
                    <div className="mt-1">{r.review}</div>
                  </div>
                ))
              )}
            </div>
          </motion.section>

          {moreQ.isLoading ? (
            <div className="grid gap-4">
              {Array.from({ length: 1 }).map((_, i) => (
                <BookCardSkeleton key={i} />
              ))}
            </div>
          ) : more.length > 0 ? (
            <div className="space-y-3">
              <div className="text-sm font-semibold">More from this uploader</div>
              <div className="grid gap-4">
                {more.map((x) => (
                  <BookCard key={x.book_id} book={x} wished={(wishQ.data ?? []).some((w) => w.book_id === x.book_id)} onWishedChange={() => qc.invalidateQueries({ queryKey: ["wishlist"] })} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
