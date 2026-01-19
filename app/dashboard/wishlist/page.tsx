"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Heart, Search, Sparkles } from "lucide-react";

import { apiFetch } from "@/lib/http";
import { useAuth } from "@/lib/auth/client";
import type { WishlistItem } from "@/lib/types";
import { EmptyState } from "@/components/EmptyState";
import { BookCard } from "@/components/BookCard";
import { BookCardSkeleton } from "@/components/BookCardSkeleton";

export default function WishlistPage() {
  const qc = useQueryClient();
  const { token } = useAuth();

  const wishQ = useQuery({
    queryKey: ["wishlist"],
    enabled: !!token,
    queryFn: () => apiFetch<WishlistItem[]>("/api/wishlist/list", { token: token ?? undefined }),
  });

  const items = wishQ.data ?? [];
  const books = items.map((i) => i.Book).filter(Boolean) as NonNullable<WishlistItem["Book"]>[];

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="card p-6"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/40 px-3 py-1 text-xs font-medium dark:bg-white/5">
          <Sparkles className="h-4 w-4" />
          Wishlist
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Your saved favorites</h1>
        <p className="mt-1 text-sm text-[rgb(var(--muted))]">Quickly revisit listings you want to buy, loan, or pick up later.</p>
      </motion.section>

      {wishQ.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="Nothing saved yet"
          description="Tap the heart icon on any listing to save it here."
          action={
            <Link href="/" className="btn btn-primary">
              <Search className="h-4 w-4" />
              Browse books
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((b) => (
            <BookCard
              key={b.book_id}
              book={b}
              wished
              onWishedChange={async () => {
                await qc.invalidateQueries({ queryKey: ["wishlist"] });
              }}
            />
          ))}
        </div>
      )}

      {items.length > 0 ? (
        <div className="card p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold">Pro tip</div>
              <div className="mt-1 text-sm text-[rgb(var(--muted))]">
                You can remove an item anytime — just tap the <span className="inline-flex items-center gap-1 font-medium text-[rgb(var(--fg))]"><Heart className="h-4 w-4" />heart</span> again.
              </div>
            </div>
            <Link href="/" className="btn btn-ghost">Explore more</Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
