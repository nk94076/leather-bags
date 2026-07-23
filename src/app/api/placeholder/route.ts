import { NextRequest } from "next/server";
import { avatarPlaceholderSvg, bannerPlaceholderSvg, productPlaceholderSvg } from "@/lib/placeholder";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "product";
  const seed = searchParams.get("seed") ?? "corium";
  const w = Number(searchParams.get("w")) || undefined;
  const h = Number(searchParams.get("h")) || undefined;
  const label = searchParams.get("label") ?? undefined;

  let svg: string;
  if (type === "avatar") {
    svg = avatarPlaceholderSvg({ seed, name: label ?? seed, size: w ?? 96 });
  } else if (type === "banner" || type === "gallery") {
    svg = bannerPlaceholderSvg({ seed, w: w ?? 1400, h: h ?? 800, title: undefined, subtitle: undefined });
  } else {
    svg = productPlaceholderSvg({ seed, w: w ?? 800, h: h ?? 1000, label });
  }

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
