export type PressAssetType =
  | "photo"
  | "logo"
  | "rider-technical"
  | "rider-hospitality"
  | "bio"
  | "one-sheet";

export type PressFileFormat = "zip" | "pdf" | "jpg" | "png" | "svg";

export interface PressAsset {
  readonly id: string;
  readonly title: string;
  readonly type: PressAssetType;
  readonly description: string;
  readonly fileUrl: string;
  readonly fileFormat: PressFileFormat;
  readonly fileSize?: string;
}

export interface PressQuote {
  readonly id: string;
  readonly quote: string;
  readonly publication: string;
  readonly author?: string;
  readonly date?: string;
}
