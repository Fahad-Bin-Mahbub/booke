import { connectDB } from "@/lib/db";
import { err, json } from "@/lib/api/response";
import { getAuthUser } from "@/lib/auth/server";
import { Wishlist } from "@/models/Wishlist";
import { Book } from "@/models/Book";

export async function GET(req: Request) {
  await connectDB();
  const auth = getAuthUser(req);
  if (!auth.ok) return err(auth.message, auth.status);

  const items = await Wishlist.find({ user_id: auth.user.user_id }).lean();
  const bookIds = items.map((i) => i.book_id);
  const books = await Book.find({ book_id: { $in: bookIds } }).lean();
  const map = new Map(books.map((b) => [b.book_id, b]));
  const enriched = items.map((i) => ({ ...i, Book: map.get(i.book_id) }));
  return json(enriched);
}
