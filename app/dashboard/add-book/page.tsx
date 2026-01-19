"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ImagePlus, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/http";
import { useAuth } from "@/lib/auth/client";
import type { Genre } from "@/lib/types";
import { bookSchema } from "@/lib/validators";

type FormValues = {
  title: string;
  author: string;
  genre: string;
  description?: string;
  book_condition: "new" | "used";
  book_type: "Sale" | "Loan" | "Giveaway";
  price?: number | string;
  book_img_url?: FileList;
};

export default function AddBookPage() {
  const router = useRouter();
  const { token } = useAuth();

  const { data: genres } = useQuery({
    queryKey: ["genres"],
    queryFn: () => apiFetch<Genre[]>("/api/genre/all"),
  });
  console.log(genres)

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "",
      author: "",
      genre: "",
      description: "",
      book_condition: "used",
      book_type: "Sale",
      price: 350,
    },
  });

  const file = watch("book_img_url")?.[0];
  const preview = React.useMemo(() => {
    if (!file) return null;
    const url = URL.createObjectURL(file);
    return url;
  }, [file]);

  React.useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (!token) throw new Error("Login required");

      const fd = new FormData();
      fd.set("title", values.title);
      fd.set("author", values.author);
      fd.set("genre", values.genre);
      fd.set("description", values.description ?? "");
      fd.set("book_condition", values.book_condition);
      fd.set("book_type", values.book_type);
      if (values.price !== undefined && values.price !== null && String(values.price).trim() !== "") {
        fd.set("price", String(values.price));
      }
      if (values.book_img_url && values.book_img_url[0]) {
        fd.set("book_img_url", values.book_img_url[0]);
      }

      await apiFetch("/api/book/add", {
        method: "POST",
        token,
        formData: fd,
      });

      toast.success("Book added!");
      router.push("/dashboard/my-books");
    } catch (e: any) {
      toast.error(e?.message ?? "Could not add book");
    }
  };

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
          New listing
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Add a book</h1>
        <p className="mt-1 text-sm text-[rgb(var(--muted))]">Create a polished listing with cover image, condition and type.</p>
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="card p-6">
          <div className="text-sm font-semibold">Cover preview</div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/40 dark:bg-white/5">
            <div className="aspect-[16/12]">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center">
                  <div className="grid gap-2 text-center">
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/50 dark:bg-white/5">
                      <ImagePlus className="h-5 w-5" />
                    </div>
                    <div className="text-sm font-medium">Upload a cover</div>
                    <div className="text-xs text-[rgb(var(--muted))]">PNG/JPG — looks great on listings.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card p-6">
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs text-[rgb(var(--muted))]">Title</label>
                <input className="input mt-1" placeholder="Atomic Habits" {...register("title")} />
                {errors.title ? <div className="mt-1 text-xs text-[rgb(var(--bad))]">{errors.title.message}</div> : null}
              </div>
              <div>
                <label className="text-xs text-[rgb(var(--muted))]">Author</label>
                <input className="input mt-1" placeholder="James Clear" {...register("author")} />
                {errors.author ? <div className="mt-1 text-xs text-[rgb(var(--bad))]">{errors.author.message}</div> : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs text-[rgb(var(--muted))]">Genre</label>
                <select className="input mt-1" {...register("genre")}> 
                  <option value="">Select genre</option>
                  {(genres ?? []).map((g) => (
                    <option key={g.genre_id} value={g.name}>
                      {g.name}
                    </option>
                  ))}
                </select>
                {errors.genre ? <div className="mt-1 text-xs text-[rgb(var(--bad))]">{errors.genre.message}</div> : null}
              </div>
              <div>
                <label className="text-xs text-[rgb(var(--muted))]">Condition</label>
                <select className="input mt-1" {...register("book_condition")}>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>
                {errors.book_condition ? <div className="mt-1 text-xs text-[rgb(var(--bad))]">{errors.book_condition.message}</div> : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs text-[rgb(var(--muted))]">Type</label>
                <select className="input mt-1" {...register("book_type")}>
                  <option value="Sale">Sale</option>
                  <option value="Loan">Loan</option>
                  <option value="Giveaway">Giveaway</option>
                </select>
                {errors.book_type ? <div className="mt-1 text-xs text-[rgb(var(--bad))]">{errors.book_type.message}</div> : null}
              </div>
              <div>
                <label className="text-xs text-[rgb(var(--muted))]">Price (BDT)</label>
                <input className="input mt-1" type="number" min={0} step={1} {...register("price")} />
                {errors.price ? <div className="mt-1 text-xs text-[rgb(var(--bad))]">{errors.price.message as any}</div> : null}
              </div>
            </div>

            <div>
              <label className="text-xs text-[rgb(var(--muted))]">Description</label>
              <textarea className="input mt-1" rows={4} placeholder="Condition notes, pickup instructions, etc." {...register("description")} />
              {errors.description ? <div className="mt-1 text-xs text-[rgb(var(--bad))]">{errors.description.message}</div> : null}
            </div>

            <div>
              <label className="text-xs text-[rgb(var(--muted))]">Cover image</label>
              <input className="input mt-1" type="file" accept="image/*" {...register("book_img_url")} />
              {errors.book_img_url ? <div className="mt-1 text-xs text-[rgb(var(--bad))]">{String(errors.book_img_url.message ?? "Invalid file")}</div> : null}
            </div>

            <button disabled={isSubmitting} className="btn btn-primary justify-center">
              <Upload className="h-4 w-4" />
              {isSubmitting ? "Publishing…" : "Publish listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
