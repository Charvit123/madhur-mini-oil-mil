import { NextResponse } from "next/server";
import { getProduct } from "@/lib/catalogue";

// Folder is named [id] to match the sibling routes ([id]/reviews, [id]/related) —
// Next.js requires one param name per path depth. The value passed here is
// still the product's slug (e.g. "double-filtered-groundnut-oil"); only the
// segment's name changed, not what lib/api.ts sends as the path.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: slug } = await params;
  const product = getProduct(slug);
  if (!product) return NextResponse.json({ error: "No such product" }, { status: 404 });
  return NextResponse.json(product);
}
