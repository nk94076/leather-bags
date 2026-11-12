import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  key: z.string().trim().min(1),
  value: z.unknown(),
});

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const settings = await prisma.setting.findMany();
  return NextResponse.json(settings);
}

export async function PATCH(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const value = JSON.stringify(parsed.data.value);
  const setting = await prisma.setting.upsert({
    where: { key: parsed.data.key },
    create: { key: parsed.data.key, value },
    update: { value },
  });
  revalidatePath("/", "layout");
  return NextResponse.json(setting);
}
