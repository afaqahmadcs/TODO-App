"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { WORKSPACES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface MobileNavigationProps {
  onOpenQuickTask?: () => void;
  className?: string;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  onOpenQuickTask,
  className,
}) => {
  const pathname = usePathname();
  const [isWorkspacesDrawerOpen, setIsWorkspacesDrawerOpen] = useState(false);

  const mainTabs = [
    { label: "Dashboard", href: "/dashboard", icon: "space_dashboard" },
    { label: "My Tasks", href: "/tasks", icon: "check_circle" },
    { label: "Quick Add", isAction: true, icon: "add" },
    { label: "Calendar", href: "/calendar", icon: "calendar_month" },
    { label: "Workspaces", isDrawer: true, icon: "hub" },
  ];

  const isAnyWorkspaceActive = WORKSPACES.some((w) => pathname.startsWith(w.route));

  return (
    <>
      {/* Persistent Bottom Bar */}
      <nav
        className={cn(
          "lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-low/95 backdrop-blur-xl border-t border-outline-variant/20 z-40 flex items-center justify-around px-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.35)]",
          className
        )}
        role="navigation"
        aria-label="Mobile Navigation"
      >
        {mainTabs.map((tab, idx) => {
          if (tab.isAction) {
            return (
              <div key="action-center" className="flex items-center justify-center -mt-5">
                <button
                  type="button"
                  onClick={onOpenQuickTask}
                  aria-label="Quick Add Task"
                  className="w-12 h-12 rounded-full bg-primary-container text-white flex items-center justify-center shadow-[0_4px_16px_rgba(79,70,229,0.5)] hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-primary-container"
                >
                  <Icon name="add" size={26} />
                </button>
              </div>
            );
          }

          if (tab.isDrawer) {
            return (
              <button
                key="workspaces-drawer"
                type="button"
                onClick={() => setIsWorkspacesDrawerOpen(true)}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[56px] h-12 transition-colors",
                  isAnyWorkspaceActive ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                <Icon name={tab.icon} size={22} fill={isAnyWorkspaceActive} />
                <span className="text-[10px] mt-0.5 font-medium tracking-tight">Workspaces</span>
              </button>
            );
          }

          const isActive = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href!));

          return (
            <Link
              key={idx}
              href={tab.href!}
              className={cn(
                "flex flex-col items-center justify-center min-w-[56px] h-12 transition-colors",
                isActive ? "text-primary font-semibold" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <Icon name={tab.icon} size={22} fill={isActive} />
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile Workspaces Sheet Drawer */}
      {isWorkspacesDrawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end"
          onClick={() => setIsWorkspacesDrawerOpen(false)}
        >
          <div
            className="w-full bg-surface-container-low rounded-t-2xl border-t border-outline-variant/30 p-space-md pb-8 shadow-2xl animate-in slide-in-from-bottom-5 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle */}
            <div className="w-10 h-1 rounded-full bg-surface-container-highest mx-auto mb-4" />

            <div className="flex items-center justify-between mb-4 px-1">
              <span className="text-sm font-bold font-headline text-on-surface">
                Select Workspace
              </span>
              <button
                type="button"
                onClick={() => setIsWorkspacesDrawerOpen(false)}
                className="p-1 text-on-surface-variant hover:text-on-surface"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {WORKSPACES.map((w) => (
                <Link
                  key={w.id}
                  href={w.route}
                  onClick={() => setIsWorkspacesDrawerOpen(false)}
                  className="p-3 rounded-xl bg-surface-container border border-outline-variant/15 flex items-center gap-2.5 active:bg-surface-container-high transition-colors"
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: w.color }}
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-on-surface block truncate">
                      {w.title}
                    </span>
                    <span className="text-[10px] text-outline font-mono block">
                      {w.metaBadge}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
