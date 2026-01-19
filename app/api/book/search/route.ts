import { connectDB } from "@/lib/db";
import { json } from "@/lib/api/response";
import { Book } from "@/models/Book";

export async function GET(req: Request) {
  await connectDB();
  const url = new URL(req.url);
  const q = (url.searchParams.get("searchQuery") || "").trim();
  if (!q) return json([]);
  const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const books = await Book.find({ transaction: false, title: { $regex: regex } }).sort({ book_id: -1 }).lean();
  return json(books);
}
