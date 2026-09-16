"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WORKSPACES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface WorkspaceNavigationProps {
  isCollapsed?: boolean;
  onItemClick?: () => void;
  className?: string;
}

export const WorkspaceNavigation: React.FC<WorkspaceNavigationProps> = ({
  isCollapsed = false,
  onItemClick,
  className,
}) => {
  const pathname = usePathname();

  return (
    <div className={cn("space-y-1", className)}>
      {!isCollapsed && (
        <div className="flex items-center justify-between px-space-sm py-1">
          <span className="font-mono text-[11px] text-outline uppercase tracking-wider font-semibold">
            Workspaces
          </span>
          <span className="text-[11px] text-outline font-mono">4</span>
        </div>
      )}

      <nav className="space-y-0.5">
        {WORKSPACES.map((workspace) => {
          const isActive = pathname.startsWith(workspace.route);

          return (
            <Link
              key={workspace.id}
              href={workspace.route}
              onClick={onItemClick}
              title={isCollapsed ? workspace.title : undefined}
              className={cn(
                "flex items-center px-space-sm py-2 rounded-lg text-sm transition-all group focus:outline-none focus:ring-2 focus:ring-primary-container/40",
                isCollapsed ? "justify-center" : "justify-between",
                isActive
                  ? "bg-surface-container-high text-on-surface font-semibold shadow-[inset_2px_0_0_0_#4f46e5]"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              )}
            >
              <div className="flex items-center gap-2.5 truncate">
                <span
                  className={cn(
                    "rounded-full shrink-0 transition-transform group-hover:scale-125",
                    isCollapsed ? "w-3 h-3" : "w-2 h-2"
                  )}
                  style={{
                    backgroundColor: workspace.color,
                    boxShadow: isActive ? `0 0 8px ${workspace.color}80` : undefined,
                  }}
                />
                {!isCollapsed && <span className="truncate">{workspace.title}</span>}
              </div>

              {!isCollapsed && (
                <span className="font-mono text-[11px] text-outline shrink-0">
                  {workspace.metaBadge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
