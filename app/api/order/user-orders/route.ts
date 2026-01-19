import { connectDB } from "@/lib/db";
import { err, json } from "@/lib/api/response";
import { getAuthUser } from "@/lib/auth/server";
import { Order } from "@/models/Order";
import { attachBookToOrders } from "@/lib/api/join";

export async function GET(req: Request) {
  await connectDB();
  const auth = getAuthUser(req);
  if (!auth.ok) return err(auth.message, auth.status);
  const orders = await Order.find({ buyer_id: auth.user.user_id }).sort({ order_id: -1 }).lean();
  const enriched = await attachBookToOrders(orders as any);
  return json(enriched);
}
