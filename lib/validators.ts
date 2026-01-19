import { z } from "zod";

function isBrowserFile(value: unknown): boolean {
  // Browser environment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const v: any = value;
  if (typeof File !== "undefined" && v instanceof File) return true;
  if (typeof FileList !== "undefined" && v instanceof FileList) {
    if (v.length === 0) return true;
    return v[0] instanceof File;
  }
  return false;
}

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Username is too short"),
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirm_password: z.string().min(6),
}).refine((d) => d.password === d.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

export const bookSchema = z.object({
  title: z.string().min(2, "Title is required"),
  author: z.string().min(1, "Author is required"),
  genre: z.string().min(1, "Genre is required"),
  description: z.string().optional(),
  book_condition: z.enum(["new", "used"]),
  // Keep compatibility with the old frontend values too.
  book_type: z.union([
    z.literal("Sale"),
    z.literal("Loan"),
    z.literal("Giveaway"),
    z.literal("sell"),
    z.literal("loan"),
    z.literal("giveaway"),
  ]),
  price: z.union([z.coerce.number().nonnegative(), z.undefined()]).optional(),
  book_img_url: z
    .union([
      z.string().min(1),
      z.any().refine((v) => isBrowserFile(v), "Invalid file"),
    ])
    .optional(),
});

// Used for edit flows (all fields optional).
export const bookUpdateSchema = bookSchema.partial();

export const profileSchema = z.object({
  username: z.string().min(3).optional(),
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  password: z.string().min(6, "Current password is required"),
  // In our Next.js migration, confirm_password = *new password* (API kept the same field name)
  confirm_password: z.string().min(6).optional(),
  profile_picture: z
    .union([
      z.string().min(1),
      z.any().refine((v) => isBrowserFile(v), "Invalid file"),
    ])
    .optional(),
});

export const ratingSchema = z.object({
  rating: z.coerce.number().min(0).max(10),
  recipient_id: z.coerce.number().int().positive(),
});

export const reviewSchema = z.object({
  review: z.string().min(2, "Write a short review"),
  recipient_id: z.coerce.number().int().positive(),
});
