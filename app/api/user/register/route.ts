import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { json, err } from "@/lib/api/response";
import { User } from "@/models/User";
import { nextSeq } from "@/lib/sequence";
import { registerSchema } from "@/lib/validators";
import { parseBody } from "@/lib/api/body";

export async function POST(req: Request) {
  await connectDB();

  const body = await parseBody(req, { schema: registerSchema });
  if (!body.ok) return err(body.message, body.status);

  const { username, name, email, phone_number, address, password } = body.data;

  const existing = await User.findOne({ email }).lean();
  if (existing) return err("User already exists", 400);

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user_id = await nextSeq("user_id");
  await User.create({
    user_id,
    username,
    name,
    email,
    phone_number: phone_number ?? null,
    address: address ?? null,
    password: hashedPassword,
    profile_picture: null,
  });

  return json({ message: "User registered successfully" }, { status: 201 });
}
