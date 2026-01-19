"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookPlus, Pencil, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/http";
import { useAuth } from "@/lib/auth/client";
import type { Book } from "@/lib/types";
import { bookUpdateSchema } from "@/lib/validators";
import { EmptyState } from "@/components/EmptyState";
import { Modal } from "@/components/ui/Modal";

type EditValues = {
  title?: string;
  author?: string;
  genre?: string;
  description?: string;
  book_condition?: "new" | "used";
  book_type?: "Sale" | "Loan" | "Giveaway";
  price?: number | string;
  book_img_url?: string;
};

export default function MyBooksPage() {
  const { token, profile } = useAuth();
  const qc = useQueryClient();
  const userId = profile?.user_id;

  const booksQ = useQuery({
    queryKey: ["userbooks", userId],
    enabled: !!userId,
    queryFn: () => apiFetch<Book[]>(`/api/book/userbooks/${userId}`),
  });

  const [editOpen, setEditOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Book | null>(null);

  const editForm = useForm<EditValues>({
    resolver: zodResolver(bookUpdateSchema),
    defaultValues: {},
  });

  React.useEffect(() => {
    if (!editing) return;
    editForm.reset({
      title: editing.title,
      author: editing.author,
      genre: editing.genre ?? "",
      description: editing.description ?? "",
      book_condition: editing.book_condition,
      book_type: editing.is_for_sale ? "Sale" : editing.is_for_loan ? "Loan" : "Giveaway",
      price: editing.price ?? "",
      book_img_url: editing.book_img_url ?? "",
    });
  }, [editing, editForm]);

  const del = useMutation({
    mutationFn: async (book_id: number) => {
      if (!token) throw new Error("Login required");
      await apiFetch(`/api/book/${book_id}`, { method: "DELETE", token });
    },
    onSuccess: async () => {
      toast.success("Deleted");
      await qc.invalidateQueries({ queryKey: ["userbooks", userId] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not delete"),
  });

  const save = useMutation({
    mutationFn: async (payload: { book_id: number; values: EditValues }) => {
      if (!token) throw new Error("Login required");
      await apiFetch(`/api/book/${payload.book_id}`, { method: "PUT", token, body: payload.values });
    },
    onSuccess: async () => {
      toast.success("Updated");
      setEditOpen(false);
      setEditing(null);
      await qc.invalidateQueries({ queryKey: ["userbooks", userId] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not update"),
  });

  const openEdit = (b: Book) => {
    setEditing(b);
    setEditOpen(true);
  };

  const submitEdit = (values: EditValues) => {
    if (!editing) return;
    save.mutate({ book_id: editing.book_id, values });
  };

  const books = (booksQ.data ?? []).slice().sort((a, b) => b.book_id - a.book_id);

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="card p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/40 px-3 py-1 text-xs font-medium dark:bg-white/5">
              <Sparkles className="h-4 w-4" />
              My books
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">Manage listings</h1>
            <p className="mt-1 text-sm text-[rgb(var(--muted))]">Edit details, update cover URL, or remove a listing.</p>
          </div>
          <Link href="/dashboard/add-book" className="btn btn-primary">
            <BookPlus className="h-4 w-4" />
            Add book
          </Link>
        </div>
      </motion.section>

      {booksQ.isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-5">
              <div className="h-5 w-1/2 skeleton" />
              <div className="mt-2 h-4 w-1/3 skeleton" />
            </div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <EmptyState
          title="No listings yet"
          description="Add your first book to start receiving orders."
          action={
            <Link href="/dashboard/add-book" className="btn btn-primary">
              <BookPlus className="h-4 w-4" />
              Add a book
            </Link>
          }
        />
      ) : (
        <div className="grid gap-3">
          {books.map((b) => (
            <div key={b.book_id} className="card p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="truncate text-base font-semibold">{b.title}</div>
                    {b.transaction ? <span className="chip">Transacted</span> : <span className="chip">Active</span>}
                    <span className="chip">{b.is_for_sale ? "Sale" : b.is_for_loan ? "Loan" : "Giveaway"}</span>
                    {b.genre ? <span className="chip">{b.genre}</span> : null}
                  </div>
                  <div className="mt-1 text-sm text-[rgb(var(--muted))]">{b.author ? `by ${b.author}` : "Unknown author"} · ID {b.book_id}</div>
                  {b.description ? <div className="mt-2 line-clamp-2 text-sm text-[rgb(var(--muted))]">{b.description}</div> : null}
                </div>

                <div className="flex shrink-0 gap-2">
                  <button className="btn btn-ghost" onClick={() => openEdit(b)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                  <button className="btn btn-ghost" onClick={() => del.mutate(b.book_id)} disabled={del.isPending}>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={editOpen}
        title={editing ? `Edit: ${editing.title}` : "Edit"}
        description="Update the fields you want to change."
        onClose={() => {
          setEditOpen(false);
          setEditing(null);
        }}
        footer={
          <div className="flex justify-end gap-2">
            <button className="btn btn-ghost" onClick={() => { setEditOpen(false); setEditing(null); }}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={editForm.handleSubmit(submitEdit)} disabled={save.isPending}>
              Save changes
            </button>
          </div>
        }
      >
        <form className="grid gap-4" onSubmit={editForm.handleSubmit(submitEdit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs text-[rgb(var(--muted))]">Title</label>
              <input className="input mt-1" {...editForm.register("title")} />
              {editForm.formState.errors.title ? <div className="mt-1 text-xs text-[rgb(var(--bad))]">{editForm.formState.errors.title.message}</div> : null}
            </div>
            <div>
              <label className="text-xs text-[rgb(var(--muted))]">Author</label>
              <input className="input mt-1" {...editForm.register("author")} />
              {editForm.formState.errors.author ? <div className="mt-1 text-xs text-[rgb(var(--bad))]">{editForm.formState.errors.author.message}</div> : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs text-[rgb(var(--muted))]">Genre</label>
              <input className="input mt-1" {...editForm.register("genre")} />
            </div>
            <div>
              <label className="text-xs text-[rgb(var(--muted))]">Condition</label>
              <select className="input mt-1" {...editForm.register("book_condition")}>
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs text-[rgb(var(--muted))]">Type</label>
              <select className="input mt-1" {...editForm.register("book_type")}>
                <option value="Sale">Sale</option>
                <option value="Loan">Loan</option>
                <option value="Giveaway">Giveaway</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[rgb(var(--muted))]">Price</label>
              <input className="input mt-1" type="number" min={0} step={1} {...editForm.register("price")} />
            </div>
          </div>

          <div>
            <label className="text-xs text-[rgb(var(--muted))]">Cover image URL</label>
            <input className="input mt-1" placeholder="https://..." {...editForm.register("book_img_url")} />
          </div>

          <div>
            <label className="text-xs text-[rgb(var(--muted))]">Description</label>
            <textarea className="input mt-1" rows={4} {...editForm.register("description")} />
          </div>
        </form>
      </Modal>
    </div>
  );
}
