import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { AnnouncementEditor } from "@/components/admin/homepage/announcement-editor";
import { BannerManager } from "@/components/admin/homepage/banner-manager";
import { SectionTextEditor } from "@/components/admin/homepage/section-text-editor";
import { WhyChooseUsEditor } from "@/components/admin/homepage/why-choose-us-editor";
import { InstagramEditor } from "@/components/admin/homepage/instagram-editor";

export default async function AdminHomepagePage() {
  const [sections, banners] = await Promise.all([
    prisma.homepageSection.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.banner.findMany({ orderBy: [{ placement: "asc" }, { sortOrder: "asc" }] }),
  ]);

  const sectionMap = new Map(sections.map((s) => [s.key, s]));
  const getSection = (key: string) => sectionMap.get(key);

  const whyChoose = getSection("why-choose-us");
  const whyChooseContent = whyChoose ? JSON.parse(whyChoose.content) : { items: [] };
  const instagram = getSection("instagram");
  const instagramContent = instagram ? JSON.parse(instagram.content) : { images: [] };
  const announcement = getSection("announcement");
  const announcementContent = announcement ? JSON.parse(announcement.content) : { messages: [] };

  return (
    <div>
      <AdminPageHeader title="Homepage Manager" description="Manage every section of your homepage without touching code" />

      <div className="flex flex-col gap-6">
        <AnnouncementEditor initialMessages={announcementContent.messages ?? []} />

        <BannerManager placement="hero" label="Hero Banner Slides" banners={banners.filter((b) => b.placement === "hero")} />

        <SectionTextEditor
          sectionKey="categories"
          label="Categories Section"
          initialTitle={getSection("categories")?.title ?? ""}
          initialSubtitle={getSection("categories")?.subtitle ?? ""}
          initialVisible={getSection("categories")?.isVisible ?? true}
        />

        <SectionTextEditor
          sectionKey="latest-products"
          label="Latest Products Section"
          initialTitle={getSection("latest-products")?.title ?? ""}
          initialSubtitle={getSection("latest-products")?.subtitle ?? ""}
          initialVisible={getSection("latest-products")?.isVisible ?? true}
        />

        <SectionTextEditor
          sectionKey="trending-products"
          label="Trending Products Section"
          initialTitle={getSection("trending-products")?.title ?? ""}
          initialSubtitle={getSection("trending-products")?.subtitle ?? ""}
          initialVisible={getSection("trending-products")?.isVisible ?? true}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <BannerManager placement="promo-left" label="Promo Banner — Left" banners={banners.filter((b) => b.placement === "promo-left")} />
          <BannerManager placement="promo-right" label="Promo Banner — Right" banners={banners.filter((b) => b.placement === "promo-right")} />
        </div>

        <SectionTextEditor
          sectionKey="recently-viewed"
          label="Recently Viewed Section"
          initialTitle={getSection("recently-viewed")?.title ?? ""}
          initialSubtitle={getSection("recently-viewed")?.subtitle ?? ""}
          initialVisible={getSection("recently-viewed")?.isVisible ?? true}
        />

        <WhyChooseUsEditor
          initialTitle={whyChoose?.title ?? ""}
          initialSubtitle={whyChoose?.subtitle ?? ""}
          initialItems={whyChooseContent.items ?? []}
        />

        <SectionTextEditor
          sectionKey="reviews"
          label="Customer Reviews Section"
          initialTitle={getSection("reviews")?.title ?? ""}
          initialSubtitle={getSection("reviews")?.subtitle ?? ""}
          initialVisible={getSection("reviews")?.isVisible ?? true}
        />

        <InstagramEditor
          initialTitle={instagram?.title ?? ""}
          initialSubtitle={instagram?.subtitle ?? ""}
          initialImages={instagramContent.images ?? []}
        />

        <SectionTextEditor
          sectionKey="newsletter"
          label="Newsletter Section"
          initialTitle={getSection("newsletter")?.title ?? ""}
          initialSubtitle={getSection("newsletter")?.subtitle ?? ""}
          initialVisible={getSection("newsletter")?.isVisible ?? true}
        />
      </div>
    </div>
  );
}
