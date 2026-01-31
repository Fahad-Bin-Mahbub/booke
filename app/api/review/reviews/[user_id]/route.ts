import { connectDB } from "@/lib/db";
import { err, json } from "@/lib/api/response";
import { Review } from "@/models/Review";
import { User } from "@/models/User";

export async function GET(
	_req: Request,
	{ params }: { params: Promise<{ user_id: string }> }
) {
	await connectDB();
	const { user_id: userIdStr } = await params;
	const user_id = Number(userIdStr);

	if (!Number.isFinite(user_id)) return err("Invalid user ID", 400);
	const reviews = await Review.find({ recipient_id: user_id })
		.sort({ review_id: -1 })
		.lean();
	const reviewerIds = Array.from(new Set(reviews.map((r) => r.reviewer_id)));
	const users = await User.find(
		{ user_id: { $in: reviewerIds } },
		{ user_id: 1, username: 1 }
	).lean();
	const map = new Map(users.map((u) => [u.user_id, u]));
	const enriched = reviews.map((r) => ({
		...r,
		Reviewer: map.get(r.reviewer_id)
			? {
					username: map.get(r.reviewer_id)!.username,
					user_id: map.get(r.reviewer_id)!.user_id,
			  }
			: undefined,
	}));
	return json(enriched);
}













