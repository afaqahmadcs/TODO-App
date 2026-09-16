"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export interface NavigationItemProps {
  label: string;
  href: string;
  icon: string;
  badge?: string | number;
  isCollapsed?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export const NavigationItem: React.FC<NavigationItemProps> = ({
  label,
  href,
  icon,
  badge,
  isCollapsed = false,
  disabled = false,
  onClick,
  className,
}) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

  if (disabled) {
    return (
      <div
        className={cn(
          "flex items-center px-space-sm py-2 rounded-lg text-sm text-on-surface-variant/40 cursor-not-allowed opacity-50 select-none",
          isCollapsed ? "justify-center" : "justify-between",
          className
        )}
        aria-disabled="true"
      >
        <div className="flex items-center gap-2.5">
          <Icon name={icon} size={18} />
          {!isCollapsed && <span>{label}</span>}
        </div>
      </div>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      title={isCollapsed ? label : undefined}
      className={cn(
        "flex items-center px-space-sm py-2 rounded-lg text-sm transition-all duration-150 group relative focus:outline-none focus:ring-2 focus:ring-primary-container/40",
        isCollapsed ? "justify-center" : "justify-between",
        isActive
          ? "bg-primary-container text-on-primary-container font-semibold shadow-sm"
          : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
        className
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <Icon
          name={icon}
          size={18}
          className={cn(
            "shrink-0 transition-transform group-hover:scale-105",
            isActive ? "text-on-primary-container" : "text-on-surface-variant group-hover:text-on-surface"
          )}
        />
        {!isCollapsed && <span className="truncate">{label}</span>}
      </div>

      {!isCollapsed && badge !== undefined && (
        <span
          className={cn(
            "px-1.5 py-0.2 rounded-full font-mono text-[10px] font-semibold shrink-0",
            isActive
              ? "bg-surface-container-lowest text-on-surface"
              : "bg-surface-container-highest text-on-surface"
          )}
        >
          {badge}
        </span>
      )}

      {isCollapsed && badge !== undefined && (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary ring-2 ring-surface" />
      )}
    </Link>
  );
};
