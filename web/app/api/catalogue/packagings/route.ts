import { NextResponse } from "next/server";
import { listPackagings } from "@/lib/catalogue";

export async function GET() {
  return NextResponse.json(listPackagings());
}
