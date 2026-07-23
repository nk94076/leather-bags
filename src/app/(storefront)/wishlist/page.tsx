import { Heart } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productCardInclude, toProductCardData } from "@/lib/data/products";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProductCard } from "@/components/ui/product-card";
import { LinkButton } from "@/components/ui/button";

export default async function WishlistPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <Container className="flex flex-col items-center gap-4 py-24 text-center">
        <Heart size={48} className="text-black/20" />
        <p className="font-display text-xl text-brand-ink">Sign in to view your wishlist</p>
        <p className="text-sm text-black/50">Save your favourite pieces and pick up where you left off.</p>
        <LinkButton href="/login?callbackUrl=/wishlist" className="mt-2">
          Sign In
        </LinkButton>
      </Container>
    );
  }

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: { product: { include: productCardInclude } },
    orderBy: { createdAt: "desc" },
  });

  const products = items.filter((i) => i.product.isActive).map((i) => toProductCardData(i.product));

  return (
    <div className="py-10 sm:py-14">
      <Container>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />
        <h1 className="mb-10 mt-4 font-display text-3xl text-brand-ink sm:text-4xl">My Wishlist</h1>

        {products.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <Heart size={48} className="text-black/20" />
            <p className="font-display text-xl text-brand-ink">Your wishlist is empty</p>
            <p className="text-sm text-black/50">Tap the heart icon on any product to save it here.</p>
            <LinkButton href="/shop" className="mt-2">
              Explore Products
            </LinkButton>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
