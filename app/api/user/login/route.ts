import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { err, json } from "@/lib/api/response";
import { User } from "@/models/User";
import { issueToken } from "@/lib/auth/server";
import { loginSchema } from "@/lib/validators";
import { parseBody } from "@/lib/api/body";

export async function POST(req: Request) {
  await connectDB();

  const body = await parseBody(req, { schema: loginSchema });
  if (!body.ok) return err(body.message, body.status);

  const { email, password } = body.data;

  const user = await User.findOne({ email }).lean();
  if (!user) return err("Invalid credentials", 400);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return err("Invalid credentials", 400);

  const token = issueToken(user.user_id);
  return json({ token });
}
