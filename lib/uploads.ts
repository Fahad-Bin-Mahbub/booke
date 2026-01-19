import { promises as fs } from "fs";
import path from "path";

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function saveUploadedFile(file: File, folder: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const safeName = `${Date.now()}-${sanitizeFilename(file.name)}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  await fs.mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, safeName);
  await fs.writeFile(filePath, buffer);

  return `/uploads/${folder}/${safeName}`;
}
