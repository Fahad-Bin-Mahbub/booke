import { connectDB } from "@/lib/db";
import { err, json } from "@/lib/api/response";
import { Book } from "@/models/Book";
import { User } from "@/models/User";

export async function GET(
	_req: Request,
	{ params }: { params: Promise<{ book_id: string }> } // ✅ params is async
) {
	await connectDB();

	const { book_id: bookIdStr } = await params; // ✅ await it
	const book_id = Number(bookIdStr);

	if (!Number.isFinite(book_id)) return err("Invalid book ID", 400);

	const book = await Book.findOne({ book_id }).lean();
	if (!book) return err("Book not found", 404);

	const user = await User.findOne(
		{ user_id: book.user_id },
		{ username: 1 }
	).lean();
	return json({
		...book,
		User: user ? { username: user.username } : undefined,
	});
}
