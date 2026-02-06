"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
  Database,
  BookOpen,
  Heart,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/http";
import { useAuth } from "@/lib/auth/client";
import type { Book, Genre, WishlistItem } from "@/lib/types";
import { BookCard } from "@/components/BookCard";
import { BookCardSkeleton } from "@/components/BookCardSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

type SortOpt = "Newest" | "A to Z" | "Z to A" | "Price Low to High" | "Price High to Low";
type BookTypeOpt = "All" | "Sale" | "Loan" | "Giveaway";

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
  gradient,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  gradient: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${gradient}`}>
          {icon}
        </div>
        <div>
          <div className="text-xs font-medium text-[rgb(var(--muted))]">{label}</div>
          <div className="text-xl font-bold tracking-tight">{value}</div>
        </div>
      </div>
    </div>
  );
}

// Filter Pill Component
function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      onClick={onRemove}
      className="group inline-flex items-center gap-1.5 rounded-full border border-[rgba(var(--brand)/0.3)] bg-[rgba(var(--brand)/0.08)] px-2.5 py-1 text-xs font-medium text-[rgb(var(--brand))] transition-colors hover:bg-[rgba(var(--brand)/0.15)]"
    >
      {label}
      <X className="h-3 w-3 opacity-60 group-hover:opacity-100" />
    </button>
  );
}

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
    if (genre !== "All") items.push({ key: "genre", label: genre, onRemove: () => setGenre("All") });
    if (bookType !== "All") items.push({ key: "type", label: bookType, onRemove: () => setBookType("All") });
    if (sort !== "Newest") items.push({ key: "sort", label: sort, onRemove: () => setSort("Newest") });
    if (searchQuery.trim()) items.push({ key: "search", label: `"${searchQuery.trim()}"`, onRemove: () => setSearchQuery("") });
    return items;
  }, [genre, bookType, sort, searchQuery]);

  const resultsCount = booksQ.data?.length ?? 0;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-3xl border border-[rgb(var(--border))] bg-gradient-to-br from-white via-[rgba(var(--brand)/0.03)] to-[rgba(var(--mint)/0.05)] p-8 shadow-lg dark:from-slate-900 dark:via-slate-900 dark:to-slate-800"
      >
        {/* Background decoration */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-[rgba(var(--brand)/0.15)] to-[rgba(var(--brand2)/0.1)] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gradient-to-br from-[rgba(var(--mint)/0.12)] to-transparent blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Discover your next read on{" "}
              <span className="bg-gradient-to-r from-[rgb(var(--brand))] via-[rgb(var(--brand2))] to-[rgb(var(--mint))] bg-clip-text text-transparent">
                BookE
              </span>
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--muted))] sm:text-base">
              Buy, loan, or get books for free from fellow readers. Build trust through ratings and reviews.
            </p>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard
              icon={<BookOpen className="h-5 w-5 text-white" />}
              label="Listings"
              value={booksQ.isLoading ? "—" : booksQ.data?.length ?? 0}
              gradient="bg-gradient-to-br from-[rgb(var(--brand))] to-[rgb(var(--brand2))]"
            />
            <StatCard
              icon={<Heart className="h-5 w-5 text-white" />}
              label="Wishlist"
              value={token ? (wishQ.isLoading ? "—" : wishQ.data?.length ?? 0) : "—"}
              gradient="bg-gradient-to-br from-[rgb(var(--brand2))] to-[rgb(var(--bad))]"
            />
            <StatCard
              icon={<TrendingUp className="h-5 w-5 text-white" />}
              label="Active"
              value="Live"
              gradient="bg-gradient-to-br from-[rgb(var(--mint))] to-[rgb(var(--good))]"
            />
          </div>
        </div>
      </motion.section>

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        {/* Filters Sidebar */}
        <aside className="space-y-4">
          <Card className="sticky top-24">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <SlidersHorizontal className="h-4 w-4 text-[rgb(var(--brand))]" />
                Filters
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                disabled={activeFilters.length === 0}
              >
                Reset
              </Button>
            </div>

            {/* Search */}
            <div className="mt-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--muted))]" />
                <input
                  className="input !pl-10 !pr-10"
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery.trim() && (
                  <button
                    type="button"
                    className="btn-icon absolute right-1 top-1/2 !h-6 !w-6 -translate-y-1/2"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Selects */}
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[rgb(var(--muted))]">
                  Genre
                </label>
                <select
                  className="input"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  disabled={genresLoading}
                >
                  <option value="All">All Genres</option>
                  {(genres ?? []).map((g) => (
                    <option key={g.genre_id} value={g.name}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[rgb(var(--muted))]">
                  Type
                </label>
                <select
                  className="input"
                  value={bookType}
                  onChange={(e) => setBookType(e.target.value as BookTypeOpt)}
                >
                  <option value="All">All Types</option>
                  <option value="Sale">For Sale</option>
                  <option value="Loan">For Loan</option>
                  <option value="Giveaway">Giveaway</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[rgb(var(--muted))]">
                  Sort By
                </label>
                <select
                  className="input"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOpt)}
                >
                  <option value="Newest">Newest First</option>
                  <option value="A to Z">Title A-Z</option>
                  <option value="Z to A">Title Z-A</option>
                  <option value="Price Low to High">Price: Low to High</option>
                  <option value="Price High to Low">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className="mt-4 border-t border-[rgb(var(--border))] pt-4">
                <div className="mb-2 text-xs font-medium text-[rgb(var(--muted))]">
                  Active Filters
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeFilters.map((f) => (
                    <FilterPill key={f.key} label={f.label} onRemove={f.onRemove} />
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Demo Seed Card */}
          <Card className="bg-gradient-to-br from-[rgba(var(--mint)/0.05)] to-[rgba(var(--brand)/0.03)]">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[rgb(var(--mint))] to-[rgb(var(--brand))]">
                <Database className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">Demo Mode</div>
                <p className="mt-0.5 text-xs text-[rgb(var(--muted))]">
                  Seed sample data to explore. Use <code className="kbd">password123</code> for demo logins.
                </p>
                <Button variant="outline" size="sm" onClick={seedDemo} className="mt-3">
                  Seed Data
                </Button>
              </div>
            </div>
          </Card>
        </aside>

        {/* Results Grid */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Book Listings</h2>
              <p className="text-sm text-[rgb(var(--muted))]">
                Browse, wishlist, and order in one place
              </p>
            </div>
            <Badge variant="brand">
              {booksQ.isLoading ? "Loading..." : `${resultsCount} results`}
            </Badge>
          </div>

          {booksQ.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <BookCardSkeleton key={i} />
              ))}
            </div>
          ) : booksQ.isError ? (
            <EmptyState
              title="Could not load books"
              description={(booksQ.error as Error)?.message ?? "Something went wrong."}
              action={
                <Button onClick={() => booksQ.refetch()}>
                  Retry
                </Button>
              }
            />
          ) : (booksQ.data?.length ?? 0) === 0 ? (
            <EmptyState
              title="No books yet"
              description="Your database looks empty. Seed demo data to see a fully populated UI instantly."
              action={
                <Button onClick={seedDemo}>
                  Seed demo data
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
