import { z } from "zod";

type BodyResult<T> =
  | { ok: true; data: T; formData?: FormData; raw: unknown }
  | { ok: false; status: number; message: string };

function pickFile(form: FormData, key: string): File | null {
  const v = form.get(key);
  if (!v) return null;
  return v instanceof File ? v : null;
}

/**
 * Parses JSON or multipart/form-data. When using form-data, all non-file fields are strings.
 * If a Zod schema is provided, it validates and returns typed data.
 */
export async function parseBody<T>(
  req: Request,
  opts?: {
    schema?: z.ZodTypeAny;
    /** keys that should be extracted as File values from FormData */
    fileKeys?: string[];
  }
): Promise<BodyResult<T & Record<string, unknown>>> {
  const ct = req.headers.get("content-type") || "";

  try {
    if (ct.includes("multipart/form-data")) {
      const form = await req.formData();
      const obj: Record<string, unknown> = {};

      for (const [k, v] of form.entries()) {
        if (v instanceof File) continue;
        obj[k] = v;
      }

      if (opts?.fileKeys?.length) {
        for (const key of opts.fileKeys) {
          const f = pickFile(form, key);
          if (f) obj[key] = f;
        }
      }

      if (opts?.schema) {
        const parsed = opts.schema.safeParse(obj);
        if (!parsed.success) return { ok: false, status: 400, message: "Validation error" };
        return { ok: true, data: parsed.data as any, formData: form, raw: obj };
      }

      return { ok: true, data: obj as any, formData: form, raw: obj };
    }

    const json = (await req.json()) as unknown;
    if (opts?.schema) {
      const parsed = opts.schema.safeParse(json);
      if (!parsed.success) return { ok: false, status: 400, message: "Validation error" };
      return { ok: true, data: parsed.data as any, raw: json };
    }
    return { ok: true, data: json as any, raw: json };
  } catch {
    return { ok: false, status: 400, message: "Invalid request body" };
  }
}
