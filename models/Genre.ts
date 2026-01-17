import mongoose, { Schema } from "mongoose";

export type GenreDoc = {
  genre_id: number;
  name: string;
};

const GenreSchema = new Schema<GenreDoc>(
  {
    genre_id: { type: Number, unique: true, index: true },
    name: { type: String, required: true, unique: true },
  },
  { timestamps: false, versionKey: false }
);

export const Genre = mongoose.models.Genre || mongoose.model<GenreDoc>("Genre", GenreSchema);
