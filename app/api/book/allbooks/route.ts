import { connectDB } from "@/lib/db";
import { json } from "@/lib/api/response";
import { Book } from "@/models/Book";
import { attachUserToBooks } from "@/lib/api/join";

export async function GET(req: Request) {
  await connectDB();
  const url = new URL(req.url);
  const page = Number(url.searchParams.get("page") || 1);
  const limit = Number(url.searchParams.get("limit") || 40);
  const skip = Math.max(0, (page - 1) * limit);

  const books = await Book.find({ transaction: false })
    .sort({ book_id: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const withUser = await attachUserToBooks(books as any);
  return json({ books: withUser });
}
