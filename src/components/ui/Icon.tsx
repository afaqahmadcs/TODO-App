import React from "react";
import { cn } from "@/lib/utils";

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  size?: number | string;
  fill?: boolean;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  fill = false,
  className,
  style,
  ...props
}) => {
  return (
    <span
      className={cn("material-symbols-outlined select-none", className)}
      style={{
        fontSize: typeof size === "number" ? `${size}px` : size,
        fontVariationSettings: fill ? "'FILL' 1" : "'FILL' 0",
        ...style,
      }}
      aria-hidden="true"
      {...props}
    >
      {name}
    </span>
  );
};
