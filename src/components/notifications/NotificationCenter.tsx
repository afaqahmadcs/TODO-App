"use client";

import React, { useState, useEffect, useRef } from "react";
import { NotificationItem } from "@/types/notification";
import { notificationService } from "@/services/notificationService";
import { Icon } from "@/components/ui/Icon";

export interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTask?: (taskId: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  onSelectTask,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<"unread" | "read" | "all">("unread");
  const [permissionState, setPermissionState] = useState<NotificationPermission>(() =>
    typeof window !== "undefined" ? notificationService.getPermissionState() : "default"
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Subscribe to live notifications
  useEffect(() => {
    const unsubscribe = notificationService.subscribe(setNotifications);
    return unsubscribe;
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter list by active tab
  const unreadList = notifications.filter((n) => !n.read);
  const readList = notifications.filter((n) => n.read);
  const displayedList =
    activeTab === "unread" ? unreadList : activeTab === "read" ? readList : notifications;

  const handleRequestPermission = async () => {
    const res = await notificationService.requestPermission();
    setPermissionState(res);
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.read) {
      await notificationService.markAsRead(notif.id);
    }
    if (notif.taskId && onSelectTask) {
      onSelectTask(notif.taskId);
      onClose();
    }
  };

  // Pure time formatter for notifications
  const formatNotificationTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "deadline":
        return { name: "hourglass_top", color: "text-rose-400 bg-rose-500/15" };
      case "streak":
        return { name: "local_fire_department", color: "text-amber-400 bg-amber-500/15" };
      case "system":
        return { name: "bolt", color: "text-primary bg-primary-container/20" };
      default:
        return { name: "schedule", color: "text-secondary bg-secondary/15" };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        ref={containerRef}
        className="w-full max-w-md bg-surface-container-low h-full shadow-2xl border-l border-outline-variant/20 flex flex-col justify-between animate-in slide-in-from-right duration-200"
        role="region"
        aria-label="Notification Center"
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-outline-variant/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Icon name="notifications" size={20} className="text-secondary" />
            <h2 className="font-headline text-base font-bold text-on-surface">
              Notification Center
            </h2>
            {unreadList.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-xs font-mono font-semibold">
                {unreadList.length} unread
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadList.length > 0 && (
              <button
                type="button"
                onClick={() => notificationService.markAllAsRead()}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors ml-1"
              title="Close (ESC)"
            >
              <Icon name="close" size={18} />
            </button>
          </div>
        </div>

        {/* Browser Permission Prompt Banner */}
        {permissionState !== "granted" && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-primary-container/15 border border-primary-container/30 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-on-surface">
              <Icon name="notifications_active" size={18} className="text-primary shrink-0" />
              <span>Enable browser notifications for live overdue & timer chimes</span>
            </div>
            <button
              type="button"
              onClick={handleRequestPermission}
              className="px-3 py-1 rounded-lg bg-primary-container text-white font-semibold shrink-0 hover:bg-primary-container/90 transition-colors"
            >
              Enable
            </button>
          </div>
        )}

        {/* Filter Tabs: Unread, Read, All */}
        <div className="px-4 pt-3 flex items-center gap-2 border-b border-outline-variant/10">
          <button
            type="button"
            onClick={() => setActiveTab("unread")}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "unread"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span>Unread</span>
            <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-[10px] font-mono">
              {unreadList.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("read")}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "read"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span>Read</span>
            <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-[10px] font-mono">
              {readList.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "all"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span>All Alerts</span>
            <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-[10px] font-mono">
              {notifications.length}
            </span>
          </button>
        </div>

        {/* Notifications Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-outline-variant/10">
          {displayedList.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center mx-auto">
                <Icon name="done_all" size={24} />
              </div>
              <p className="font-headline text-sm font-bold text-on-surface">
                {activeTab === "unread" ? "All Caught Up!" : "No notifications found"}
              </p>
              <p className="text-xs text-outline max-w-xs mx-auto">
                {activeTab === "unread"
                  ? "Zero unread alerts. Your schedule, recurring routines, and deliverables are fully synchronized."
                  : "Notifications will appear here as tasks approach deadlines or recurring routines trigger."}
              </p>
            </div>
          ) : (
            displayedList.map((item) => {
              const iconMeta = getTypeIcon(item.type);
              return (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`pt-2.5 first:pt-0 group flex items-start justify-between gap-3 p-3 rounded-xl transition-all cursor-pointer border ${
                    item.read
                      ? "bg-surface-container-low hover:bg-surface-container border-transparent"
                      : "bg-surface-container hover:bg-surface-container-high border-outline-variant/20 shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${iconMeta.color}`}
                    >
                      <Icon name={iconMeta.name} size={18} />
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-semibold line-clamp-1 group-hover:text-primary transition-colors ${
                            item.read ? "text-on-surface-variant" : "text-on-surface font-bold"
                          }`}
                        >
                          {item.title}
                        </span>
                        {!item.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                        )}
                      </div>

                      <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>

                      <div className="flex items-center gap-2 pt-1 text-[11px] text-outline font-mono">
                        <span>{formatNotificationTime(item.createdAt)}</span>
                        {item.taskId && (
                          <span className="text-secondary flex items-center gap-0.5">
                            <Icon name="link" size={12} /> Click to open task
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Mark read / Delete */}
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!item.read && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          notificationService.markAsRead(item.id);
                        }}
                        className="p-1 rounded hover:bg-surface-container-highest text-outline hover:text-secondary"
                        title="Mark as read"
                      >
                        <Icon name="check" size={16} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        notificationService.deleteNotification(item.id);
                      }}
                      className="p-1 rounded hover:bg-rose-500/20 text-outline hover:text-rose-400"
                      title="Delete"
                    >
                      <Icon name="delete" size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-surface-container border-t border-outline-variant/10 text-center text-[11px] text-outline font-mono">
          <span>Timezone: Asia/Karachi (UTC+5) • Anti-Spam Active</span>
        </div>
      </div>
    </div>
  );
};
