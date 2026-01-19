"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/http";
import { useAuth } from "@/lib/auth/client";
import type { Book, Genre, WishlistItem } from "@/lib/types";
import { BookCard } from "@/components/BookCard";
import { BookCardSkeleton } from "@/components/BookCardSkeleton";
import { EmptyState } from "@/components/EmptyState";

type SortOpt = "Newest" | "A to Z" | "Z to A" | "Price Low to High" | "Price High to Low";

type BookTypeOpt = "All" | "Sale" | "Loan" | "Giveaway";

export default function ExplorePage() {
  const qc = useQueryClient();
  const { token } = useAuth();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [genre, setGenre] = React.useState<string>("All");
  const [bookType, setBookType] = React.useState<BookTypeOpt>("All");
  const [sort, setSort] = React.useState<SortOpt>("Newest");

  const { data: genres, isLoading: genresLoading } = useQuery({
    queryKey: ["genres"],
    queryFn: () => apiFetch<Genre[]>("/api/genre/all"),
  });

  const wishQ = useQuery({
    queryKey: ["wishlist"],
    enabled: !!token,
    queryFn: () => apiFetch<WishlistItem[]>("/api/wishlist/list", { token: token ?? undefined }),
  });

  const wishedSet = React.useMemo(() => {
    const set = new Set<number>();
    for (const it of wishQ.data ?? []) set.add(it.book_id);
    return set;
  }, [wishQ.data]);

  const booksQ = useQuery({
    queryKey: ["books", { searchQuery, genre, bookType, sort }],
    queryFn: async () => {
      const q = searchQuery.trim();
      if (q) {
        return apiFetch<Book[]>(`/api/book/search?searchQuery=${encodeURIComponent(q)}`);
      }

      const hasFilters = genre !== "All" || bookType !== "All" || sort !== "Newest";
      if (hasFilters) {
        const params = new URLSearchParams();
        if (genre !== "All") params.set("genre", genre);
        if (bookType !== "All") params.set("book_type", bookType);
        if (sort !== "Newest") params.set("sort", sort);
        return apiFetch<Book[]>(`/api/book/filter?${params.toString()}`);
      }

      const res = await apiFetch<{ books: Book[] }>("/api/book/allbooks");
      return res.books;
    },
  });

  const onClear = () => {
    setSearchQuery("");
    setGenre("All");
    setBookType("All");
    setSort("Newest");
  };

  const seedDemo = async () => {
    try {
      const res = await apiFetch<{ message: string }>("/api/seed?ifEmpty=1", { method: "POST" });
      toast.success(res.message);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["genres"] }),
        qc.invalidateQueries({ queryKey: ["books"] }),
      ]);
    } catch (e: any) {
      toast.error(e?.message ?? "Could not seed");
    }
  };

  const titleGlow = (
    <span className="bg-gradient-to-r from-[rgb(var(--brand))] via-[rgb(var(--brand2))] to-[rgb(var(--mint))] bg-clip-text text-transparent">
      BookE
    </span>
  );

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="card overflow-hidden"
      >
        <div className="relative p-6 sm:p-8">
          <div className="absolute inset-0 opacity-70">
            <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[rgba(var(--brand)/0.18)] blur-3xl" />
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[rgba(var(--brand2)/0.16)] blur-3xl" />
            <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[rgba(var(--mint)/0.14)] blur-3xl" />
          </div>

          <div className="relative">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/40 px-3 py-1 text-xs font-medium dark:bg-white/5">
                  <Sparkles className="h-4 w-4" />
                  Modern book exchange marketplace
                </div>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Discover your next read on {titleGlow}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-[rgb(var(--muted))] sm:text-base">
                  Browse listings, wishlist favorites, and place orders in seconds. Built with Next.js + MongoDB for a fast, polished experience.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="card bg-white/50 p-4 dark:bg-white/5">
                  <div className="text-xs text-[rgb(var(--muted))]">Listings</div>
                  <div className="mt-1 text-2xl font-semibold">{booksQ.data?.length ?? "—"}</div>
                </div>
                <div className="card bg-white/50 p-4 dark:bg-white/5">
                  <div className="text-xs text-[rgb(var(--muted))]">Wishlist</div>
                  <div className="mt-1 text-2xl font-semibold">{token ? (wishQ.data?.length ?? "—") : "—"}</div>
                </div>
              </div>
            </div>
            <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto]">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/60 px-3 py-2 dark:bg-white/5">
                <Search className="h-4 w-4 opacity-70" />
                <input
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[rgb(var(--muted))]"
                  placeholder="Search by title (e.g., Atomic Habits)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery.trim() ? (
                  <button
                    className="btn btn-ghost !px-2 !py-2"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/60 px-3 py-2 text-xs font-medium dark:bg-white/5">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </div>
                <button onClick={onClear} className="btn btn-ghost">Reset</button>
              </div>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <label className="grid gap-1">
                <span className="text-xs text-[rgb(var(--muted))]">Genre</span>
                <select
                  className="input"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  disabled={genresLoading}
                >
                  <option value="All">All</option>
                  {(genres ?? []).map((g) => (
                    <option key={g.genre_id} value={g.name}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1">
                <span className="text-xs text-[rgb(var(--muted))]">Type</span>
                <select className="input" value={bookType} onChange={(e) => setBookType(e.target.value as BookTypeOpt)}>
                  <option value="All">All</option>
                  <option value="Sale">Sale</option>
                  <option value="Loan">Loan</option>
                  <option value="Giveaway">Giveaway</option>
                </select>
              </label>

              <label className="grid gap-1">
                <span className="text-xs text-[rgb(var(--muted))]">Sort</span>
                <select className="input" value={sort} onChange={(e) => setSort(e.target.value as SortOpt)}>
                  <option value="Newest">Newest</option>
                  <option value="A to Z">A to Z</option>
                  <option value="Z to A">Z to A</option>
                  <option value="Price Low to High">Price Low to High</option>
                  <option value="Price High to Low">Price High to Low</option>
                </select>
              </label>
            </div>
          </div>
        </div>
      </motion.section>

      {booksQ.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      ) : booksQ.isError ? (
        <EmptyState
          title="Could not load books"
          description={(booksQ.error as Error)?.message ?? "Something went wrong."}
          action={<button className="btn btn-primary" onClick={() => booksQ.refetch()}>Retry</button>}
        />
      ) : (booksQ.data?.length ?? 0) === 0 ? (
        <EmptyState
          title="No books yet"
          description="Your database looks empty. Seed demo data to see a fully populated UI instantly."
          action={<button className="btn btn-primary" onClick={seedDemo}>Seed demo data</button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(booksQ.data ?? []).map((b) => (
            <BookCard
              key={b.book_id}
              book={b}
              wished={wishedSet.has(b.book_id)}
              onWishedChange={() => qc.invalidateQueries({ queryKey: ["wishlist"] })}
            />
          ))}
        </div>
      )}

      <div className="text-center text-xs text-[rgb(var(--muted))]">
        Tip: login with the seeded accounts (alice / bob / carla) using password <span className="font-mono">password123</span>.
      </div>
    </div>
  );
}
