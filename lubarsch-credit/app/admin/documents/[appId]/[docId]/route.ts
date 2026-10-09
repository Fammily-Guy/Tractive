import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth";
import { getRepository } from "@/lib/server/repository";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ appId: string; docId: string }> }) {
  if (!(await getSession())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { appId, docId } = await params;
  const doc = await getRepository().getDocument(appId, docId);
  if (!doc) return NextResponse.json({ error: "notFound" }, { status: 404 });
  return new NextResponse(new Uint8Array(doc.data), { headers: { "Content-Type": doc.contentType, "Cache-Control": "private, no-store" } });
}
