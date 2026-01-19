export type UserPublic = {
  user_id: number;
  username: string;
  name: string;
  email: string;
  phone_number?: string | null;
  address?: string | null;
  profile_picture?: string | null;
  Book?: Book[];
};

export type Book = {
  book_id: number;
  title: string;
  author?: string | null;
  genre?: string | null;
  description?: string | null;
  book_condition: "new" | "used";
  price?: number | null;
  book_img_url?: string | null;
  user_id: number;
  is_for_sale: boolean;
  is_for_loan: boolean;
  is_for_giveaway: boolean;
  transaction: boolean;
  User?: {
    username: string;
  };
};

// Back-compat alias used by some components.
export type BookListItem = Book;

export type Order = {
  order_id: number;
  book_id: number;
  buyer_id: number;
  seller_id: number;
  is_confirmed: number; // 0 pending, 1 confirmed, 2 discarded
  Book?: Book;
  createdAt?: string;
  updatedAt?: string;
};

export type Genre = {
  genre_id: number;
  name: string;
};

export type RatingStats = {
  ratingCount: number;
  averageRating: number;
};

export type Review = {
  review_id: number;
  reviewer_id: number;
  recipient_id: number;
  review: string;
  Reviewer?: {
    username: string;
    user_id: number;
  };
};

export type WishlistItem = {
  user_id: number;
  book_id: number;
  createdAt: string;
  Book?: Book;
};
