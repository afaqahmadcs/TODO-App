"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

export interface HeaderProps {
  isSidebarCollapsed?: boolean;
  onOpenQuickTask?: () => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  isSidebarCollapsed = false,
  onOpenQuickTask,
  className,
}) => {
  const pathname = usePathname();

  // Page title mapping based on current active route
  const getPageTitleInfo = () => {
    if (pathname.startsWith("/office")) {
      return { section: "Workspace", title: "Office", subtitle: "(Social Media & Visual Production)" };
    }
    if (pathname.startsWith("/personal")) {
      return { section: "Workspace", title: "Personal", subtitle: "(Vlog & Creator Suite)" };
    }
    if (pathname.startsWith("/college")) {
      return { section: "Workspace", title: "College", subtitle: "(Academics & Modules)" };
    }
    if (pathname.startsWith("/web-development")) {
      return { section: "Workspace", title: "Web Development", subtitle: "(Fullstack & Systems)" };
    }
    if (pathname.startsWith("/tasks")) {
      return { section: "Overview", title: "My Tasks", subtitle: "" };
    }
    if (pathname.startsWith("/calendar")) {
      return { section: "Overview", title: "Productivity Calendar", subtitle: "" };
    }
    if (pathname.startsWith("/recurring")) {
      return { section: "Overview", title: "Recurring Automations", subtitle: "" };
    }
    if (pathname.startsWith("/analytics")) {
      return { section: "Overview", title: "Analytics & Telemetry", subtitle: "" };
    }
    if (pathname.startsWith("/projects")) {
      return { section: "Tools", title: "Projects & Sprints", subtitle: "" };
    }
    if (pathname.startsWith("/notes")) {
      return { section: "Tools", title: "Notes & Docs", subtitle: "" };
    }
    if (pathname.startsWith("/settings")) {
      return { section: "System", title: "Settings & Preferences", subtitle: "" };
    }
    return { section: "Workspace", title: "Overview", subtitle: "Dashboard" };
  };

  const titleInfo = getPageTitleInfo();

  return (
    <header
      className={cn(
        "fixed top-0 right-0 h-16 bg-surface/85 backdrop-blur-xl z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-outline-variant/15 shadow-[0_1px_8px_rgba(0,0,0,0.18)] transition-all duration-200",
        isSidebarCollapsed ? "left-0 md:left-18" : "left-0 md:left-18 lg:left-64",
        className
      )}
    >
      {/* Current Page Title & Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium">
          <span className="text-on-surface-variant hidden sm:inline">
            {titleInfo.section}
          </span>
          <span className="text-outline hidden sm:inline">
            <Icon name="chevron_right" size={16} />
          </span>
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-surface-container-high">
            <span className="w-2 h-2 rounded-full bg-primary-container" />
            <span className="font-semibold text-on-surface truncate">
              {titleInfo.title}
            </span>
            {titleInfo.subtitle && (
              <span className="hidden xl:inline text-xs text-on-surface-variant font-normal">
                {titleInfo.subtitle}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Center Search Input with ⌘K */}
      <div className="flex-1 max-w-md mx-3 sm:mx-6 hidden md:block">
        <div className="relative flex items-center">
          <span className="absolute left-3 text-outline pointer-events-none flex items-center">
            <Icon name="search" size={18} />
          </span>
          <input
            type="text"
            placeholder="Search tasks, docs, projects..."
            className="w-full h-9 pl-9 pr-14 bg-surface-container-low text-on-surface placeholder:text-outline border border-outline-variant/30 rounded-lg text-xs transition-colors focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <div className="absolute right-2.5 flex items-center gap-0.5 pointer-events-none">
            <kbd className="font-mono text-[10px] text-outline bg-surface-container-highest px-1.5 py-0.5 rounded border border-outline-variant/20">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Controls: Notification, Quick Add Task, Profile Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification Bell */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-container/40"
        >
          <Icon name="notifications" size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full ring-2 ring-surface" />
        </button>

        {/* Quick Add Task Button */}
        <Button
          onClick={onOpenQuickTask}
          size="sm"
          icon="add"
          shortcut="N"
          className="hidden sm:inline-flex"
        >
          Add Task
        </Button>

        {/* Mobile Quick Add Icon */}
        <button
          type="button"
          onClick={onOpenQuickTask}
          aria-label="Quick Add Task"
          className="sm:hidden p-2 rounded-lg bg-primary-container text-white flex items-center justify-center shadow-sm active:scale-95"
        >
          <Icon name="add" size={20} />
        </button>

        {/* User Profile Avatar */}
        <Link
          href="/settings"
          aria-label="Go to Settings"
          className="ml-1 shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-container"
        >
          <Avatar size="sm" src="/assets/avatar.png" statusDot="online" />
        </Link>
      </div>
    </header>
  );
};
