import { NextResponse } from "next/server";
import { getOil } from "@/lib/catalogue";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const oil = getOil(slug);
  if (!oil) return NextResponse.json({ error: "No such oil" }, { status: 404 });
  return NextResponse.json(oil);
}
