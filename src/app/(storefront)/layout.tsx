import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { prisma } from "@/lib/prisma";

async function getCategoriesSafe() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { name: true, slug: true, imageUrl: true },
    });
    return categories;
  } catch {
    return [];
  }
}

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategoriesSafe();

  return (
    <>
      <AnnouncementBar />
      <Header categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer categories={categories} />
    </>
  );
}
