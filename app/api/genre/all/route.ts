import { connectDB } from "@/lib/db";
import { json } from "@/lib/api/response";
import { Genre } from "@/models/Genre";

export async function GET() {
  await connectDB();
  
  const genres = await Genre.find({}).sort({ name: 1 }).lean();
  return json(genres);
}
