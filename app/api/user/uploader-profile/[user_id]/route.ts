import { connectDB } from "@/lib/db";
import { err, json } from "@/lib/api/response";
import { getAuthUser } from "@/lib/auth/server";
import { User } from "@/models/User";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ user_id: string }> }
) {
  await connectDB();
  const auth = getAuthUser(req);
  if (!auth.ok) return err(auth.message, auth.status);

  const { user_id: userIdStr } = await params;
  const id = Number(userIdStr);
  if (!Number.isFinite(id)) return err("Invalid user ID", 400);

  const user = await User.findOne({ user_id: id }, { password: 0 }).lean();
  if (!user) return err("User not found", 404);
  return json(user);
}
