"use client";

import React, { useState } from "react";
import { Play } from "lucide-react";

export interface AudioFacadeProps {
  readonly platform: "spotify" | "soundcloud" | "mixcloud";
  readonly trackId: string;
  readonly title?: string;
}

export function AudioFacade({ platform, trackId, title }: AudioFacadeProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const getEmbedUrl = () => {
    switch (platform) {
      case "spotify":
        return `https://open.spotify.com/embed/track/${trackId}?autoplay=1`;
      case "soundcloud":
        return `https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/${trackId}&auto_play=true`;
      case "mixcloud":
        return `https://www.mixcloud.com/widget/iframe/?feed=${trackId}&autoplay=1`;
      default:
        return "";
    }
  };

  if (!isLoaded) {
    return (
      <div className="my-4 w-full border border-border bg-surface p-4 transition-colors duration-fast hover:border-accent">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsLoaded(true)}
              aria-label={title ? `Play ${title}` : `Play audio on ${platform}`}
              className="flex h-11 w-11 shrink-0 items-center justify-center border border-border bg-surface-active text-text-primary transition-all duration-fast hover:border-accent hover:bg-accent hover:text-background focus-visible:outline-2 focus-visible:outline-accent"
            >
              <Play className="h-4 w-4 fill-current ml-0.5" aria-hidden="true" />
            </button>
            <div className="min-w-0">
              {title && (
                <h4 className="truncate font-display text-sm font-bold uppercase tracking-tight text-text-primary">
                  {title}
                </h4>
              )}
              <span className="font-mono text-xs uppercase tracking-wider text-accent">
                [{platform}]
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsLoaded(true)}
            className="border border-border px-3 py-1 font-mono text-xs uppercase tracking-wider text-text-muted hover:border-text-primary hover:text-text-primary"
          >
            PLAY
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-4 w-full border border-border bg-surface p-2">
      <iframe
        src={getEmbedUrl()}
        title={title || `Audio player (${platform})`}
        width="100%"
        height="160"
        allow="autoplay; encrypted-media"
        loading="lazy"
        className="w-full border-0"
      />
    </div>
  );
}
