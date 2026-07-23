import Image from "next/image";
import Link from "next/link";

export function CategoryCard({
  name,
  slug,
  imageUrl,
}: {
  name: string;
  slug: string;
  imageUrl: string;
}) {
  return (
    <Link
      href={`/shop/${slug}`}
      className="group relative flex aspect-[3/4] shrink-0 w-[46vw] sm:w-56 flex-col justify-end overflow-hidden rounded-2xl"
    >
      <Image
        src={imageUrl}
        alt={`${name} collection`}
        fill
        sizes="(max-width: 768px) 50vw, 240px"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition-opacity duration-300 group-hover:from-black/80" />
      <div className="relative flex items-center justify-between p-4">
        <span className="font-display text-lg text-white">{name}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </div>
    </Link>
  );
}
