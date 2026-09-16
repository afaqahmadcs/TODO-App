import React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  variant?: "indigo" | "emerald";
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  variant = "emerald",
  disabled = false,
  className,
  ariaLabel = "Mark completed",
}) => {
  const activeColorClass =
    variant === "emerald"
      ? "bg-secondary border-secondary text-surface"
      : "bg-primary-container border-primary-container text-white";

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onChange(!checked);
      }}
      className={cn(
        "w-[18px] h-[18px] rounded-[5px] border transition-all duration-200 flex items-center justify-center shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50",
        checked
          ? activeColorClass
          : "border-outline-variant/60 bg-transparent hover:border-outline",
        className
      )}
    >
      {checked && (
        <svg
          className="w-3 h-3 stroke-[3]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
};
