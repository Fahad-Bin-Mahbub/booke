import { connectDB } from "@/lib/db";
import { err, json } from "@/lib/api/response";
import { Book } from "@/models/Book";
import { attachUserToBooks } from "@/lib/api/join";

export async function GET(
	_req: Request,
	ctx: { params: Promise<{ user_id: string }> }
) {
	await connectDB();
	const { user_id: userIdStr } = await ctx.params; // ✅ await here
	const user_id = Number(userIdStr);

	if (!Number.isFinite(user_id)) return err("Invalid user ID", 400);

	const books = await Book.find({ user_id }).sort({ book_id: -1 }).lean();
	const withUser = await attachUserToBooks(books as any);
	return json(withUser);
}

