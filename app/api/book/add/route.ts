import { connectDB } from "@/lib/db";
import { err, json } from "@/lib/api/response";
import { getAuthUser } from "@/lib/auth/server";
import { Book } from "@/models/Book";
import { nextSeq } from "@/lib/sequence";
import { parseBody } from "@/lib/api/body";
import { bookSchema } from "@/lib/validators";
import { saveUploadedFile } from "@/lib/upload";

export async function POST(req: Request) {
  await connectDB();
  const auth = getAuthUser(req);
  if (!auth.ok) return err(auth.message, auth.status);

  const body = await parseBody(req, { schema: bookSchema, fileKeys: ["book_img_url"] });
  if (!body.ok) return err(body.message, body.status);

  const {
    title,
    author,
    genre,
    description,
    book_condition,
    book_type,
    price,
    book_img_url,
  } = body.data as any;

  let is_for_sale = false;
  let is_for_loan = false;
  let is_for_giveaway = false;
  const normalizedType = String(book_type);
  if (normalizedType === "Sale" || normalizedType === "sell") is_for_sale = true;
  else if (normalizedType === "Loan" || normalizedType === "loan") is_for_loan = true;
  else is_for_giveaway = true;

  let finalPrice: number | null = null;
  if (price !== undefined && price !== null && String(price).trim() !== "") {
    const num = Number(price);
    finalPrice = Number.isFinite(num) ? num : null;
  }

  let imgUrl: string | null = null;
  if (typeof book_img_url === "string" && book_img_url.trim()) imgUrl = book_img_url.trim();
  if (book_img_url instanceof File && book_img_url.size > 0) {
    const saved = await saveUploadedFile(book_img_url, "book_img_url");
    imgUrl = saved.url;
  }

  const book_id = await nextSeq("book_id");
  await Book.create({
    book_id,
    title: title.trim(),
    author: author.trim(),
    genre,
    description,
    book_condition,
    price: finalPrice,
    user_id: auth.user.user_id,
    is_for_sale,
    is_for_loan,
    is_for_giveaway,
    book_img_url: imgUrl,
    transaction: false,
  });

  return json({ message: "Book added successfully" }, { status: 201 });
}
