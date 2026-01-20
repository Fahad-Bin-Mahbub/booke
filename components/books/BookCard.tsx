"use client";

import Link from "next/link";
import { Heart, ShoppingBag, HandHeart, ArrowRightLeft } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/http";
import type { BookListItem } from "@/lib/types";
import { useAuth } from "@/lib/auth/client";

function BookTypeBadges(book: BookListItem) {
  if (book.is_for_sale) return <Badge className="chip-brand">For Sale</Badge>;
  if (book.is_for_loan) return <Badge className="chip-mint">For Loan</Badge>;
  return <Badge className="chip-pink">Giveaway</Badge>;
}

export function BookCard({ book }: { book: BookListItem }) {
  const qc = useQueryClient();
  const { token } = useAuth();

  const toggle = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("Login required");
      await apiFetch("/api/wishlist/toggle", {
        method: "POST",
        token,
        body: { book_id: book.book_id },
      });
    },
    onSuccess: () => {
      toast.success("Saved to wishlist");
      qc.invalidateQueries({ queryKey: ["wishlist"] });
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : "Could not save";
      toast.error(msg);
    },
  });

  const typeIcon = book.is_for_sale ? <ShoppingBag className="h-4 w-4" /> : book.is_for_loan ? <ArrowRightLeft className="h-4 w-4" /> : <HandHeart className="h-4 w-4" />;

  return (
    <div className="card card-hover overflow-hidden">
      <div className="relative aspect-[16/11] w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={book.title}
          src={book.book_img_url || "/book-placeholder.png"}
          className="h-full w-full object-cover opacity-95"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge className="chip-mint">{book.genre || "General"}</Badge>
          {BookTypeBadges(book)}
        </div>
        <button
          onClick={() => toggle.mutate()}
          className="btn-icon absolute right-3 top-3"
          title="Wishlist"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-base font-semibold">{book.title}</div>
            <div className="truncate text-sm text-[rgb(var(--muted))]">by {book.author || "Unknown"}</div>
          </div>
          <div className="chip chip-brand">{typeIcon} <span className="text-xs">{book.price ? `$${Number(book.price).toFixed(2)}` : "Free"}</span></div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-[rgb(var(--muted))]">Uploader: {book.User?.username ?? "—"}</div>
          <Link href={`/book/${book.book_id}`} className="btn btn-ghost !px-3 !py-2">Details</Link>
        </div>
      </div>
    </div>
  );
}
