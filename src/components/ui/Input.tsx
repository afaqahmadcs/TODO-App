import React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
  shortcut?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, shortcut, error, type = "text", ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && (
          <span className="absolute left-3 text-outline pointer-events-none flex items-center">
            <Icon name={icon} size={18} />
          </span>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            "w-full h-9 bg-surface-container-low text-on-surface placeholder:text-outline border border-outline-variant/30 rounded-lg text-sm transition-colors focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container disabled:opacity-50",
            icon ? "pl-9" : "pl-3",
            shortcut ? "pr-12" : "pr-3",
            error && "border-error focus:border-error focus:ring-error",
            className
          )}
          {...props}
        />
        {shortcut && (
          <span className="absolute right-2.5 font-mono text-[10px] text-outline bg-surface-container-highest px-1.5 py-0.5 rounded pointer-events-none border border-outline-variant/20">
            {shortcut}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
