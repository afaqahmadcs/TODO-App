import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "low" | "high" | "elevated";
  hoverEffect?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", hoverEffect = false, children, ...props }, ref) => {
    const variantStyles = {
      default: "bg-surface-container border border-outline-variant/20 shadow-sm",
      low: "bg-surface-container-low border border-outline-variant/20 shadow-sm",
      high: "bg-surface-container-high border border-outline-variant/30 shadow-md",
      elevated: "bg-surface-container-high border border-outline-variant/40 shadow-xl backdrop-blur-md",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl p-space-md transition-all duration-200",
          variantStyles[variant],
          hoverEffect && "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
