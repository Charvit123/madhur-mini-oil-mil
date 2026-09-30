import { NextResponse } from "next/server";
import { reviewsForProduct } from "@/lib/catalogue";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json(reviewsForProduct(id));
}
