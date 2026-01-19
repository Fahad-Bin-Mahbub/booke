import { connectDB } from "@/lib/db";
import { json } from "@/lib/api/response";
import { Book } from "@/models/Book";

export async function GET(req: Request) {
  await connectDB();
  const url = new URL(req.url);
  const genre = url.searchParams.get("genre") || undefined;
  const book_type = url.searchParams.get("book_type") || undefined;
  const sort = url.searchParams.get("sort") || undefined;
  const q: Record<string, unknown> = { transaction: false };
  if (genre && genre !== "All") q.genre = genre;

  if (book_type) {
    if (book_type === "Giveaway") q.is_for_giveaway = true;
    else if (book_type === "Loan") q.is_for_loan = true;
    else if (book_type === "Sale") q.is_for_sale = true;
  }

  let order: Record<string, 1 | -1> = { book_id: -1 };
  if (sort === "A to Z") order = { title: 1 };
  else if (sort === "Z to A") order = { title: -1 };
  else if (sort === "Price High to Low") order = { price: -1 };
  else if (sort === "Price Low to High") order = { price: 1 };

  const books = await Book.find(q).sort(order).lean();
  return json(books);
}
