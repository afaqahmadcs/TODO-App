import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "rectangular" | "circular" | "text";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = "rectangular",
  ...props
}) => {
  const variantStyles = {
    rectangular: "rounded-lg",
    circular: "rounded-full",
    text: "h-4 rounded",
  }[variant];

  return (
    <div
      className={cn(
        "shimmer-animated bg-surface-container-high/60",
        variantStyles,
        className
      )}
      {...props}
    />
  );
};
