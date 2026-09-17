"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNavigation } from "./MobileNavigation";
import { QuickTaskModal } from "@/components/tasks/QuickTaskModal";
import { FocusModeModal } from "@/components/focus/FocusModeModal";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { TaskDetailDrawer } from "@/components/tasks/TaskDetailDrawer";
import { GlobalSearchModal } from "@/components/search/GlobalSearchModal";
import { taskService } from "@/services/taskService";
import { notificationService } from "@/services/notificationService";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { Task } from "@/types/task";
import { cn } from "@/lib/utils";

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isQuickTaskOpen, setIsQuickTaskOpen] = useState(false);
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [inspectedTask, setInspectedTask] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Global keyboard shortcuts:
  // N = Quick Task
  useKeyboardShortcut({ key: "n" }, () => {
    setIsQuickTaskOpen(true);
  });

  // / = Global Search
  useKeyboardShortcut({ key: "/" }, () => {
    setIsSearchOpen(true);
  });

  // ⌘K = Global Search
  useKeyboardShortcut({ key: "k", ctrlOrCmd: true }, () => {
    setIsSearchOpen((prev) => !prev);
  });

  // F = Focus Mode
  useKeyboardShortcut({ key: "f" }, () => {
    setIsFocusModeOpen(true);
  });

  // Escape = Close any active modal / panel
  useKeyboardShortcut({ key: "Escape" }, () => {
    if (isSearchOpen) {
      setIsSearchOpen(false);
    } else if (isQuickTaskOpen) {
      setIsQuickTaskOpen(false);
    } else if (isFocusModeOpen) {
      setIsFocusModeOpen(false);
      setFocusTask(null);
    } else if (isNotificationsOpen) {
      setIsNotificationsOpen(false);
    } else if (isDrawerOpen) {
      setIsDrawerOpen(false);
      setInspectedTask(null);
    }
  });

  // Subscribe to live notification updates and sync reminders on mount
  useEffect(() => {
    let mounted = true;
    const unsubscribe = notificationService.subscribe((list) => {
      if (mounted) {
        setUnreadCount(list.filter((n) => !n.read).length);
      }
    });

    taskService.getTasks().then((tasks) => {
      if (mounted) {
        notificationService.syncTaskReminders(tasks);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Handle task selection from notification deep-link
  const handleSelectTaskFromNotification = async (taskId: string) => {
    const task = await taskService.getTaskById(taskId);
    if (task) {
      setInspectedTask(task);
      setIsDrawerOpen(true);
    }
  };

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
        onOpenFocusMode={() => setIsFocusModeOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        unreadCount={unreadCount}
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

      {/* Universal Global Search Command Palette */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTask={handleSelectTaskFromNotification}
      />

      {/* Global Universal Quick Task Creation Modal */}
      <QuickTaskModal
        isOpen={isQuickTaskOpen}
        onClose={() => setIsQuickTaskOpen(false)}
        onTaskCreated={(task) => {
          console.log("New task created via AppShell:", task);
        }}
      />

      {/* Focus Mode Immersive Modal */}
      <FocusModeModal
        isOpen={isFocusModeOpen}
        onClose={() => {
          setIsFocusModeOpen(false);
          setFocusTask(null);
        }}
        initialTask={focusTask}
        onTaskCompleted={() => {
          setIsFocusModeOpen(false);
          setFocusTask(null);
        }}
      />

      {/* Slide-Over Notification Center */}
      <NotificationCenter
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onSelectTask={handleSelectTaskFromNotification}
      />

      {/* Deep-Linked Task Detail Drawer */}
      {inspectedTask && (
        <TaskDetailDrawer
          task={inspectedTask}
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setInspectedTask(null);
          }}
          onTaskUpdated={(updated) => {
            setInspectedTask(updated);
          }}
          onTaskDeleted={() => {
            setIsDrawerOpen(false);
            setInspectedTask(null);
          }}
          onStartFocus={(t) => {
            setFocusTask(t);
            setIsDrawerOpen(false);
            setIsFocusModeOpen(true);
          }}
        />
      )}
    </div>
  );
};
