import { connectDB } from "@/lib/db";
import { err, json } from "@/lib/api/response";
import { Genre } from "@/models/Genre";
import { nextSeq } from "@/lib/sequence";
import { z } from "zod";
import { parseBody } from "@/lib/api/body";

const schema = z.object({ name: z.string().min(1).max(60) });

export async function POST(req: Request) {
  await connectDB();
  const body = await parseBody(req, { schema });
  if (!body.ok) return err(body.message, body.status);
  const { name } = body.data;
  const existing = await Genre.findOne({ name }).lean();
  if (existing) return err("Genre already exists", 400);
  const genre_id = await nextSeq("genre_id");
  const doc = await Genre.create({ genre_id, name });
  return json(doc.toObject(), { status: 201 });
}
