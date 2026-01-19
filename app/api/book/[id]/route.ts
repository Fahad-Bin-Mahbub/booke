import { connectDB } from "@/lib/db";
import { err, json } from "@/lib/api/response";
import { getAuthUser } from "@/lib/auth/server";
import { Book } from "@/models/Book";
import { parseBody } from "@/lib/api/body";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  author: z.string().min(1).max(120).optional(),
  genre: z.string().min(1).max(60).optional(),
  description: z.string().max(2000).optional(),
  book_condition: z.enum(["new", "used"]).optional(),
  book_type: z.enum(["Sale", "Loan", "Giveaway"]).optional(),
  price: z.union([z.number(), z.string()]).optional(),
  book_img_url: z.string().url().optional(),
});

export async function PUT(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	await connectDB();
	const auth = getAuthUser(req);
	if (!auth.ok) return err(auth.message, auth.status);

	const { id } = await params; // ✅ await params
	const book_id = Number(id);

	if (!Number.isFinite(book_id)) return err("Invalid book ID", 400);

	const body = await parseBody(req, { schema: updateSchema });
	if (!body.ok) return err(body.message, body.status);
	const patch = body.data as z.infer<typeof updateSchema>;

	const book = await Book.findOne({ book_id });
	if (!book) return err("Book not found", 404);
	if (book.user_id !== auth.user.user_id) return err("Unauthorized", 403);

	if (patch.title) book.title = patch.title;
	if (patch.author) book.author = patch.author;
	if (patch.genre) book.genre = patch.genre;
	if (patch.description !== undefined) book.description = patch.description;
	if (patch.book_condition) book.book_condition = patch.book_condition;
	if (patch.book_img_url) book.book_img_url = patch.book_img_url;

	if (patch.book_type) {
		book.is_for_sale = patch.book_type === "Sale";
		book.is_for_loan = patch.book_type === "Loan";
		book.is_for_giveaway = patch.book_type === "Giveaway";
	}

	if (patch.price !== undefined) {
		const num =
			typeof patch.price === "number" ? patch.price : Number(patch.price);
		book.price = Number.isFinite(num) ? num : null;
	}

	await book.save();
	return json(book.toObject());
}

export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	await connectDB();
	const auth = getAuthUser(req);
	if (!auth.ok) return err(auth.message, auth.status);

	const { id } = await params; // ✅ await params
	const book_id = Number(id);

	if (!Number.isFinite(book_id)) return err("Invalid book ID", 400);
	const book = await Book.findOne({ book_id });
	if (!book) return err("Book not found", 404);
	if (book.user_id !== auth.user.user_id) return err("Unauthorized", 403);
	await Book.deleteOne({ book_id });
	return json({ message: "Book deleted successfully" });
}
