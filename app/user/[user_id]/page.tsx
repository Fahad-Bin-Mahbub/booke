"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Star, MessageSquarePlus, User2 } from "lucide-react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/http";
import { useAuth } from "@/lib/auth/client";
import type { Book, RatingStats, Review, UserPublic } from "@/lib/types";
import { EmptyState } from "@/components/EmptyState";
import { BookCard } from "@/components/BookCard";
import { BookCardSkeleton } from "@/components/BookCardSkeleton";

const ratingFormSchema = z.object({ rating: z.coerce.number().min(0).max(10) });
const reviewFormSchema = z.object({ review: z.string().min(2, "Write a short review") });

export default function UserProfilePage() {
  const params = useParams<{ user_id: string }>();
  const user_id = Number(params.user_id);
  const qc = useQueryClient();
  const { token, profile } = useAuth();

  const authed = !!token;

  const userQ = useQuery({
    queryKey: ["uploader", user_id],
    enabled: authed && Number.isFinite(user_id),
    queryFn: () => apiFetch<UserPublic>(`/api/user/uploader-profile/${user_id}`, { token: token as string }),
  });

  const ratingQ = useQuery({
    queryKey: ["rating", user_id],
    enabled: Number.isFinite(user_id),
    queryFn: () => apiFetch<RatingStats>(`/api/rating/ratings/${user_id}`),
  });

  const reviewsQ = useQuery({
    queryKey: ["reviews", user_id],
    enabled: Number.isFinite(user_id),
    queryFn: () => apiFetch<Review[]>(`/api/review/reviews/${user_id}`),
  });

  const booksQ = useQuery({
    queryKey: ["userbooks", user_id],
    enabled: Number.isFinite(user_id),
    queryFn: () => apiFetch<Book[]>(`/api/book/userbooks/${user_id}`),
  });

  const ratingForm = useForm<z.infer<typeof ratingFormSchema>>({
    resolver: zodResolver(ratingFormSchema),
    defaultValues: { rating: 8 },
  });

  const reviewForm = useForm<z.infer<typeof reviewFormSchema>>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: { review: "" },
  });

  const submitRating = async (values: z.infer<typeof ratingFormSchema>) => {
    try {
      await apiFetch(`/api/rating/add-rating/${user_id}`, {
        method: "POST",
        token: token as string,
        body: { rating: values.rating, recipient_id: user_id },
      });
      toast.success("Rating saved");
      await qc.invalidateQueries({ queryKey: ["rating", user_id] });
    } catch (e: any) {
      toast.error(e?.message ?? "Could not rate");
    }
  };

  const submitReview = async (values: z.infer<typeof reviewFormSchema>) => {
    try {
      await apiFetch(`/api/review/add-review/${user_id}`, {
        method: "POST",
        token: token as string,
        body: { review: values.review, recipient_id: user_id },
      });
      toast.success("Review posted");
      reviewForm.reset({ review: "" });
      await qc.invalidateQueries({ queryKey: ["reviews", user_id] });
    } catch (e: any) {
      toast.error(e?.message ?? "Could not review");
    }
  };

  if (!authed) {
    return (
      <EmptyState
        title="Login required"
        description="Viewing uploader profiles requires an account (this matches the original project behavior)."
        action={
          <Link href="/login" className="btn btn-primary">
            Login
          </Link>
        }
      />
    );
  }

  if (userQ.isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card p-6">
          <div className="h-6 w-1/2 skeleton" />
          <div className="mt-3 h-4 w-2/3 skeleton" />
          <div className="mt-6 h-24 w-full skeleton" />
        </div>
        <BookCardSkeleton />
      </div>
    );
  }

  if (userQ.isError || !userQ.data) {
    return (
      <EmptyState
        title="User not found"
        description={(userQ.error as Error)?.message ?? "This profile may not exist."}
        action={
          <Link href="/" className="btn btn-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to Explore
          </Link>
        }
      />
    );
  }

  const u = userQ.data;
  const stats = ratingQ.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="btn btn-ghost w-fit">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        {profile?.user_id === u.user_id ? (
          <Link href="/dashboard/profile" className="btn btn-primary">
            Edit my profile
          </Link>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="card p-6"
        >
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg1))] dark:bg-slate-900">
              <User2 className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="text-xl font-semibold tracking-tight">{u.name}</div>
              <div className="mt-1 text-sm text-[rgb(var(--muted))]">@{u.username} · {u.email}</div>
              {u.address ? <div className="mt-1 text-sm text-[rgb(var(--muted))]">{u.address}</div> : null}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg1))] p-4 dark:bg-slate-900">
              <div className="flex items-center gap-2 text-xs text-[rgb(var(--muted))]">
                <Star className="h-4 w-4" /> Rating
              </div>
              <div className="mt-1 text-2xl font-semibold">{stats ? stats.averageRating.toFixed(1) : "—"}</div>
              <div className="text-xs text-[rgb(var(--muted))]">from {stats ? stats.ratingCount : "—"} ratings</div>
            </div>
            <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg1))] p-4 dark:bg-slate-900">
              <div className="text-xs text-[rgb(var(--muted))]">Listings</div>
              <div className="mt-1 text-2xl font-semibold">{booksQ.data ? booksQ.data.length : "—"}</div>
              <div className="text-xs text-[rgb(var(--muted))]">books posted</div>
            </div>
          </div>

          {profile?.user_id !== u.user_id ? (
            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg1))] p-4 text-sm dark:bg-slate-900">
                <div className="font-semibold">Leave a rating</div>
                <p className="mt-1 text-xs text-[rgb(var(--muted))]">You can only rate if you have a direct transaction link.</p>

                <form onSubmit={ratingForm.handleSubmit(submitRating)} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
                  <label className="grid w-full gap-1">
                    <span className="text-xs text-[rgb(var(--muted))]">Rating (0–10)</span>
                    <input type="number" min={0} max={10} step={1} className="input" {...ratingForm.register("rating")} />
                    {ratingForm.formState.errors.rating ? (
                      <span className="text-xs text-[rgb(var(--bad))]">{ratingForm.formState.errors.rating.message}</span>
                    ) : null}
                  </label>
                  <button disabled={ratingForm.formState.isSubmitting} className="btn btn-primary sm:w-[180px]">
                    {ratingForm.formState.isSubmitting ? "Saving…" : "Save rating"}
                  </button>
                </form>
              </div>

              <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg1))] p-4 text-sm dark:bg-slate-900">
                <div className="flex items-center gap-2 font-semibold">
                  <MessageSquarePlus className="h-4 w-4" /> Leave a review
                </div>
                <p className="mt-1 text-xs text-[rgb(var(--muted))]">Short, constructive feedback helps build trust.</p>

                <form onSubmit={reviewForm.handleSubmit(submitReview)} className="mt-3 grid gap-2">
                  <textarea rows={4} className="input" placeholder="Write your review…" {...reviewForm.register("review")} />
                  {reviewForm.formState.errors.review ? (
                    <span className="text-xs text-[rgb(var(--bad))]">{reviewForm.formState.errors.review.message}</span>
                  ) : null}
                  <button disabled={reviewForm.formState.isSubmitting} className="btn btn-primary justify-center">
                    {reviewForm.formState.isSubmitting ? "Posting…" : "Post review"}
                  </button>
                </form>
              </div>
            </div>
          ) : null}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="space-y-4"
        >
          <div className="card p-6">
            <div className="text-sm font-semibold">Reviews</div>
            <div className="mt-4 space-y-3">
              {(reviewsQ.data ?? []).length === 0 ? (
                <div className="text-sm text-[rgb(var(--muted))]">No reviews yet.</div>
              ) : (
                (reviewsQ.data ?? []).slice(0, 6).map((r) => (
                  <div key={r.review_id} className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg1))] p-4 text-sm dark:bg-slate-900">
                    <div className="text-xs text-[rgb(var(--muted))]">@{r.Reviewer?.username ?? "reviewer"}</div>
                    <div className="mt-1">{r.review}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.section>
      </div>

      <div className="space-y-3">
        <div className="text-sm font-semibold">Books by @{u.username}</div>
        {booksQ.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : (booksQ.data?.length ?? 0) === 0 ? (
          <EmptyState title="No listings" description="This uploader hasn't posted any books yet." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(booksQ.data ?? []).filter((b) => !b.transaction).slice(0, 9).map((b) => (
              <BookCard key={b.book_id} book={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
