import mongoose, { Schema } from "mongoose";

export type ReviewDoc = {
  review_id: number;
  reviewer_id: number;
  recipient_id: number;
  review: string;
};

const ReviewSchema = new Schema<ReviewDoc>(
  {
    review_id: { type: Number, unique: true, index: true },
    reviewer_id: { type: Number, required: true, index: true },
    recipient_id: { type: Number, required: true, index: true },
    review: { type: String, required: true },
  },
  { timestamps: false, versionKey: false }
);

ReviewSchema.index({ reviewer_id: 1, recipient_id: 1 }, { unique: true });

export const Review = mongoose.models.Review || mongoose.model<ReviewDoc>("Review", ReviewSchema);
