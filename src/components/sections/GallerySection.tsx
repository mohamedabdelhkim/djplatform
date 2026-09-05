import React from "react";
import Image from "next/image";
import { Container } from "../layout/Container";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getAllGalleryImages } from "@/lib/content";

export function GallerySection() {
  const images = getAllGalleryImages();

  return (
    <section id="gallery" className="border-b border-border bg-background py-20 sm:py-28">
      <Container>
        {/* Section Header */}
        <SectionHeader
          index="04"
          label="VISUAL ARCHIVE"
          title="Performance & Space"
          action={
            <span className="font-mono text-xs text-text-muted">
              {images.length} CURATED ARCHIVE IMAGES
            </span>
          }
        />

        {/* Brutalist Image Grid with Dynamic Aspect Ratios */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 items-start">
          {images.map((img) => (
            <Card
              key={img.id}
              variant="interactive"
              className="relative overflow-hidden"
            >
              {/* Image Container with Dynamic Aspect Ratio */}
              <AspectRatio ratio={img.aspectRatio} className="bg-surface-active">
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
              </AspectRatio>

              {/* Caption & Metadata */}
              <div className="border-t border-border p-3.5">
                <p className="line-clamp-1 font-mono text-xs text-text-muted group-hover:text-text-primary transition-colors duration-fast">
                  {img.alt}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
