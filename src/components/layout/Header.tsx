"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<AuthUserProfile | null>(null);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

  // Close account menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setIsAccountMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsAccountMenuOpen(false);
    await authService.signOut();
    router.push("/login");
  };

  // Page title mapping based on current active route
  const getPageTitleInfo = () => {
    if (pathname.startsWith("/admin")) {
      return { section: "System", title: "Admin Console", subtitle: "(Account Management & Telemetry)" };
    }
    if (pathname.startsWith("/office")) {
      return { section: "Workspace", title: "Office", subtitle: "(Social Media & Visual Production)" };
    }
    if (pathname.startsWith("/personal")) {
      return { section: "Workspace", title: "Personal", subtitle: "(Habits, Health & Routines)" };
    }
    if (pathname.startsWith("/college")) {
      return { section: "Workspace", title: "College", subtitle: "(BS Computer Science)" };
    }
    if (pathname.startsWith("/web-development")) {
      return { section: "Workspace", title: "Web Development", subtitle: "(Fullstack Engineering)" };
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
          aria-label="Search tasks, projects, notes, and workspaces (⌘K)"
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-surface-container border border-outline-variant/20 text-on-surface-variant hover:text-on-surface hover:border-outline-variant/40 transition-all text-xs group"
        >
          <div className="flex items-center gap-2">
            <Icon
              name="search"
              size={16}
              className="text-outline group-hover:text-primary transition-colors"
            />
            <span className="text-outline/80 group-hover:text-on-surface-variant">
              Quick search anywhere...
            </span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px] text-outline bg-surface-container-highest/60 px-1.5 py-0.5 rounded border border-outline-variant/15">
            <span>⌘</span>
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right Header Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Mobile Search Button */}
        <button
          type="button"
          onClick={onOpenSearch}
          aria-label="Open Search"
          className="md:hidden p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <Icon name="search" size={20} />
        </button>

        {/* Focus Mode Quick Action */}
        <button
          type="button"
          onClick={onOpenFocusMode}
          aria-label="Launch Precision Focus Session"
          title="Precision Focus Session (Pomodoro)"
          className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-secondary transition-colors relative"
        >
          <Icon name="timer" size={20} />
        </button>

        {/* Notifications Icon with Unread Badge */}
        <button
          type="button"
          onClick={onOpenNotifications}
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
          title="Notifications"
          className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors relative"
        >
          <Icon name="notifications" size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-primary-container text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-surface animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
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

        {/* User Profile Avatar with Account Dropdown */}
        <div className="relative ml-1 shrink-0" ref={accountMenuRef}>
          <button
            type="button"
            onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
            aria-label={`Account Menu (${userProfile?.name || "User"})`}
            aria-expanded={isAccountMenuOpen}
            className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary-container transition-transform active:scale-95"
            title={userProfile ? `${userProfile.name} (@${userProfile.username || "user"})` : "Account Menu"}
          >
            <Avatar
              size="sm"
              src={userProfile?.avatarUrl}
              name={userProfile?.name || "User"}
              alt={userProfile?.name || "User"}
              statusDot="online"
            />
          </button>

          {/* Account Menu Dropdown */}
          {isAccountMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-surface-container-low border border-outline-variant/25 shadow-2xl p-2.5 space-y-2 z-50 animate-in fade-in-50 backdrop-blur-xl">
              {/* User Identity Header */}
              <div className="p-2.5 rounded-xl bg-surface-container flex items-center gap-3">
                <Avatar
                  size="md"
                  src={userProfile?.avatarUrl}
                  name={userProfile?.name || "User"}
                  alt={userProfile?.name || "User"}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-on-surface truncate block">
                      {userProfile?.name || "User"}
                    </span>
                    {userProfile?.role === "admin" && (
                      <span className="px-1.5 py-0.2 rounded bg-primary-container/20 text-primary text-[9px] font-mono font-semibold">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-outline truncate block">
                    {userProfile?.email || "user@taskflow.dev"}
                  </span>
                </div>
              </div>

              {/* Menu Links */}
              <div className="space-y-0.5 pt-1 text-xs">
                <Link
                  href="/profile"
                  onClick={() => setIsAccountMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                >
                  <Icon name="person" size={16} className="text-primary" />
                  <span>Profile & Socials</span>
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setIsAccountMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                >
                  <Icon name="tune" size={16} className="text-secondary" />
                  <span>Settings & Preferences</span>
                </Link>

                {userProfile?.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-primary hover:bg-primary-container/15 transition-colors font-medium"
                  >
                    <Icon name="shield" size={16} className="text-primary" />
                    <span>Admin Console</span>
                  </Link>
                )}
              </div>

              {/* Sign Out Action */}
              <div className="pt-1 border-t border-outline-variant/15">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-xs font-medium"
                >
                  <Icon name="logout" size={16} className="text-rose-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
