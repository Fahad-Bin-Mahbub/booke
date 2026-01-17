import mongoose, { Schema } from "mongoose";

export type UserDoc = {
  user_id: number;
  username: string;
  name: string;
  email: string;
  phone_number?: string | null;
  address?: string | null;
  password: string;
  profile_picture?: string | null;
};

const UserSchema = new Schema<UserDoc>(
  {
    user_id: { type: Number, unique: true, index: true },
    username: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone_number: { type: String, default: null },
    address: { type: String, default: null },
    password: { type: String, required: true },
    profile_picture: { type: String, default: null },
  },
  { timestamps: false, versionKey: false }
);

export const User = mongoose.models.User || mongoose.model<UserDoc>("User", UserSchema);
