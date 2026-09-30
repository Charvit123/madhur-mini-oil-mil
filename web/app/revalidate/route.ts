import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

/**
 * Called by the Spring admin (in.madhuroil.config.RevalidationClient) after
 * every catalogue write, so a swap to the real backend still gets instant
 * cache invalidation on this side. Against the local route handlers here
 * there's nothing to evict — they read lib/data.ts fresh on every call —
 * so this is a no-op until you wire a real datastore into lib/catalogue.ts.
 */
export async function POST(request: Request) {
  if (request.headers.get("x-revalidate-secret") !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  }
  const { tags } = (await request.json()) as { tags?: string[] };
  (tags?.length ? tags : ["catalogue"]).forEach(revalidateTag);
  return NextResponse.json({ revalidated: true, tags });
}
