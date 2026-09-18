"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MAIN_NAV_ITEMS, WORKSPACE_TOOLS } from "@/lib/constants";
import { NavigationItem } from "./NavigationItem";
import { WorkspaceNavigation } from "./WorkspaceNavigation";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { authService, AuthUserProfile } from "@/services/authService";
import { taskService } from "@/services/taskService";

export interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  className,
}) => {
  const [userProfile, setUserProfile] = React.useState<AuthUserProfile | null>(null);
  const [pendingCount, setPendingCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    authService.getProfile().then(setUserProfile);
    const unsub = authService.onProfileChange((p) => {
      setUserProfile(p);
    });

    taskService.getTasks().then((tasks) => {
      const pending = tasks.filter((t) => !t.isCompleted && t.status !== "completed");
      setPendingCount(pending.length);
    });

    return () => {
      unsub();
    };
  }, []);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-surface-container-low z-40 hidden md:flex flex-col justify-between border-r border-outline-variant/20 shadow-[0_1px_8px_rgba(0,0,0,0.25)] transition-all duration-200",
        isCollapsed ? "w-18" : "w-64",
        className
      )}
    >
      {/* Top Brand Header & Navigation Stream */}
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto px-space-sm pt-4 pb-2">
        {/* Brand Monogram & Title */}
        <div
          className={cn(
            "flex items-center gap-2.5 px-space-xs mb-6",
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <Image
              src="/assets/logo.svg"
              alt="Afaq TaskFlow Logo"
              width={32}
              height={32}
              className="h-8 w-auto object-contain shrink-0"
              priority
            />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-headline font-bold text-sm text-on-surface tracking-tight truncate">
                  Afaq TaskFlow
                </span>
                <span className="text-[10px] text-outline font-mono uppercase tracking-wider">
                  Productivity OS
                </span>
              </div>
            )}
          </Link>

          {/* Collapse Button (Only on large screens) */}
          {!isCollapsed && onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Collapse Sidebar"
              className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <Icon name="chevron_left" size={18} />
            </button>
          )}
        </div>

        {/* Section 1: Main Overview Navigation */}
        <div className="space-y-1 mb-6">
          {!isCollapsed && (
            <div className="px-space-sm py-1 font-mono text-[11px] text-outline uppercase tracking-wider font-semibold">
              Overview
            </div>
          )}
          <nav className="space-y-0.5">
            {MAIN_NAV_ITEMS.map((item) => {
              const badge =
                item.href === "/tasks" && pendingCount !== null && pendingCount > 0
                  ? String(pendingCount)
                  : undefined;
              return (
                <NavigationItem
                  key={item.id}
                  label={item.label}
                  href={item.href}
                  icon={item.icon}
                  badge={badge}
                  isCollapsed={isCollapsed}
                />
              );
            })}
          </nav>
        </div>

        {/* Section 2: Workspaces List */}
        <div className="space-y-1 mb-6">
          <WorkspaceNavigation isCollapsed={isCollapsed} />
        </div>

        {/* Section 3: Workspace Tools */}
        <div className="space-y-1 mb-6">
          {!isCollapsed && (
            <div className="px-space-sm py-1 font-mono text-[11px] text-outline uppercase tracking-wider font-semibold">
              Workspace Tools
            </div>
          )}
          <nav className="space-y-0.5">
            {WORKSPACE_TOOLS.map((tool) => (
              <NavigationItem
                key={tool.id}
                label={tool.label}
                href={tool.href}
                icon={tool.icon}
                isCollapsed={isCollapsed}
              />
            ))}
          </nav>
        </div>

        {/* Section 4: Admin Console (Only visible if user has admin role) */}
        {userProfile?.role === "admin" && (
          <div className="space-y-1 mb-4">
            {!isCollapsed && (
              <div className="px-space-sm py-1 font-mono text-[11px] text-primary uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Administration
              </div>
            )}
            <nav className="space-y-0.5">
              <NavigationItem
                label="Admin Console"
                href="/admin"
                icon="shield"
                isCollapsed={isCollapsed}
              />
            </nav>
          </div>
        )}
      </div>

      {/* Footer Profile & Settings Container */}
      <div className="p-space-sm bg-surface-container-low border-t border-outline-variant/15 space-y-2">
        {/* Quick Palette Chip (When Expanded) */}
        {!isCollapsed && (
          <div className="flex items-center justify-between px-space-sm py-1.5 rounded-lg bg-surface-container font-mono text-xs text-on-surface-variant">
            <span>Quick Palette</span>
            <kbd className="px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface text-[10px] border border-outline-variant/20">
              ⌘K
            </kbd>
          </div>
        )}

        {/* User Profile / Settings Row */}
        <div
          className={cn(
            "flex items-center rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors group p-1.5",
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          <Link
            href="/profile"
            title={isCollapsed ? `${userProfile?.name || "User"} (Profile)` : undefined}
            className="flex items-center gap-2.5 min-w-0 flex-1 p-1 rounded-lg hover:bg-surface-container-highest/60 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container/40"
          >
            <Avatar
              size="sm"
              src={userProfile?.avatarUrl}
              name={userProfile?.name || "User"}
              alt={userProfile?.name || "User"}
              statusDot="online"
            />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 text-left">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
                    {userProfile?.name || "User"}
                  </span>
                  {userProfile?.role === "admin" && (
                    <span className="text-[9px] font-mono text-primary font-bold px-1 rounded bg-primary-container/20">
                      ADM
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-on-surface-variant truncate">
                  @{userProfile?.username || "user"}
                </span>
              </div>
            )}
          </Link>
          {!isCollapsed && (
            <Link
              href="/settings"
              title="Settings"
              className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-highest flex items-center transition-colors"
            >
              <Icon name="settings" size={17} />
            </Link>
          )}
        </div>

        {/* Expand trigger when collapsed */}
        {isCollapsed && onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Expand Sidebar"
            className="w-full py-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container flex items-center justify-center transition-colors"
          >
            <Icon name="chevron_right" size={18} />
          </button>
        )}
      </div>
    </aside>
  );
};
