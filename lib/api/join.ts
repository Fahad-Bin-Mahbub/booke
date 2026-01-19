import { User } from "@/models/User";
import { Book } from "@/models/Book";

export async function attachUserToBooks<T extends { user_id: number }>(
  books: T[]
) {
  const userIds = Array.from(new Set(books.map((b) => b.user_id)));
  const users = await User.find({ user_id: { $in: userIds } }, { user_id: 1, username: 1, name: 1, email: 1, profile_picture: 1 }).lean();
  const map = new Map(users.map((u) => [u.user_id, u]));
  return books.map((b) => ({ ...b, User: map.get(b.user_id) ? { username: map.get(b.user_id)!.username } : undefined }));
}

export async function attachBookToOrders<T extends { book_id: number }>(
  orders: T[]
) {
  const bookIds = Array.from(new Set(orders.map((o) => o.book_id)));
  const books = await Book.find({ book_id: { $in: bookIds } }).lean();
  const map = new Map(books.map((b) => [b.book_id, b]));
  return orders.map((o) => ({ ...o, Book: map.get(o.book_id) }));
}
