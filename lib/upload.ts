import { promises as fs } from "fs";
import path from "path";

export type SavedUpload = {
  url: string;
  filePath: string;
  filename: string;
};

export async function saveUploadedFile(file: File, subdir: "profile_picture" | "book_img_url"): Promise<SavedUpload> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filename = `${Date.now()}-${safeName}`;
  const publicDir = path.join(process.cwd(), "public");
  const uploadsDir = path.join(publicDir, "uploads", subdir);
  await fs.mkdir(uploadsDir, { recursive: true });
  const filePath = path.join(uploadsDir, filename);
  await fs.writeFile(filePath, buffer);

  const url = `/uploads/${subdir}/${filename}`;
  return { url, filePath, filename };
}
