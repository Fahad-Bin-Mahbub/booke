import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth/server";
import { err, json } from "@/lib/api/response";
import { Wishlist } from "@/models/Wishlist";
import { Book } from "@/models/Book";

export async function GET(req: Request) {
  try {
    await connectDB();
    const auth = getAuthUser(req);
    if (!auth.ok) return err(auth.message, auth.status);

    const user_id = auth.user.user_id;
    const items = await Wishlist.find({ user_id }).sort({ createdAt: -1 }).lean();
    const bookIds = [...new Set(items.map((i) => i.book_id))];
    const books = await Book.find({ book_id: { $in: bookIds } }).lean();
    const byId = new Map(books.map((b) => [b.book_id, b]));

    const out = items.map((i) => ({ ...i, Book: byId.get(i.book_id) }));
    return json(out);
  } catch (e) {
    console.error(e);
    return err("Server error", 500);
  }
}
