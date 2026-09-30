import { NextResponse } from "next/server";
import { searchVariants } from "@/lib/catalogue";
import type { ShopQuery } from "@/lib/types";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const query: ShopQuery = {
    oil: sp.getAll("oil"),
    pack: sp.getAll("pack"),
    minPrice: sp.has("minPrice") ? Number(sp.get("minPrice")) : undefined,
    maxPrice: sp.has("maxPrice") ? Number(sp.get("maxPrice")) : undefined,
    q: sp.get("q") ?? undefined,
    inStock: sp.get("inStock") === "true",
    sort: (sp.get("sort") as ShopQuery["sort"]) ?? "featured",
    page: sp.has("page") ? Number(sp.get("page")) : 0,
    size: sp.has("size") ? Number(sp.get("size")) : 24,
  };
  return NextResponse.json(searchVariants(query));
}
