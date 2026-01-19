import { connectDB } from "@/lib/db";
import { err, json } from "@/lib/api/response";
import { getAuthUser } from "@/lib/auth/server";
import { User } from "@/models/User";
import { Book } from "@/models/Book";

export async function GET(req: Request) {
  await connectDB();
  const auth = getAuthUser(req);
  if (!auth.ok) return err(auth.message, auth.status);

  const user = await User.findOne({ user_id: auth.user.user_id }, { password: 0 }).lean();
  if (!user) return err("User not found", 404);

  const books = await Book.find({ user_id: user.user_id }).lean();

  return json({ ...user, Book: books });
}