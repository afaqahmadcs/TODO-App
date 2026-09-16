import React from "react";
import { cn } from "@/lib/utils";

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: "default" | "narrow" | "full";
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = "default",
  className,
  ...props
}) => {
  const maxWidthMap = {
    narrow: "max-w-4xl",
    default: "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <div
      className={cn(
        "w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6",
        maxWidthMap[maxWidth],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
