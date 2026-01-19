import { connectDB } from "@/lib/db";
import { err, json } from "@/lib/api/response";
import { Rating } from "@/models/Rating";

export async function GET(
	_req: Request,
	{ params }: { params: Promise<{ user_id: string }> }
) {
	await connectDB();
	const { user_id: userIdStr } = await params;
	const user_id = Number(userIdStr);

	if (!Number.isFinite(user_id)) return err("Invalid user ID", 400);
	const ratings = await Rating.find({ recipient_id: user_id }).lean();
	const ratingCount = ratings.length;
	const total = ratings.reduce((acc, r) => acc + (r.rating || 0), 0);
	const averageRating = ratingCount ? total / ratingCount : 0;
	return json({ ratingCount, averageRating });
}
