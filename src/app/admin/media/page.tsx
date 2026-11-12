import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { MediaManager } from "@/components/admin/media-manager";

export default async function AdminMediaPage() {
  const assets = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <AdminPageHeader title="Media Manager" description={`${assets.length} images in your media library`} />
      <MediaManager assets={assets} />
    </div>
  );
}
