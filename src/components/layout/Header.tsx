"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import { authService, AuthUserProfile } from "@/services/authService";

export interface HeaderProps {
  isSidebarCollapsed?: boolean;
  onOpenQuickTask?: () => void;
  onOpenFocusMode?: () => void;
  onOpenNotifications?: () => void;
  onOpenSearch?: () => void;
  unreadCount?: number;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  isSidebarCollapsed = false,
  onOpenQuickTask,
  onOpenFocusMode,
  onOpenNotifications,
  onOpenSearch,
  unreadCount = 0,
  className,
}) => {
  const pathname = usePathname();
  const [userProfile, setUserProfile] = React.useState<AuthUserProfile | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    authService.getProfile().then((user) => {
      if (isMounted && user) {
        setUserProfile(user);
      }
    });

    const unsubscribeProfile = authService.onProfileChange((p) => {
      if (isMounted) {
        setUserProfile(p);
      }
    });

    const subscription = authService.onAuthStateChange(() => {
      authService.getProfile().then((user) => {
        if (isMounted) {
          setUserProfile(user);
        }
      });
    });

    return () => {
      isMounted = false;
      unsubscribeProfile();
      if (subscription && typeof subscription.unsubscribe === "function") {
        subscription.unsubscribe();
      }
    };
  }, []);

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
    if (pathname.startsWith("/profile")) {
      return { section: "Account", title: "User Profile", subtitle: "(Creator Identity & Socials)" };
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

      {/* Center Search Trigger with ⌘K or / */}
      <div className="flex-1 max-w-md mx-3 sm:mx-6 hidden md:block">
        <button
          type="button"
          onClick={onOpenSearch}
          aria-label="Open Global Search (/ or ⌘K)"
          className="w-full h-9 px-3 bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-outline-variant/30 hover:border-primary/40 rounded-lg text-xs transition-all flex items-center justify-between shadow-sm group cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Icon name="search" size={17} className="text-secondary group-hover:text-primary transition-colors" />
            <span className="text-outline group-hover:text-on-surface-variant truncate">
              Search tasks, projects, pages, notes, vlogs...
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <kbd className="font-mono text-[10px] text-outline bg-surface-container-highest px-1.5 py-0.5 rounded border border-outline-variant/20">
              /
            </kbd>
            <kbd className="font-mono text-[10px] text-outline bg-surface-container-highest px-1.5 py-0.5 rounded border border-outline-variant/20">
              ⌘K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right Controls: Search (Mobile), Focus Mode, Notification, Quick Add Task, Profile Avatar */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Mobile Search Button */}
        <button
          type="button"
          onClick={onOpenSearch}
          aria-label="Global Search (/)"
          className="md:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-container/40"
          title="Global Search (/)"
        >
          <Icon name="search" size={20} />
        </button>

        {/* Focus Mode Button */}
        <button
          type="button"
          onClick={onOpenFocusMode}
          aria-label="Focus Mode (Press F)"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-all border border-outline-variant/15"
          title="Start Focus Mode (F)"
        >
          <Icon name="bolt" size={18} className="text-secondary" />
          <span className="hidden md:inline">Focus</span>
          <kbd className="hidden md:inline-block px-1 py-0.2 rounded bg-surface-container-highest text-[10px] font-mono text-outline">
            F
          </kbd>
        </button>

        {/* Notification Bell */}
        <button
          type="button"
          onClick={onOpenNotifications}
          aria-label={`Notifications (${unreadCount} unread)`}
          className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-container/40"
          title="Notifications"
        >
          <Icon name="notifications" size={20} />
          {unreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-mono font-bold rounded-full flex items-center justify-center ring-2 ring-surface animate-in zoom-in-50">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-surface" />
          )}
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
          href="/profile"
          aria-label={`Profile (${userProfile?.name || "Afaq Ahmad"})`}
          className="ml-1 shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-container"
          title={userProfile ? `${userProfile.name} (@${userProfile.username || "afaqahmad"})` : "User Profile"}
        >
          <Avatar
            size="sm"
            src={userProfile?.avatarUrl || "/assets/avatar.png"}
            alt={userProfile?.name || "Afaq Ahmad"}
            statusDot="online"
          />
        </Link>
      </div>
    </header>
  );
};
