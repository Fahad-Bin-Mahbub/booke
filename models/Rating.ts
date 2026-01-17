import mongoose, { Schema } from "mongoose";

export type RatingDoc = {
  rating_id: number;
  rater_id: number;
  recipient_id: number;
  rating: number;
};

const RatingSchema = new Schema<RatingDoc>(
  {
    rating_id: { type: Number, unique: true, index: true },
    rater_id: { type: Number, required: true, index: true },
    recipient_id: { type: Number, required: true, index: true },
    rating: { type: Number, required: true },
  },
  { timestamps: false, versionKey: false }
);

RatingSchema.index({ rater_id: 1, recipient_id: 1 }, { unique: true });

export const Rating = mongoose.models.Rating || mongoose.model<RatingDoc>("Rating", RatingSchema);
