import { NextResponse } from "next/server";
import { featured } from "@/lib/catalogue";

export async function GET(req: Request) {
  const limit = Number(new URL(req.url).searchParams.get("limit") ?? 8);
  return NextResponse.json(featured(limit));
}
