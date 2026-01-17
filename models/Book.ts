import mongoose, { Schema } from "mongoose";

export type BookDoc = {
  book_id: number;
  title: string;
  author?: string | null;
  description?: string | null;
  book_condition: "new" | "used";
  price?: number | null;
  user_id: number;
  is_for_sale: boolean;
  is_for_loan: boolean;
  is_for_giveaway: boolean;
  genre?: string | null;
  book_img_url?: string | null;
  transaction: boolean;
};

const BookSchema = new Schema<BookDoc>(
  {
    book_id: { type: Number, unique: true, index: true },
    title: { type: String, required: true },
    author: { type: String, default: null },
    description: { type: String, default: null },
    book_condition: { type: String, enum: ["new", "used"], required: true },
    price: { type: Number, default: null },
    user_id: { type: Number, required: true, index: true },
    is_for_sale: { type: Boolean, default: false },
    is_for_loan: { type: Boolean, default: false },
    is_for_giveaway: { type: Boolean, default: false },
    genre: { type: String, default: null },
    book_img_url: { type: String, default: null },
    transaction: { type: Boolean, default: false },
  },
  { timestamps: false, versionKey: false }
);

export const Book = mongoose.models.Book || mongoose.model<BookDoc>("Book", BookSchema);
