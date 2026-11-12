import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ key: string }>;
}

const schema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  content: z.unknown().optional(),
  isVisible: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: Params) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { key } = await params;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.content !== undefined) data.content = JSON.stringify(parsed.data.content);

  const section = await prisma.homepageSection.update({ where: { key }, data });
  revalidatePath("/");
  return NextResponse.json(section);
}
