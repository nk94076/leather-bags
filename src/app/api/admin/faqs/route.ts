import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  question: z.string().trim().min(3),
  answer: z.string().trim().min(3),
  category: z.string().trim().min(1),
  sortOrder: z.number().int().default(0),
});

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const faq = await prisma.faqItem.create({ data: parsed.data });
  revalidatePath("/faq");
  return NextResponse.json(faq);
}
