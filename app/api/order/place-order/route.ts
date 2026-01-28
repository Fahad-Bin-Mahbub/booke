import { connectDB } from "@/lib/db";
import { err, json } from "@/lib/api/response";
import { getAuthUser } from "@/lib/auth/server";
import { Order } from "@/models/Order";
import { Book } from "@/models/Book";
import { nextSeq } from "@/lib/sequence";
import { parseBody } from "@/lib/api/body";
import { z } from "zod";

const schema = z.object({ book_id: z.union([z.number(), z.string()]) });

export async function POST(req: Request) {
  await connectDB();
  const auth = getAuthUser(req);
  if (!auth.ok) return err(auth.message, auth.status);
  const body = await parseBody(req, { schema });
  if (!body.ok) return err(body.message, body.status);
  const book_id = Number(body.data.book_id);
  if (!Number.isFinite(book_id)) return err("Invalid book", 400);

  const book = await Book.findOne({ book_id });
  if (!book) return err("Invalid book", 400);
  if (book.transaction) return err("The book is already transacted", 400);

  const buyer_id = auth.user.user_id;
  
  // Prevent ordering own book
  if (book.user_id === buyer_id) return err("Cannot order your own book", 400);
  
  const existing = await Order.findOne({ book_id, buyer_id }).lean();
  if (existing) return json({ message: "Order Already Placed", order: null });

  const order_id = await nextSeq("order_id");
  const order = await Order.create({
    order_id,
    book_id,
    buyer_id,
    seller_id: book.user_id,
    is_confirmed: 0,
  });

  return json({ message: "Order placed successfully", order: order.toObject() });
}
