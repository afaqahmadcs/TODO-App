import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  statusDot?: "online" | "offline" | "busy";
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src = "/assets/avatar.png",
  alt = "User Avatar",
  name = "Afaq Ahmad",
  size = "md",
  statusDot = "online",
  className,
}) => {
  const sizeMap = {
    sm: { container: "w-7 h-7", text: "text-xs", dot: "w-2 h-2" },
    md: { container: "w-8 h-8", text: "text-sm", dot: "w-2.5 h-2.5" },
    lg: { container: "w-10 h-10", text: "text-base", dot: "w-3 h-3" },
  }[size];

  const dotColor = {
    online: "bg-secondary",
    offline: "bg-outline",
    busy: "bg-error",
  }[statusDot];

  return (
    <div className={cn("relative inline-block shrink-0", sizeMap.container, className)}>
      <div className={cn("w-full h-full rounded-full overflow-hidden ring-1 ring-outline-variant/40 bg-surface-container-high")}>
        {src ? (
          <Image
            src={src}
            alt={alt}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className={cn("w-full h-full flex items-center justify-center font-semibold text-on-surface", sizeMap.text)}>
            {name.charAt(0)}
          </span>
        )}
      </div>
      {statusDot && (
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
