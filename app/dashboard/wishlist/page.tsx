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
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

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
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-gradient-to-br from-white to-[rgba(var(--brand2)/0.03)] p-6 dark:from-slate-900"
      >
        <Badge variant="pink" className="mb-3">
          <Heart className="h-3 w-3" />
          Wishlist
        </Badge>
        <h1 className="text-2xl font-bold tracking-tight">Your Saved Favorites</h1>
        <p className="mt-1 text-sm text-[rgb(var(--muted))]">
          Quickly revisit listings you want to buy, loan, or pick up later.
        </p>
        {items.length > 0 && (
          <div className="mt-4">
            <Badge variant="brand">{items.length} saved</Badge>
          </div>
        )}
      </motion.section>

      {/* Grid */}
      {wishQ.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-10 w-10 text-[rgb(var(--brand2))]" />}
          title="Nothing saved yet"
          description="Tap the heart icon on any listing to save it here for later."
          action={
            <Link href="/">
              <Button leftIcon={<Search className="h-4 w-4" />}>Browse Books</Button>
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

      {/* Pro Tip */}
      {items.length > 0 && (
        <Card className="bg-gradient-to-br from-[rgba(var(--brand2)/0.05)] to-[rgba(var(--brand)/0.03)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[rgb(var(--brand2))] to-[rgb(var(--brand))]">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold">Pro Tip</div>
                <p className="mt-0.5 text-xs text-[rgb(var(--muted))]">
                  Remove items anytime by tapping the{" "}
                  <span className="inline-flex items-center gap-1 font-medium text-[rgb(var(--brand2))]">
                    <Heart className="h-3 w-3" /> heart
                  </span>{" "}
                  icon again.
                </p>
              </div>
            </div>
            <Link href="/">
              <Button variant="ghost" size="sm">Explore More</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
