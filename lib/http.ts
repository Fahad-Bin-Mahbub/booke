import { z } from "zod";

export type ApiError = {
  message: string;
};

export async function apiFetch<T>(
  path: string,
  opts?: {
    method?: string;
    body?: unknown;
    token?: string;
    formData?: FormData;
    schema?: z.ZodTypeAny;
    cache?: RequestCache;
  }
): Promise<T> {
  const method = opts?.method ?? (opts?.body || opts?.formData ? "POST" : "GET");
  const headers: HeadersInit = {};
  if (opts?.token) headers["x-auth-token"] = opts.token;

  const init: RequestInit = {
    method,
    headers,
    cache: opts?.cache ?? "no-store",
  };

  if (opts?.formData) {
    init.body = opts.formData;
  } else if (opts?.body !== undefined) {
    headers["content-type"] = "application/json";
    init.body = JSON.stringify(opts.body);
  }

  const res = await fetch(path, init);
  const text = await res.text();
  const json = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const msg = (json as any)?.message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }

  if (opts?.schema) {
    const parsed = opts.schema.safeParse(json);
    if (!parsed.success) {
      throw new Error("Invalid server response");
    }
    return parsed.data as T;
  }

  return json as T;
}
