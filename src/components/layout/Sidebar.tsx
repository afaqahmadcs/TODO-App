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
                <div className="flex items-center gap-1.5">
                  <span className="font-headline text-sm font-bold text-on-surface tracking-tight truncate">
                    Afaq TaskFlow
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-primary-container text-on-primary-container font-mono text-[10px] font-semibold uppercase leading-none">
                    PRO
                  </span>
                </div>
                <span className="text-[11px] text-on-surface-variant font-medium">
                  Workspace Engine
                </span>
              </div>
            )}
          </Link>

          {/* Desktop/Tablet Collapse Toggle */}
          {!isCollapsed && onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Collapse Sidebar"
              className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors hidden lg:flex"
            >
              <Icon name="chevron_left" size={18} />
            </button>
          )}
        </div>

        {/* Section 1: Overview & Views */}
        <div className="space-y-1 mb-5">
          {!isCollapsed && (
            <div className="px-space-sm py-1 font-mono text-[11px] text-outline uppercase tracking-wider font-semibold">
              Overview & Views
            </div>
          )}
          <nav className="space-y-0.5">
            {MAIN_NAV_ITEMS.map((item) => (
              <NavigationItem
                key={item.id}
                label={item.label}
                href={item.href}
                icon={item.icon}
                badge={item.badge}
                isCollapsed={isCollapsed}
              />
            ))}
          </nav>
        </div>

        <div className="h-px bg-surface-container-highest mx-space-sm my-2" />

        {/* Section 2: Workspaces */}
        <div className="mb-5">
          <WorkspaceNavigation isCollapsed={isCollapsed} />
        </div>

        <div className="h-px bg-surface-container-highest mx-space-sm my-2" />

        {/* Section 3: Workspace Tools */}
        <div className="space-y-1">
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
        <Link
          href="/settings"
          title={isCollapsed ? "Afaq Ahmad (Settings)" : undefined}
          className={cn(
            "flex items-center rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors group focus:outline-none focus:ring-2 focus:ring-primary-container/40",
            isCollapsed ? "p-2 justify-center" : "p-2.5 justify-between"
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar size="sm" src="/assets/avatar.png" statusDot="online" />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
                  Afaq Ahmad
                </span>
                <span className="text-[10px] text-on-surface-variant truncate">
                  Pro Creator
                </span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <span className="p-1 rounded text-outline group-hover:text-on-surface flex items-center">
              <Icon name="settings" size={18} />
            </span>
          )}
        </Link>

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
