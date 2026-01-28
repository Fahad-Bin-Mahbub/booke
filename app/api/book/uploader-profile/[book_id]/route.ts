import { connectDB } from "@/lib/db";
import { err, json } from "@/lib/api/response";
import { getAuthUser } from "@/lib/auth/server";
import { Book } from "@/models/Book";
import { User } from "@/models/User";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ book_id: string }> }
) {
  await connectDB();
  const auth = getAuthUser(req);
  if (!auth.ok) return err(auth.message, auth.status);
  
  const { book_id: bookIdStr } = await params;
  const book_id = Number(bookIdStr);
  if (!Number.isFinite(book_id)) return err("Invalid book ID", 400);
  const book = await Book.findOne({ book_id }).lean();
  if (!book) return err("Book not found", 404);
  const user = await User.findOne({ user_id: book.user_id }, { password: 0 }).lean();
  if (!user) return err("User not found", 404);
  return json(user);
}
