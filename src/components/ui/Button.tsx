import React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "xs" | "sm" | "md" | "lg";
  icon?: string;
  iconRight?: string;
  shortcut?: string;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      icon,
      iconRight,
      shortcut,
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 select-none focus:outline-none focus:ring-2 focus:ring-primary-container/50 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const variantStyles = {
      primary:
        "bg-primary-container hover:bg-inverse-primary text-white shadow-sm shadow-indigo-900/20 font-semibold",
      secondary:
        "bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant/30 shadow-sm",
      ghost:
        "bg-transparent hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface",
      outline:
        "bg-transparent border border-outline-variant hover:bg-surface-container-high text-on-surface",
      danger:
        "bg-error-container text-on-error-container hover:bg-error-container/80 font-medium",
    };

    const sizeStyles = {
      xs: "text-xs px-2 py-1 gap-1",
      sm: "text-xs px-2.5 py-1.5 gap-1.5",
      md: "text-sm px-3.5 py-2 gap-2",
      lg: "text-base px-5 py-2.5 gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          icon && <Icon name={icon} size={size === "xs" ? 14 : size === "sm" ? 16 : 18} />
        )}
        {children && <span>{children}</span>}
        {iconRight && !isLoading && (
          <Icon name={iconRight} size={size === "xs" ? 14 : size === "sm" ? 16 : 18} />
        )}
        {shortcut && (
          <kbd className="ml-1 px-1.5 py-0.5 rounded bg-surface-container-lowest text-outline text-[10px] font-mono border border-outline-variant/20">
            {shortcut}
          </kbd>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
