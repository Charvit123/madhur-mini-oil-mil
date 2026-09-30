import { NextResponse } from "next/server";
import { related } from "@/lib/catalogue";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const limit = Number(new URL(req.url).searchParams.get("limit") ?? 4);
  return NextResponse.json(related(id, limit));
}
