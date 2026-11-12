import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ slug: string }>;
}

const schema = z.object({
  title: z.string().trim().min(1),
  metaTitle: z.string().optional(),
  metaDesc: z.string().optional(),
  content: z.unknown(),
});

export async function PATCH(req: Request, { params }: Params) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { slug } = await params;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const page = await prisma.cmsPage.update({
    where: { slug },
    data: {
      title: parsed.data.title,
      metaTitle: parsed.data.metaTitle,
      metaDesc: parsed.data.metaDesc,
      content: JSON.stringify(parsed.data.content),
    },
  });
  revalidatePath(`/${slug}`);
  return NextResponse.json(page);
}
