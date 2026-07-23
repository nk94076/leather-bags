"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

export function ProductGallery({ images }: { images: { url: string; altText: string }[] }) {
  const [active, setActive] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [zooming, setZooming] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = images[active] ?? images[0];

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row">
      <div className="flex gap-3 overflow-x-auto sm:flex-col sm:overflow-visible">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              "relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition sm:h-24 sm:w-20",
              active === i ? "border-brand-primary" : "border-transparent opacity-70 hover:opacity-100"
            )}
          >
            <Image src={img.url} alt={img.altText} fill sizes="100px" className="object-cover" />
          </button>
        ))}
      </div>

      <div
        ref={containerRef}
        className="relative aspect-[4/5] flex-1 cursor-zoom-in overflow-hidden rounded-2xl bg-brand-cream-dark"
        onMouseEnter={() => setZooming(true)}
        onMouseLeave={() => setZooming(false)}
        onMouseMove={handleMouseMove}
      >
        {current && (
          <Image
            src={current.url}
            alt={current.altText}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-200 ease-out"
            style={
              zooming
                ? { transform: "scale(1.9)", transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                : undefined
            }
          />
        )}
        <span className="absolute bottom-3 right-3 rounded-full bg-white/85 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-brand-ink sm:hidden">
          Tap to Zoom
        </span>
      </div>
    </div>
  );
}
