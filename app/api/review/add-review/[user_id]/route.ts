import { connectDB } from "@/lib/db";
import { err, json } from "@/lib/api/response";
import { getAuthUser } from "@/lib/auth/server";
import { Review } from "@/models/Review";
import { Order } from "@/models/Order";
import { nextSeq } from "@/lib/sequence";
import { parseBody } from "@/lib/api/body";
import { z } from "zod";

const schema = z.object({
  review: z.string().min(1).max(800),
  recipient_id: z.union([z.number(), z.string()]),
});

export async function POST(req: Request) {
  await connectDB();
  const auth = getAuthUser(req);
  if (!auth.ok) return err(auth.message, auth.status);
  const body = await parseBody(req, { schema });
  if (!body.ok) return err(body.message, body.status);

  const reviewer_id = auth.user.user_id;
  const recipient_id = Number(body.data.recipient_id);
  if (!Number.isFinite(recipient_id)) return err("Invalid recipient", 400);
  if (recipient_id === reviewer_id) return err("Cannot review", 400);

  const linked = await Order.findOne({
    $or: [
      { buyer_id: reviewer_id, seller_id: recipient_id },
      { buyer_id: recipient_id, seller_id: reviewer_id },
    ],
  }).lean();
  if (!linked) return err("No direct connection for rating", 400);

  const existing = await Review.findOne({ reviewer_id, recipient_id });
  if (existing) {
    existing.review = body.data.review;
    await existing.save();
    return json({ message: "Rating updated successfully", review: existing.toObject() });
  }

  const review_id = await nextSeq("review_id");
  const created = await Review.create({ review_id, reviewer_id, recipient_id, review: body.data.review });
  return json({ message: "Review added successfully", review: created.toObject() }, { status: 201 });
}
