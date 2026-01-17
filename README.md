# BookE — Next.js + TypeScript + MongoDB Atlas (Monorepo)

This project is a migration of your Database Lab **BookE** project into a single **Next.js (App Router)** codebase with **frontend + backend together**, written in **TypeScript**, and using **MongoDB Atlas** via **Mongoose**.

## Features
- Same core API endpoints as your Express backend (paths preserved under `/api/...`)
- MongoDB Atlas (Mongoose) with **numeric IDs** (`user_id`, `book_id`, etc.) preserved via a `Counter` collection
- Modern UI (Tailwind) + animations (Framer Motion)
- Skeleton loaders + better empty states
- Forms with React Hook Form + Zod
- Wishlist (bookmark) feature
- Seed data via `POST /api/seed` (and optional auto-seed)

## Setup
1) Copy env file:

```bash
cp .env.example .env.local
```

2) Put your MongoDB Atlas URI in `MONGODB_URI`.

3) Install and run:

```bash
npm install
npm run dev
```

## Seeding
- Manual:

```bash
curl -X POST http://localhost:3000/api/seed
```

- Auto-seed on first visit (dev): set `NEXT_PUBLIC_AUTO_SEED=true` in `.env.local`.

## Notes
- Uploads are saved under `public/uploads/*` when using the profile/book forms.
- Token is passed using the header `x-auth-token` (same as your original frontend).
