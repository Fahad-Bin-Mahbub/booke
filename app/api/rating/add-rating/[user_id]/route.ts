import { connectDB } from "@/lib/db";
import { err, json } from "@/lib/api/response";
import { getAuthUser } from "@/lib/auth/server";
import { Rating } from "@/models/Rating";
import { Order } from "@/models/Order";
import { nextSeq } from "@/lib/sequence";
import { parseBody } from "@/lib/api/body";
import { z } from "zod";

const schema = z.object({
  rating: z.union([z.number(), z.string()]),
  recipient_id: z.union([z.number(), z.string()]),
});

export async function POST(req: Request) {
  await connectDB();
  const auth = getAuthUser(req);
  if (!auth.ok) return err(auth.message, auth.status);
  const body = await parseBody(req, { schema });
  if (!body.ok) return err(body.message, body.status);
  const rater_id = auth.user.user_id;
  const recipient_id = Number(body.data.recipient_id);
  const rating = Number(body.data.rating);
  if (!Number.isFinite(recipient_id) || !Number.isFinite(rating)) return err("Invalid input", 400);
  if (recipient_id === rater_id) return err("Cannot rate yourself", 400);
  if (rating < 0 || rating > 10) return err("The rating is out of bounds", 400);

  // Must have had a direct transaction link (buyer/seller in any direction)
  const linked = await Order.findOne({
    $or: [
      { buyer_id: rater_id, seller_id: recipient_id },
      { buyer_id: recipient_id, seller_id: rater_id },
    ],
  }).lean();
  if (!linked) return err("No direct connection for rating", 400);

  const existing = await Rating.findOne({ rater_id, recipient_id });
  if (existing) {
    existing.rating = rating;
    await existing.save();
    return json({ message: "Rating updated successfully", rating: existing.toObject() });
  }

  const rating_id = await nextSeq("rating_id");
  const created = await Rating.create({ rating_id, rater_id, recipient_id, rating });
  return json({ message: "Rating added successfully", rating: created.toObject() }, { status: 201 });
}
