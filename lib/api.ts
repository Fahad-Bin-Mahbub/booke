import { NextResponse } from "next/server";

export function json(data: unknown, init?: { status?: number }) {
  return NextResponse.json(data, { status: init?.status ?? 200 });
}

export function error(message: string, status = 500) {
  return NextResponse.json({ message }, { status });
}
