"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { Play, Maximize2, Rotate3D, ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductPageImage, ProductPageVideo, ProductPageModel3d } from "@/lib/api/product-page";

interface ProductGalleryProps {
  images: ProductPageImage[];
  videos: ProductPageVideo[];
  models3d: ProductPageModel3d[];
  title: string;
  className?: string;
}

type GalleryMode = "image" | "video" | "model3d";

export function ProductGallery({ images, videos, models3d, title, className }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mode, setMode] = useState<GalleryMode>("image");
  const imageRef = useRef<HTMLDivElement>(null!);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const allMedia = [
    ...images.map((img) => ({ type: "image" as const, data: img })),
    ...videos.map((vid) => ({ type: "video" as const, data: vid })),
    ...models3d.map((m) => ({ type: "model3d" as const, data: m })),
  ];

  const activeItem = allMedia[activeIndex];

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % allMedia.length);
  }, [allMedia.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + allMedia.length) % allMedia.length);
  }, [allMedia.length]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!imageRef.current || mode !== "image") return;
    const rect = imageRef.current.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, [mode]);

  if (allMedia.length === 0) {
    return (
      <div className={cn("aspect-square rounded-2xl bg-muted flex items-center justify-center", className)}>
        <span className="text-6xl text-muted-foreground/30 font-heading tracking-widest">◈</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        ref={imageRef}
        className="relative aspect-square rounded-2xl overflow-hidden bg-muted group"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMousePos({ x: 50, y: 50 })}
      >
        {mode === "image" && activeItem?.type === "image" && (
          <>
            <Image
              src={activeItem.data.url}
              alt={activeItem.data.alt ?? title}
              fill
              className="object-cover transition-all duration-500"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: `radial-gradient(circle 120px at ${mousePos.x}% ${mousePos.y}%, transparent 0%, rgba(0,0,0,0.35) 100%)`,
              }}
            />
          </>
        )}

        {mode === "video" && activeItem?.type === "video" && (
          <div className="relative w-full h-full">
            <video
              src={activeItem.data.url}
              controls
              poster={activeItem.data.thumbnail ?? undefined}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {mode === "model3d" && activeItem?.type === "model3d" && (
          <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-dark/80 to-dark">
            <div className="text-center space-y-3">
              <Rotate3D className="h-12 w-12 text-primary mx-auto animate-breathe" />
              <span className="text-sm text-muted-foreground">3D Model Viewer</span>
              {activeItem.data.url && (
                <a
                  href={activeItem.data.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-10 border border-primary/20 text-primary text-xs hover:bg-primary-20 transition-all duration-300"
                >
                  <Rotate3D className="h-3 w-3" />
                  Open 3D Model
                </a>
              )}
            </div>
          </div>
        )}

        {/* Mode badges */}
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); setMode("image"); }}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-[0.625rem] font-heading font-medium tracking-wider backdrop-blur-md border transition-all duration-300",
              mode === "image"
                ? "bg-primary text-dark border-primary shadow-[0_0_16px_rgba(0,212,255,0.2)]"
                : "bg-black/50 text-white/80 border-white/15 hover:bg-black/70",
            )}
          >
            Photo
          </button>
          {videos.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setMode("video"); }}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-[0.625rem] font-heading font-medium tracking-wider backdrop-blur-md border transition-all duration-300",
                mode === "video"
                  ? "bg-primary text-dark border-primary shadow-[0_0_16px_rgba(0,212,255,0.2)]"
                  : "bg-black/50 text-white/80 border-white/15 hover:bg-black/70",
              )}
            >
              <Play className="h-3 w-3 inline mr-1 -mt-0.5" />
              Video
            </button>
          )}
          {models3d.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setMode("model3d"); }}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-[0.625rem] font-heading font-medium tracking-wider backdrop-blur-md border transition-all duration-300",
                mode === "model3d"
                  ? "bg-primary text-dark border-primary shadow-[0_0_16px_rgba(0,212,255,0.2)]"
                  : "bg-black/50 text-white/80 border-white/15 hover:bg-black/70",
              )}
            >
              <Rotate3D className="h-3 w-3 inline mr-1 -mt-0.5" />
              3D
            </button>
          )}
        </div>

        {(!videos.length || mode === "image") && (
          <button
            onClick={(e) => { e.stopPropagation(); }}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        )}

        {allMedia.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/15 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70 z-10"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/15 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70 z-10"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Index indicator */}
        {allMedia.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {allMedia.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveIndex(i);
                  const item = allMedia[i];
                  if (item.type === "image") setMode("image");
                  if (item.type === "video") setMode("video");
                  if (item.type === "model3d") setMode("model3d");
                }}
                className={cn(
                  "rounded-full transition-all duration-300",
                  i === activeIndex
                    ? "w-6 h-1.5 bg-primary"
                    : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60",
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {allMedia.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
          {allMedia.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                setActiveIndex(i);
                if (item.type === "image") setMode("image");
                if (item.type === "video") setMode("video");
                if (item.type === "model3d") setMode("model3d");
              }}
              className={cn(
                "relative flex-shrink-0 w-[72px] h-[72px] rounded-xl overflow-hidden border-2 transition-all duration-300",
                i === activeIndex
                  ? "border-primary ring-1 ring-primary/30 shadow-[0_0_12px_rgba(0,212,255,0.1)]"
                  : "border-border hover:border-primary/40",
              )}
            >
              {item.type === "image" && (
                <Image
                  src={item.data.url}
                  alt={item.data.alt ?? `${title} ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="72px"
                />
              )}
              {item.type === "video" && (
                <div className="relative w-full h-full bg-muted">
                  {item.data.thumbnail ? (
                    <Image src={item.data.thumbnail} alt="" fill className="object-cover" sizes="72px" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-dark/60 to-dark" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="h-5 w-5 text-white" />
                  </div>
                </div>
              )}
              {item.type === "model3d" && (
                <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-dark/80 to-dark">
                  <Rotate3D className="h-5 w-5 text-primary" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
