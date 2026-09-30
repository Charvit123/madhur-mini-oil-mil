import { NextResponse } from "next/server";
import { facets } from "@/lib/catalogue";

export async function GET() {
  return NextResponse.json(facets());
}
