"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  statusDot?: "online" | "offline" | "busy";
  className?: string;
}

function getInitials(name?: string): string {
  if (!name || !name.trim()) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "User Avatar",
  name = "User",
  size = "md",
  statusDot,
  className,
}) => {
  const [prevSrc, setPrevSrc] = useState(src);
  const [imageError, setImageError] = useState(false);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setImageError(false);
  }

  const sizeMap = {
    sm: { container: "w-7 h-7", text: "text-[10px]", dot: "w-2 h-2" },
    md: { container: "w-8 h-8", text: "text-xs", dot: "w-2.5 h-2.5" },
    lg: { container: "w-10 h-10", text: "text-sm", dot: "w-3 h-3" },
  }[size];

  const dotColor = statusDot
    ? {
        online: "bg-secondary",
        offline: "bg-outline",
        busy: "bg-error",
      }[statusDot]
    : undefined;

  const hasValidImage = Boolean(src && src.trim().length > 0 && !imageError);
  const initials = getInitials(name);

  return (
    <div className={cn("relative inline-block shrink-0", sizeMap.container, className)}>
      <div
        className={cn(
          "w-full h-full rounded-full overflow-hidden ring-1 ring-outline-variant/30 flex items-center justify-center transition-all",
          hasValidImage
            ? "bg-surface-container-high"
            : "bg-gradient-to-br from-primary/25 to-secondary/25 text-on-surface border border-primary/20 select-none"
        )}
      >
        {hasValidImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src!}
            alt={alt}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span
            className={cn(
              "font-bold font-headline tracking-wider text-primary flex items-center justify-center",
              sizeMap.text
            )}
          >
            {initials}
          </span>
        )}
      </div>

      {statusDot && dotColor && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full ring-2 ring-surface",
            sizeMap.dot,
            dotColor
          )}
        />
      )}
    </div>
  );
};
