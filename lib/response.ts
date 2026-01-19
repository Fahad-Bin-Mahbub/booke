import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, init?: { status?: number }) {
  return NextResponse.json(data, { status: init?.status ?? 200 });
}

export function jsonError(message: string, status = 500) {
  return NextResponse.json({ message }, { status });
}

export function getStatusFromError(err: unknown) {
  const anyErr = err as any;
  return typeof anyErr?.status === "number" ? anyErr.status : 500;
}
