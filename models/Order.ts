import mongoose, { Schema } from "mongoose";

export type OrderDoc = {
  order_id: number;
  book_id: number;
  buyer_id: number;
  seller_id: number;
  is_confirmed: number;
  createdAt: Date;
  updatedAt: Date;
};

const OrderSchema = new Schema<OrderDoc>(
  {
    order_id: { type: Number, unique: true, index: true },
    book_id: { type: Number, required: true, index: true },
    buyer_id: { type: Number, required: true, index: true },
    seller_id: { type: Number, required: true, index: true },
    is_confirmed: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

export const Order = mongoose.models.Order || mongoose.model<OrderDoc>("Order", OrderSchema);
