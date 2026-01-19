import { connectDB } from "@/lib/db";
import { err, json } from "@/lib/api/response";
import { getAuthUser } from "@/lib/auth/server";
import { Wishlist } from "@/models/Wishlist";
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

  const existing = await Wishlist.findOne({ user_id: auth.user.user_id, book_id });
  if (existing) {
    await Wishlist.deleteOne({ user_id: auth.user.user_id, book_id });
    return json({ wished: false });
  }
  await Wishlist.create({ user_id: auth.user.user_id, book_id });
  return json({ wished: true });
}
