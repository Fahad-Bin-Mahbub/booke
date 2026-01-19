import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { err, json } from "@/lib/api/response";
import { getAuthUser } from "@/lib/auth/server";
import { User } from "@/models/User";
import { parseBody } from "@/lib/api/body";
import { profileSchema } from "@/lib/validators";
import { saveUploadedFile } from "@/lib/upload";

export async function PUT(req: Request) {
  await connectDB();
  const auth = getAuthUser(req);
  if (!auth.ok) return err(auth.message, auth.status);

  const body = await parseBody(req, { schema: profileSchema, fileKeys: ["profile_picture"] });
  if (!body.ok) return err(body.message, body.status);

  const user = await User.findOne({ user_id: auth.user.user_id });
  if (!user) return err("User not found", 404);

  const {
    name,
    username,
    email,
    phone_number,
    address,
    password,
    confirm_password,
    profile_picture,
  } = body.data as any;

  // Require current password to edit profile.
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return err("Invalid credentials", 400);

  // Optional password change (keeps original API field names)
  if (confirm_password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(confirm_password, salt);
  }

  if (typeof name === "string" && name.trim()) user.name = name.trim();
  if (typeof username === "string" && username.trim()) user.username = username.trim();
  if (typeof email === "string" && email.trim()) user.email = email.trim();
  if (typeof phone_number === "string" && phone_number.trim()) user.phone_number = phone_number.trim();
  if (typeof address === "string" && address.trim()) user.address = address.trim();

  if (profile_picture instanceof File && profile_picture.size > 0) {
    const saved = await saveUploadedFile(profile_picture, "profile_picture");
    user.profile_picture = saved.url;
  }

  await user.save();
  return json({ message: "Profile updated successfully" });
}
