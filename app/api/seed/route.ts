import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { json, err } from "@/lib/api/response";
import { Counter } from "@/models/Counter";
import { User } from "@/models/User";
import { Genre } from "@/models/Genre";
import { Book } from "@/models/Book";
import { Order } from "@/models/Order";
import { Rating } from "@/models/Rating";
import { Review } from "@/models/Review";
import { Wishlist } from "@/models/Wishlist";
import { nextSeq } from "@/lib/sequence";

export async function POST(req: Request) {
	try {
		await connectDB();

		// Debug: confirm which DB you're connected to
		console.log(
			"CONNECTED DB:",
			(await import("mongoose")).default.connection.name
		);

		const url = new URL(req.url);
		const ifEmpty = url.searchParams.get("ifEmpty") === "1";

		// If ifEmpty=1, seed only when core collections are empty
		if (ifEmpty) {
			const [users, books, genres] = await Promise.all([
				User.countDocuments(),
				Book.countDocuments(),
				Genre.countDocuments(),
			]);
			if (users > 0 || books > 0 || genres > 0) {
				return json({ message: "Already seeded" });
			}
		}

		// Fresh seed (dev-friendly): wipe collections FIRST
		await Promise.all([
			Counter.deleteMany({}),
			Wishlist.deleteMany({}),
			Review.deleteMany({}),
			Rating.deleteMany({}),
			Order.deleteMany({}),
			Book.deleteMany({}),
			Genre.deleteMany({}),
			User.deleteMany({}),
		]);

		const defaultGenres = [
			"Fiction",
			"Non-Fiction",
			"Science Fiction",
			"Fantasy",
			"Mystery",
			"Thriller",
			"Romance",
			"Horror",
			"Biography",
			"History",
			"Business",
			"Self-Help",
			"Programming",
			"Technology",
			"Education",
			"Comics & Graphic Novels",
			"Young Adult",
			"Children",
			"Poetry",
			"Religion & Spirituality",
		];

		// Insert genres with required numeric genre_id
		for (const name of defaultGenres) {
			const genre_id = await nextSeq("genre_id");
			await Genre.create({ genre_id, name });
		}

		const salt = await bcrypt.genSalt(10);
		const pw = await bcrypt.hash("password123", salt);

		const users = [
			{
				username: "alice",
				name: "Alice Rahman",
				email: "alice@example.com",
				phone_number: "01700000001",
				address: "Dhaka",
				profile_picture: null,
			},
			{
				username: "bob",
				name: "Bob Hasan",
				email: "bob@example.com",
				phone_number: "01700000002",
				address: "Chattogram",
				profile_picture: null,
			},
			{
				username: "carla",
				name: "Carla Ahmed",
				email: "carla@example.com",
				phone_number: "01700000003",
				address: "Sylhet",
				profile_picture: null,
			},
		];

		for (const u of users) {
			const user_id = await nextSeq("user_id");
			await User.create({ ...u, user_id, password: pw });
		}

		const alice = await User.findOne({ username: "alice" }).lean();
		const bob = await User.findOne({ username: "bob" }).lean();
		const carla = await User.findOne({ username: "carla" }).lean();
		if (!alice || !bob || !carla) return err("Seed failed", 500);

		const sampleBooks = [
			{
				title: "Atomic Habits",
				author: "James Clear",
				genre: "Business",
				description:
					"Tiny changes, remarkable results. Build habits that stick.",
				book_condition: "used" as const,
				price: 320,
				user_id: alice.user_id,
				is_for_sale: true,
				is_for_loan: false,
				is_for_giveaway: false,
			},
			{
				title: "The Pragmatic Programmer",
				author: "Andrew Hunt",
				genre: "Education",
				description: "A modern classic for building software like a pro.",
				book_condition: "used" as const,
				price: 520,
				user_id: bob.user_id,
				is_for_sale: true,
				is_for_loan: false,
				is_for_giveaway: false,
			},
			{
				title: "Sapiens",
				author: "Yuval Noah Harari",
				genre: "History",
				description: "A brief history of humankind — big ideas, fast read.",
				book_condition: "new" as const,
				price: 680,
				user_id: carla.user_id,
				is_for_sale: true,
				is_for_loan: false,
				is_for_giveaway: false,
			},
			{
				title: "Dune",
				author: "Frank Herbert",
				genre: "Fantasy",
				description: "Politics, spice, sandworms. A sci-fi epic.",
				book_condition: "used" as const,
				price: 0,
				user_id: alice.user_id,
				is_for_sale: false,
				is_for_loan: false,
				is_for_giveaway: true,
			},
			{
				title: "A Brief History of Time",
				author: "Stephen Hawking",
				genre: "Science",
				description: "Space, time, and black holes explained for humans.",
				book_condition: "used" as const,
				price: 250,
				user_id: bob.user_id,
				is_for_sale: false,
				is_for_loan: true,
				is_for_giveaway: false,
			},
		];

		const createdBooks: any[] = [];
		for (const b of sampleBooks) {
			const book_id = await nextSeq("book_id");
			const doc = await Book.create({
				book_id,
				title: b.title,
				author: b.author,
				genre: b.genre,
				description: b.description,
				book_condition: b.book_condition,
				price: b.price,
				user_id: b.user_id,
				is_for_sale: b.is_for_sale,
				is_for_loan: b.is_for_loan,
				is_for_giveaway: b.is_for_giveaway,
				book_img_url: null,
				transaction: false,
			});
			createdBooks.push(doc.toObject());
		}

		// Orders to create "direct connection" for rating/review
		const dune = createdBooks.find((b) => b.title === "Dune");
		const pragmatic = createdBooks.find(
			(b) => b.title === "The Pragmatic Programmer"
		);

		if (dune) {
			const order_id = await nextSeq("order_id");
			await Order.create({
				order_id,
				book_id: dune.book_id,
				buyer_id: bob.user_id,
				seller_id: alice.user_id,
				is_confirmed: 1,
			});

			await Book.updateOne(
				{ book_id: dune.book_id },
				{ $set: { transaction: true } }
			);

			const rating_id = await nextSeq("rating_id");
			await Rating.create({
				rating_id,
				rater_id: bob.user_id,
				recipient_id: alice.user_id,
				rating: 9,
			});

			const review_id = await nextSeq("review_id");
			await Review.create({
				review_id,
				reviewer_id: bob.user_id,
				recipient_id: alice.user_id,
				review: "Smooth transaction and great book condition.",
			});
		}

		if (pragmatic) {
			const order_id2 = await nextSeq("order_id");
			await Order.create({
				order_id: order_id2,
				book_id: pragmatic.book_id,
				buyer_id: carla.user_id,
				seller_id: bob.user_id,
				is_confirmed: 0,
			});

			// wishlist examples
			await Wishlist.create({
				user_id: alice.user_id,
				book_id: pragmatic.book_id,
			});
			await Wishlist.create({
				user_id: carla.user_id,
				book_id: pragmatic.book_id,
			});
		}

		return json({
			message: "Seeded",
			users: 3,
			books: createdBooks.length,
			genres: defaultGenres.length,
			demo: {
				email: "alice@example.com",
				password: "password123",
			},
		});
	} catch (e) {
		console.error(e);
		return err("Server error", 500);
	}
}
