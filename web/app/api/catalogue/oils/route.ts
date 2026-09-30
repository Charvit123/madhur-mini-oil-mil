import { NextResponse } from "next/server";
import { listOils } from "@/lib/catalogue";

export async function GET() {
  return NextResponse.json(listOils());
}
