import mongoose, { Schema } from "mongoose";

export type CounterDoc = {
  _id: string;
  seq: number;
};

const CounterSchema = new Schema<CounterDoc>(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
  },
  { versionKey: false }
);

export const Counter = mongoose.models.Counter || mongoose.model<CounterDoc>("Counter", CounterSchema);
