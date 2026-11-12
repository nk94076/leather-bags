import { NextResponse } from "next/server";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const { altText } = await req.json().catch(() => ({}));

  const asset = await prisma.mediaAsset.update({ where: { id }, data: { altText } });
  return NextResponse.json(asset);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;

  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (asset.url.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", asset.url);
    await unlink(filePath).catch(() => {});
  }

  await prisma.mediaAsset.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
