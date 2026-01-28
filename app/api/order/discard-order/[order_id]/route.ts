import { connectDB } from "@/lib/db";
import { err, json } from "@/lib/api/response";
import { getAuthUser } from "@/lib/auth/server";
import { Order } from "@/models/Order";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ order_id: string }> }
) {
  await connectDB();
  const auth = getAuthUser(req);
  if (!auth.ok) return err(auth.message, auth.status);
  
  const { order_id: orderIdStr } = await params;
  const order_id = Number(orderIdStr);
  if (!Number.isFinite(order_id)) return err("Invalid order ID", 400);
  const order = await Order.findOne({ order_id });
  if (!order) return err("Invalid order ID", 400);
  if (order.seller_id !== auth.user.user_id) return err("Unauthorized", 403);
  if (order.is_confirmed !== 0) return err("Order is already confirmed or Discarded", 400);
  order.is_confirmed = 2;
  await order.save();
  return json({ message: "Order discarded successfully" });
}
