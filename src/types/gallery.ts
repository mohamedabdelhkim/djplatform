export type GalleryCategory = "live" | "studio" | "press" | "editorial";

export type AspectRatio = "16:9" | "4:3" | "1:1" | "3:2" | "4:5";

export interface GalleryImage {
  readonly id: string;
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  readonly aspectRatio: AspectRatio;
  readonly category: GalleryCategory;
  readonly priority: boolean;
}
