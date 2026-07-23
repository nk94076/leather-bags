import { prisma } from "@/lib/prisma";

export async function getCmsPage(slug: string) {
  const page = await prisma.cmsPage.findUnique({ where: { slug } });
  if (!page) return null;
  return { ...page, content: JSON.parse(page.content) };
}
