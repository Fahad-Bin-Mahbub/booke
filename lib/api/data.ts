import type { BookDoc } from "@/models/Book";
import type { UserDoc } from "@/models/User";

export type BookWithUser = Omit<BookDoc, "_id"> & { User?: { username: string } };

export function toUserPublic(user: UserDoc) {
  const { password: _pw, ...rest } = user;
  return rest;
}

export function attachUserToBook(book: BookDoc, user?: UserDoc): BookWithUser {
  const b: any = { ...book };
  if (user) b.User = { username: user.username };
  return b as BookWithUser;
}
