import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Task } from "@/types/task";
import { NotificationItem, NotificationType } from "@/types/notification";

const LOCAL_STORAGE_NOTIFICATIONS_KEY = "afaq_taskflow_notifications";
const LOCAL_STORAGE_NOTIFIED_KEYS = "afaq_taskflow_notified_keys";

// Initial realistic notifications matching Google Stitch design
const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    userId: "user-afaq",
    taskId: "task-7",
    type: "deadline",
    title: "Overdue: Finalize TikTok & IG Reels Calendar",
    message: "High-priority deliverable was scheduled for yesterday 02:30 PM. Action required.",
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    workspaceId: "office",
    priority: "high",
  },
  {
    id: "notif-2",
    userId: "user-afaq",
    taskId: "task-1",
    type: "reminder",
    title: "Upcoming: Behind-the-scenes B-roll for ZK Production",
    message: "Scheduled for today at 3:00 PM. Clean 24-70mm lens and format SD cards.",
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    workspaceId: "office",
    priority: "high",
  },
  {
    id: "notif-3",
    userId: "user-afaq",
    taskId: "task-rec-shooting",
    type: "reminder",
    title: "Recurring Routine: Daily Shooting Page Management",
    message: "Monday-Friday 1:15 PM routine active. Verify today's content checklist.",
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    workspaceId: "office",
    priority: "medium",
  },
  {
    id: "notif-4",
    userId: "user-afaq",
    taskId: "task-college-assign-2",
    type: "reminder",
    title: "Upcoming: College Coursework Assignment",
    message: "Review lecture notes and complete assignment exercises on schedule.",
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    workspaceId: "college",
    priority: "medium",
  },
  {
    id: "notif-5",
    userId: "user-afaq",
    type: "streak",
    title: "14-Day Creator Streak Maintained!",
    message: "Continuous daily multi-workspace velocity active across Office, Personal, College, and Web Dev.",
    read: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

let cachedNotifications: NotificationItem[] = [...INITIAL_NOTIFICATIONS];
let listeners: Array<(notifications: NotificationItem[]) => void> = [];

function notifyListeners() {
  const list = [...cachedNotifications];
  listeners.forEach((listener) => {
    try {
      listener(list);
    } catch (err) {
      console.error("[notificationService] Error in listener:", err);
    }
  });
}

const inMemoryNotifiedKeys = new Set<string>();

function getStoredNotifiedKeys(): Set<string> {
  if (typeof window === "undefined") return inMemoryNotifiedKeys;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_NOTIFIED_KEYS);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

function saveStoredNotifiedKey(key: string) {
  if (typeof window === "undefined") {
    inMemoryNotifiedKeys.add(key);
    return;
  }
  try {
    const keys = getStoredNotifiedKeys();
    keys.add(key);
    localStorage.setItem(LOCAL_STORAGE_NOTIFIED_KEYS, JSON.stringify(Array.from(keys)));
  } catch {}
}

export const notificationService = {
  /**
   * Subscribe to live notification updates
   */
  subscribe: (callback: (notifications: NotificationItem[]) => void): (() => void) => {
    listeners.push(callback);
    callback([...cachedNotifications]);
    return () => {
      listeners = listeners.filter((l) => l !== callback);
    };
  },

  /**
   * Fetch all notifications (from Supabase or local cache)
   */
  getNotifications: async (): Promise<NotificationItem[]> => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          cachedNotifications = data.map((row) => ({
            id: row.id,
            userId: row.user_id,
            taskId: row.task_id || undefined,
            type: (row.type as NotificationType) || "system",
            title: row.title,
            message: row.message,
            scheduledFor: row.scheduled_for || undefined,
            read: row.read,
            createdAt: row.created_at,
          }));
          return [...cachedNotifications];
        }
      } catch (err) {
        console.warn("[notificationService] Supabase fetch failed, using local cache:", err);
      }
    }

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_NOTIFICATIONS_KEY);
        if (stored) {
          cachedNotifications = JSON.parse(stored);
        }
      } catch {}
    }

    return [...cachedNotifications];
  },

  /**
   * Mark a single notification as read
   */
  markAsRead: async (id: string): Promise<void> => {
    cachedNotifications = cachedNotifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );

    if (isSupabaseConfigured()) {
      try {
        await supabase.from("notifications").update({ read: true }).eq("id", id);
      } catch (err) {
        console.warn("[notificationService] Failed to mark read in Supabase:", err);
      }
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LOCAL_STORAGE_NOTIFICATIONS_KEY, JSON.stringify(cachedNotifications));
      } catch {}
    }

    notifyListeners();
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<void> => {
    cachedNotifications = cachedNotifications.map((n) => ({ ...n, read: true }));

    if (isSupabaseConfigured()) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("notifications").update({ read: true }).eq("user_id", user.id);
        }
      } catch (err) {
        console.warn("[notificationService] Failed to mark all read in Supabase:", err);
      }
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LOCAL_STORAGE_NOTIFICATIONS_KEY, JSON.stringify(cachedNotifications));
      } catch {}
    }

    notifyListeners();
  },

  /**
   * Delete a notification
   */
  deleteNotification: async (id: string): Promise<void> => {
    cachedNotifications = cachedNotifications.filter((n) => n.id !== id);

    if (isSupabaseConfigured()) {
      try {
        await supabase.from("notifications").delete().eq("id", id);
      } catch (err) {
        console.warn("[notificationService] Failed to delete in Supabase:", err);
      }
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LOCAL_STORAGE_NOTIFICATIONS_KEY, JSON.stringify(cachedNotifications));
      } catch {}
    }

    notifyListeners();
  },

  /**
   * Get total unread notifications count
   */
  getUnreadCount: async (): Promise<number> => {
    const list = await notificationService.getNotifications();
    return list.filter((n) => !n.read).length;
  },

  /**
   * Anti-Spam Task Reminder Scanner & Synchronizer
   * Evaluates upcoming, overdue, and recurring tasks and generates persisted reminders without spamming.
   */
  syncTaskReminders: async (tasks: Task[]): Promise<NotificationItem[]> => {
    const notifiedKeys = getStoredNotifiedKeys();
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeMins = currentHours * 60 + currentMinutes;

    const newNotifications: NotificationItem[] = [];

    for (const task of tasks) {
      if (task.isCompleted || task.status === "completed") continue;

      const isOverdue = Boolean(task.dueDate && task.dueDate < todayStr);
      const isDueToday = Boolean(task.dueDate === todayStr);

      // 1. OVERDUE REMINDER
      if (isOverdue) {
        const key = `overdue-${task.id}-${task.dueDate}`;
        if (!notifiedKeys.has(key)) {
          notifiedKeys.add(key);
          saveStoredNotifiedKey(key);

          const notif: NotificationItem = {
            id: `notif-overdue-${Date.now()}-${task.id}`,
            userId: "user-afaq",
            taskId: task.id,
            type: "deadline",
            title: `Overdue: ${task.title}`,
            message: `Was due on ${task.dueDate}${task.dueTime ? ` at ${task.dueTime}` : ""}. Priority action needed.`,
            read: false,
            createdAt: new Date().toISOString(),
            workspaceId: task.workspaceId,
            priority: task.priority,
          };
          newNotifications.push(notif);
        }
      }

      // 2. UPCOMING REMINDER (Due today within next 60m or imminent)
      if (isDueToday && task.dueTime) {
        const [dueH, dueM] = task.dueTime.split(":").map(Number);
        if (!isNaN(dueH) && !isNaN(dueM)) {
          const dueTimeMins = dueH * 60 + dueM;
          const diffMins = dueTimeMins - currentTimeMins;

          // If due within upcoming 4 hours or due within past 30 mins
          if (diffMins <= 240 && diffMins >= -30) {
            const key = `upcoming-${task.id}-${task.dueTime}-${todayStr}`;
            if (!notifiedKeys.has(key)) {
              notifiedKeys.add(key);
              saveStoredNotifiedKey(key);

              const notif: NotificationItem = {
                id: `notif-up-${Date.now()}-${task.id}`,
                userId: "user-afaq",
                taskId: task.id,
                type: "reminder",
                title: `Upcoming: ${task.title}`,
                message: `Scheduled today at ${task.dueTime}. Prepare to enter flow state.`,
                read: false,
                createdAt: new Date().toISOString(),
                workspaceId: task.workspaceId,
                priority: task.priority,
              };
              newNotifications.push(notif);
            }
          }
        }
      }

      // 3. RECURRING ROUTINE REMINDER
      if (task.isRecurring || task.recurringRuleId) {
        const key = `recurring-${task.id}-${todayStr}`;
        if (!notifiedKeys.has(key)) {
          notifiedKeys.add(key);
          saveStoredNotifiedKey(key);

          const notif: NotificationItem = {
            id: `notif-rec-${Date.now()}-${task.id}`,
            userId: "user-afaq",
            taskId: task.id,
            type: "reminder",
            title: `Recurring Routine: ${task.title}`,
            message: `Active recurrence rule for ${task.workspaceId}. Ready for execution.`,
            read: false,
            createdAt: new Date().toISOString(),
            workspaceId: task.workspaceId,
            priority: task.priority,
          };
          newNotifications.push(notif);
        }
      }
    }

    if (newNotifications.length > 0) {
      cachedNotifications = [...newNotifications, ...cachedNotifications];

      // Persist to Supabase if configured
      if (isSupabaseConfigured()) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from("notifications").insert(
              newNotifications.map((n) => ({
                user_id: user.id,
                task_id: n.taskId || null,
                type: n.type,
                title: n.title,
                message: n.message,
                read: false,
              }))
            );
          }
        } catch (err) {
          console.warn("[notificationService] Failed to persist new notifications to Supabase:", err);
        }
      }

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(LOCAL_STORAGE_NOTIFICATIONS_KEY, JSON.stringify(cachedNotifications));
        } catch {}
      }

      notifyListeners();

      // Dispatch Web Notification if permitted and play chime
      for (const n of newNotifications) {
        notificationService.deliverSystemNotification(n.title, {
          body: n.message,
          icon: "/favicon.ico",
        });
      }
      notificationService.playNotificationSound();
    }

    return newNotifications;
  },

  /**
   * Request Web Notification Permissions gracefully
   */
  requestPermission: async (): Promise<NotificationPermission> => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "denied";
    }
    try {
      return await Notification.requestPermission();
    } catch (err) {
      console.warn("[notificationService] Error requesting notification permission:", err);
      return "denied";
    }
  },

  /**
   * Get current Web Notification Permission state
   */
  getPermissionState: (): NotificationPermission => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "denied";
    }
    return Notification.permission;
  },

  /**
   * Deliver actual browser system notification (only if granted)
   */
  deliverSystemNotification: (title: string, options?: NotificationOptions): boolean => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      try {
        new Notification(title, options);
        return true;
      } catch (err) {
        console.warn("[notificationService] Browser notification delivery failed:", err);
      }
    }
    return false;
  },

  /**
   * Synthesize gentle two-tone chime via Web Audio API
   * Zero external dependencies. Guaranteed to work in all modern browsers.
   */
  playNotificationSound: (): void => {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // First chime tone (523.25 Hz - C5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
      gain1.gain.setValueAtTime(0.15, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.35);

      // Second harmonic chime tone (659.25 Hz - E5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12);
      gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.12);
      osc2.stop(ctx.currentTime + 0.55);
    } catch {
      // AudioContext may be restricted before user interaction; fail silently
    }
  },
};
