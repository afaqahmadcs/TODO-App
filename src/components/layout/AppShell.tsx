"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNavigation } from "./MobileNavigation";
import { QuickTaskModal } from "@/components/tasks/QuickTaskModal";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { cn } from "@/lib/utils";

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isQuickTaskOpen, setIsQuickTaskOpen] = useState(false);

  // Global keyboard shortcuts
  useKeyboardShortcut({ key: "n" }, () => {
    setIsQuickTaskOpen(true);
  });

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans selection:bg-primary-container selection:text-white">
      {/* Desktop & Tablet Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Top Header */}
      <Header
        isSidebarCollapsed={isSidebarCollapsed}
        onOpenQuickTask={() => setIsQuickTaskOpen(true)}
      />

      {/* Dynamic Content Viewport */}
      <div
        className={cn(
          "flex-1 flex flex-col pt-16 pb-20 lg:pb-8 transition-all duration-200",
          isSidebarCollapsed ? "pl-0 md:pl-18" : "pl-0 md:pl-18 lg:pl-64"
        )}
      >
        <main className="flex-1 w-full">{children}</main>
      </div>

      {/* Mobile Fixed Bottom Navigation */}
      <MobileNavigation onOpenQuickTask={() => setIsQuickTaskOpen(true)} />

      {/* Global Universal Quick Task Creation Modal */}
      <QuickTaskModal
        isOpen={isQuickTaskOpen}
        onClose={() => setIsQuickTaskOpen(false)}
        onTaskCreated={(task) => {
          console.log("New task created via AppShell:", task);
        }}
      />
    </div>
  );
};
