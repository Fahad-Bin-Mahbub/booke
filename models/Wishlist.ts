import mongoose, { Schema } from "mongoose";

export type WishlistDoc = {
  user_id: number;
  book_id: number;
  createdAt: Date;
};

const WishlistSchema = new Schema<WishlistDoc>(
  {
    user_id: { type: Number, required: true, index: true },
    book_id: { type: Number, required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

WishlistSchema.index({ user_id: 1, book_id: 1 }, { unique: true });

export const Wishlist = mongoose.models.Wishlist || mongoose.model<WishlistDoc>("Wishlist", WishlistSchema);
