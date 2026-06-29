import { NextResponse } from "next/server";

export function apiError(message: string, status: number, err?: unknown) {
  if (err) console.error(`[API ${status}] ${message}:`, err);
  return NextResponse.json({ error: message }, { status });
}
