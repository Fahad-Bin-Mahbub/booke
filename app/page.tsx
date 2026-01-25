"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Sparkles, X, Database } from "lucide-react";
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

  const activeFilters = React.useMemo(() => {
    const items: { key: string; label: string; onRemove: () => void }[] = [];
    if (genre !== "All") items.push({ key: "genre", label: `Genre: ${genre}`, onRemove: () => setGenre("All") });
    if (bookType !== "All") items.push({ key: "type", label: `Type: ${bookType}`, onRemove: () => setBookType("All") });
    if (sort !== "Newest") items.push({ key: "sort", label: `Sort: ${sort}`, onRemove: () => setSort("Newest") });
    if (searchQuery.trim()) items.push({ key: "search", label: `Search: ${searchQuery.trim()}`, onRemove: () => setSearchQuery("") });
    return items;
  }, [genre, bookType, sort, searchQuery]);

  const titleAccent = (
    <span className="bg-gradient-to-r from-[rgb(var(--brand))] via-[rgb(var(--brand2))] to-[rgb(var(--mint))] bg-clip-text text-transparent">
      BookE
    </span>
  );

  const resultsCount = booksQ.data?.length ?? 0;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 pb-12 pt-7 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="card-elevated p-6 sm:p-8"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="chip chip-brand">
              <Sparkles className="h-4 w-4" />
              A vibrant, modern book marketplace
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Discover your next read on {titleAccent}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[rgb(var(--muted))] sm:text-base">
              Clean filters, polished cards, and a light-first UI that feels like a modern bookstore.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="surface p-4">
              <div className="text-xs font-semibold text-[rgb(var(--muted))]">Listings</div>
              <div className="mt-1 text-2xl font-semibold">{booksQ.data?.length ?? "—"}</div>
            </div>
            <div className="surface p-4">
              <div className="text-xs font-semibold text-[rgb(var(--muted))]">Wishlist</div>
              <div className="mt-1 text-2xl font-semibold">{token ? (wishQ.data?.length ?? "—") : "—"}</div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Shell */}
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Filters */}
        <aside className="space-y-4">
          <div className="card sticky top-24 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <SlidersHorizontal className="h-4 w-4" style={{ color: "rgb(var(--brand))" }} />
                Filters
              </div>
              <button type="button" onClick={onClear} className="btn btn-ghost !px-3" disabled={activeFilters.length === 0}>
                Reset
              </button>
            </div>

            {/* Search */}
            <div className="mt-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
                <input
                  className="input pl-10 pr-10"
                  placeholder="Search title…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery.trim() ? (
                  <button
                    type="button"
                    className="btn-icon absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>

            {/* Selects */}
            <div className="mt-4 grid gap-3">
              <label className="grid gap-1">
                <span className="text-xs font-semibold text-[rgb(var(--muted))]">Genre</span>
                <select className="input" value={genre} onChange={(e) => setGenre(e.target.value)} disabled={genresLoading}>
                  <option value="All">All</option>
                  {(genres ?? []).map((g) => (
                    <option key={g.genre_id} value={g.name}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1">
                <span className="text-xs font-semibold text-[rgb(var(--muted))]">Type</span>
                <select className="input" value={bookType} onChange={(e) => setBookType(e.target.value as BookTypeOpt)}>
                  <option value="All">All</option>
                  <option value="Sale">Sale</option>
                  <option value="Loan">Loan</option>
                  <option value="Giveaway">Giveaway</option>
                </select>
              </label>

              <label className="grid gap-1">
                <span className="text-xs font-semibold text-[rgb(var(--muted))]">Sort</span>
                <select className="input" value={sort} onChange={(e) => setSort(e.target.value as SortOpt)}>
                  <option value="Newest">Newest</option>
                  <option value="A to Z">A to Z</option>
                  <option value="Z to A">Z to A</option>
                  <option value="Price Low to High">Price Low to High</option>
                  <option value="Price High to Low">Price High to Low</option>
                </select>
              </label>
            </div>

            {/* Active filters */}
            {activeFilters.length > 0 ? (
              <div className="mt-4">
                <div className="text-xs font-semibold text-[rgb(var(--muted))]">Active</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {activeFilters.map((f) => (
                    <button key={f.key} type="button" onClick={f.onRemove} className="badge" title="Remove">
                      {f.label}
                      <X className="h-3.5 w-3.5 opacity-70" />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Demo tip</div>
                <p className="mt-1 text-sm text-[rgb(var(--muted))]">
                  Use <span className="kbd">password123</span> for <span className="font-mono">alice</span>, <span className="font-mono">bob</span>, or <span className="font-mono">carla</span>.
                </p>
              </div>
              <button type="button" onClick={seedDemo} className="btn btn-outline !px-3" title="Seed demo data">
                <Database className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Results */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Listings</div>
              <div className="text-xs text-[rgb(var(--muted))]">Browse, wishlist, and order in one place.</div>
            </div>
            <span className="badge badge-brand">{booksQ.isLoading ? "Loading…" : `${resultsCount} results`}</span>
          </div>

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
              action={
                <button type="button" className="btn btn-primary" onClick={() => booksQ.refetch()}>
                  Retry
                </button>
              }
            />
          ) : (booksQ.data?.length ?? 0) === 0 ? (
            <EmptyState
              title="No books yet"
              description="Your database looks empty. Seed demo data to see a fully populated UI instantly."
              action={
                <button type="button" className="btn btn-primary" onClick={seedDemo}>
                  Seed demo data
                </button>
              }
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
        </section>
      </div>
    </div>
  );
}
