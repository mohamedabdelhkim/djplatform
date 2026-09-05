import React from "react";
import Image from "next/image";
import { Container } from "../layout/Container";
import { Badge } from "@/components/ui/Badge";
import { getAllGalleryImages } from "@/src/lib/content";

export function GallerySection() {
  const images = getAllGalleryImages();

  return (
    <section id="gallery" className="border-b border-border bg-background py-20 sm:py-28">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col gap-2 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-accent">
              [04] // VISUAL ARCHIVE
            </span>
            <h2 className="mt-1 font-display text-3xl font-bold uppercase tracking-tight text-text-primary sm:text-4xl">
              Performance & Space
            </h2>
          </div>
          <span className="font-mono text-xs text-text-muted">
            {images.length} CURATED ARCHIVE IMAGES
          </span>
        </div>

        {/* Brutalist Image Grid with Sharp Geometry */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative border border-border bg-surface transition-colors duration-fast hover:border-accent"
            >
              {/* Image Container with Fixed Aspect Ratio */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-active">
                {/* Visual placeholder */}
                <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] uppercase text-text-muted/40">
                  [{img.category.toUpperCase()} // {img.aspectRatio}]
                </div>

                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-opacity duration-fast group-hover:opacity-90"
                  loading={img.priority ? "eager" : "lazy"}
                />

                {/* Category Badge overlay */}
                <div className="absolute top-3 left-3 z-10">
                  <Badge label={img.category} variant="neutral" />
                </div>
              </div>

              {/* Caption & Metadata */}
              <div className="border-t border-border p-3.5">
                <p className="line-clamp-1 font-mono text-xs text-text-muted group-hover:text-text-primary transition-colors duration-fast">
                  {img.alt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
