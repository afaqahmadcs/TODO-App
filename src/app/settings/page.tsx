"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { authService, AuthUserProfile } from "@/services/authService";
import { taskService } from "@/services/taskService";
import { projectService } from "@/services/projectService";
import { noteService } from "@/services/noteService";

export default function SettingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUserProfile | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Preferences interactive state (persisted to localStorage)
  const [themeMode, setThemeMode] = useState<"slate" | "pitch" | "system">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("afaq_settings_theme");
      if (saved === "slate" || saved === "pitch" || saved === "system") return saved;
    }
    return "slate";
  });
  const [defaultWorkspace, setDefaultWorkspace] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("afaq_settings_workspace") || "office";
    }
    return "office";
  });
  const [timezone, setTimezone] = useState<string>("Asia/Karachi");

  // Notifications interactive state
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [browserNotifications, setBrowserNotifications] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);

  // Productivity settings
  const [dailyFocusGoal, setDailyFocusGoal] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("afaq_settings_focus_goal");
      if (saved) return Number(saved);
    }
    return 4;
  });
  const [pomodoroWorkMin, setPomodoroWorkMin] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("afaq_settings_pomo_work");
      if (saved) return Number(saved);
    }
    return 25;
  });
  const [pomodoroBreakMin, setPomodoroBreakMin] = useState<number>(5);

  useEffect(() => {
    let isMounted = true;
    authService.getProfile().then((user) => {
      if (isMounted && user) {
        setCurrentUser(user);
        if (user.timezone) setTimezone(user.timezone);
      }
    });

    const unsub = authService.onProfileChange((user) => {
      if (isMounted) {
        setCurrentUser(user);
        if (user.timezone) setTimezone(user.timezone);
      }
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleSavePreference = (key: string, val: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, val);
      showToast("Preference saved.");
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    if (!confirm("Are you sure you want to sign out of Afaq TaskFlow?")) return;
    setIsSigningOut(true);
    try {
      await authService.signOut();
      router.push("/login");
    } finally {
      setIsSigningOut(false);
    }
  };

  // Export all application data as a JSON file
  const handleExportAllData = async () => {
    setIsExporting(true);
    try {
      const [tasks, projects, notes] = await Promise.all([
        taskService.getTasks(),
        projectService.getProjects(),
        noteService.getNotes(),
      ]);

      const bundle = {
        exportedAt: new Date().toISOString(),
        version: "2.4.0",
        user: currentUser,
        tasks,
        projects,
        notes,
      };

      const jsonStr = JSON.stringify(bundle, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `afaq_taskflow_backup_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast("Application data exported successfully as JSON.");
    } catch (err) {
      console.error("Export error", err);
      showToast("Export failed. Check browser console.");
    } finally {
      setIsExporting(false);
    }
  };

  // Clear local application cache
  const handleClearCache = () => {
    if (!confirm("Clear local cache? This will reset offline stored settings and reload fresh data.")) return;
    try {
      localStorage.removeItem("afaq_taskflow_focus_sessions");
      localStorage.removeItem("afaq_taskflow_projects_cache");
      localStorage.removeItem("afaq_taskflow_notes_cache");
      showToast("Local cache cleared successfully.");
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      showToast("Failed to clear cache.");
    }
  };

  // Toggle browser notification permission
  const handleToggleBrowserNotifications = async () => {
    if (!browserNotifications) {
      if (typeof window !== "undefined" && "Notification" in window) {
        const perm = await Notification.requestPermission();
        if (perm === "granted") {
          setBrowserNotifications(true);
          showToast("Browser notification permissions granted.");
        } else {
          setBrowserNotifications(false);
          showToast("Browser notification permission denied by system.");
        }
      } else {
        showToast("Browser does not support desktop notifications.");
      }
    } else {
      setBrowserNotifications(false);
      showToast("Browser notifications disabled.");
    }
  };

  const shortcuts = [
    { key: "⌘K / /", desc: "Open global command search across tasks, projects & notes" },
    { key: "N", desc: "Open universal quick task creation modal" },
    { key: "F", desc: "Toggle Focus Mode / Pomodoro session" },
    { key: "ESC", desc: "Dismiss open modals, drawers, or detail dialogs" },
  ];

  return (
    <PageContainer maxWidth="narrow">
      <PageHeader
        badge="System Configuration"
        title="Settings & Preferences"
        description="Manage your creator identity, workspace preferences, productivity timers, data exports, and security."
      />

      {statusMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center justify-between animate-in fade-in-50 mb-6">
          <div className="flex items-center gap-2">
            <Icon name="check_circle" size={18} className="text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-emerald-400 hover:text-emerald-300">
            <Icon name="close" size={16} />
          </button>
        </div>
      )}

      <div className="space-y-6">
        {/* 1. Profile Overview Card with direct /profile link */}
        <Card variant="low" className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
            <div className="flex items-center gap-2">
              <Icon name="person" size={20} className="text-primary" />
              <h3 className="text-base font-bold text-on-surface font-headline">
                Creator Profile
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {authService.isConfigured() ? "Supabase Live Auth" : "Local Workspace Mode"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar
                size="lg"
                src={currentUser?.avatarUrl}
                name={currentUser?.name || "User"}
                alt={currentUser?.name || "User"}
                statusDot="online"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-bold text-on-surface">
                    {currentUser?.name || "Afaq Ahmad"}
                  </h4>
                  <span className="font-mono text-xs text-outline">
                    @{currentUser?.username || "afaqahmad"}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant max-w-md line-clamp-1">
                  {currentUser?.bio || "Social media strategist, video editor & fullstack software engineer."}
                </p>
                <span className="inline-block font-mono text-xs text-secondary bg-secondary/10 px-2 py-0.5 rounded">
                  {currentUser?.email || "afaqahmadcs@gmail.com"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Link href="/profile">
                <Button variant="primary" size="sm" icon="edit" className="text-xs">
                  Manage Full Profile
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </Card>

        {/* 2. Workspace Preferences */}
        <Card variant="low" className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
            <div className="flex items-center gap-2">
              <Icon name="tune" size={20} className="text-amber-400" />
              <h3 className="text-base font-bold text-on-surface font-headline">
                Workspace Preferences
              </h3>
            </div>
            <span className="text-xs text-outline font-mono">Custom Defaults</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Theme selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-outline">
                Theme Aesthetic
              </label>
              <select
                value={themeMode}
                onChange={(e) => {
                  const val = e.target.value as "slate" | "pitch" | "system";
                  setThemeMode(val);
                  handleSavePreference("afaq_settings_theme", val);
                }}
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/20 text-on-surface text-xs focus:outline-none focus:ring-2 focus:ring-primary-container"
              >
                <option value="slate">Dark Slate (#0b1326 - Stitch Default)</option>
                <option value="pitch">Pitch Black (#05070c)</option>
                <option value="system">System Auto</option>
              </select>
            </div>

            {/* Default Workspace */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-outline">
                Default Workspace
              </label>
              <select
                value={defaultWorkspace}
                onChange={(e) => {
                  const val = e.target.value;
                  setDefaultWorkspace(val);
                  handleSavePreference("afaq_settings_workspace", val);
                }}
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/20 text-on-surface text-xs focus:outline-none focus:ring-2 focus:ring-primary-container"
              >
                <option value="office">Office (8 Social Pages)</option>
                <option value="personal">Personal (Vlogs & Media)</option>
                <option value="college">College (Academics)</option>
                <option value="web-development">Web Development (Code)</option>
              </select>
            </div>

            {/* Timezone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-outline">
                Operating Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => {
                  const val = e.target.value;
                  setTimezone(val);
                  authService.updateProfile({ timezone: val });
                  showToast("Timezone updated.");
                }}
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/20 text-on-surface text-xs focus:outline-none focus:ring-2 focus:ring-primary-container"
              >
                <option value="Asia/Karachi">Asia/Karachi (PKT UTC+5)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST UTC+4)</option>
                <option value="Europe/London">Europe/London (GMT UTC+0)</option>
                <option value="America/New_York">America/New_York (EST UTC-5)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* 3. Productivity & Pomodoro Timer Settings */}
        <Card variant="low" className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
            <div className="flex items-center gap-2">
              <Icon name="timer" size={20} className="text-purple-400" />
              <h3 className="text-base font-bold text-on-surface font-headline">
                Productivity & Focus Mode Timers
              </h3>
            </div>
            <span className="text-xs text-outline font-mono">Telemetry Tuning</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-outline">
                Daily Focus Goal
              </label>
              <select
                value={dailyFocusGoal}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setDailyFocusGoal(val);
                  handleSavePreference("afaq_settings_focus_goal", String(val));
                }}
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/20 text-on-surface text-xs focus:outline-none focus:ring-2 focus:ring-primary-container"
              >
                <option value={2}>2 Hours / day (Light)</option>
                <option value={3}>3 Hours / day (Balanced)</option>
                <option value={4}>4 Hours / day (Standard Pro)</option>
                <option value={6}>6 Hours / day (Sprint Mode)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-outline">
                Pomodoro Interval
              </label>
              <select
                value={pomodoroWorkMin}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPomodoroWorkMin(val);
                  handleSavePreference("afaq_settings_pomo_work", String(val));
                }}
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/20 text-on-surface text-xs focus:outline-none focus:ring-2 focus:ring-primary-container"
              >
                <option value={25}>25 Minutes (Standard 25/5)</option>
                <option value={50}>50 Minutes (Deep Work 50/10)</option>
                <option value={90}>90 Minutes (Ultradian Cycle)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-outline">
                Rest Break
              </label>
              <select
                value={pomodoroBreakMin}
                onChange={(e) => setPomodoroBreakMin(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/20 text-on-surface text-xs focus:outline-none focus:ring-2 focus:ring-primary-container"
              >
                <option value={5}>5 Minutes Short Break</option>
                <option value={10}>10 Minutes Extended Break</option>
                <option value={15}>15 Minutes Long Break</option>
              </select>
            </div>
          </div>
        </Card>

        {/* 4. Notification Preferences */}
        <Card variant="low" className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
            <div className="flex items-center gap-2">
              <Icon name="notifications" size={20} className="text-cyan-400" />
              <h3 className="text-base font-bold text-on-surface font-headline">
                Notifications & Reminders
              </h3>
            </div>
            <span className="text-xs text-outline font-mono">Delivery Channels</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container border border-outline-variant/10">
              <div>
                <span className="text-xs font-semibold text-on-surface block">In-App Notification Center</span>
                <span className="text-[11px] text-outline">Receive reminders for upcoming deadlines and overdue tasks.</span>
              </div>
              <button
                type="button"
                onClick={() => setInAppNotifications(!inAppNotifications)}
                className={`w-11 h-6 rounded-full p-1 transition-colors ${
                  inAppNotifications ? "bg-primary-container" : "bg-surface-container-highest"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    inAppNotifications ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container border border-outline-variant/10">
              <div>
                <span className="text-xs font-semibold text-on-surface block">Browser Desktop Notifications</span>
                <span className="text-[11px] text-outline">System alerts when Pomodoro focus sessions end.</span>
              </div>
              <button
                type="button"
                onClick={handleToggleBrowserNotifications}
                className={`w-11 h-6 rounded-full p-1 transition-colors ${
                  browserNotifications ? "bg-primary-container" : "bg-surface-container-highest"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    browserNotifications ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container border border-outline-variant/10">
              <div>
                <span className="text-xs font-semibold text-on-surface block">Sound Effects</span>
                <span className="text-[11px] text-outline">Audio chime on task completion and timer triggers.</span>
              </div>
              <button
                type="button"
                onClick={() => setSoundEffects(!soundEffects)}
                className={`w-11 h-6 rounded-full p-1 transition-colors ${
                  soundEffects ? "bg-primary-container" : "bg-surface-container-highest"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    soundEffects ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* 5. Data & Storage Management */}
        <Card variant="low" className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
            <div className="flex items-center gap-2">
              <Icon name="storage" size={20} className="text-emerald-400" />
              <h3 className="text-base font-bold text-on-surface font-headline">
                Data & Storage Management
              </h3>
            </div>
            <span className="text-xs text-outline font-mono">Backup & Local Cache</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface-container border border-outline-variant/10">
            <div>
              <h4 className="text-xs font-semibold text-on-surface">Export Workspace Snapshot</h4>
              <p className="text-[11px] text-outline mt-0.5">
                Download all tasks, projects, notes, and profile data formatted as JSON.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon="download"
              onClick={handleExportAllData}
              disabled={isExporting}
              className="text-xs shrink-0"
            >
              {isExporting ? "Exporting..." : "Export All (JSON)"}
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface-container border border-outline-variant/10">
            <div>
              <h4 className="text-xs font-semibold text-on-surface">Clear Offline Cache</h4>
              <p className="text-[11px] text-outline mt-0.5">
                Purge cached focus sessions and reload fresh data from database.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon="refresh"
              onClick={handleClearCache}
              className="text-xs text-amber-400 border-amber-500/30 hover:bg-amber-500/10 shrink-0"
            >
              Clear Cache
            </Button>
          </div>
        </Card>

        {/* 6. Keyboard Shortcuts Table */}
        <Card variant="low" className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
            <div className="flex items-center gap-2">
              <Icon name="keyboard" size={20} className="text-primary" />
              <h3 className="text-base font-bold text-on-surface font-headline">
                Keyboard Shortcuts
              </h3>
            </div>
            <span className="text-xs text-outline font-mono">Global Hotkeys</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {shortcuts.map((sc, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-surface-container border border-outline-variant/15 flex items-center justify-between"
              >
                <span className="text-xs text-on-surface-variant font-medium">{sc.desc}</span>
                <kbd className="px-2 py-1 rounded bg-surface-container-highest font-mono text-xs font-bold text-on-surface border border-outline-variant/20">
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>
        </Card>

        {/* 7. System & Backend Status Card */}
        <Card variant="low" className="p-6 space-y-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
            <div className="flex items-center gap-2">
              <Icon name="database" size={20} className="text-emerald-400" />
              <h3 className="text-base font-bold text-on-surface font-headline">
                System Status & Backend Schema
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono text-xs font-semibold">
              Afaq TaskFlow v2.4.0
            </span>
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            12 PostgreSQL tables, Row Level Security (RLS) policies, and avatar storage bucket configured with Next.js 16 and Supabase.
          </p>

          <div className="space-y-2 pt-1">
            <span className="text-xs font-mono text-outline uppercase tracking-wider block">
              12 Relational Tables
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                "profiles",
                "workspaces",
                "pages",
                "projects",
                "tasks",
                "subtasks",
                "tags",
                "task_tags",
                "recurring_tasks",
                "focus_sessions",
                "notes",
                "notifications",
              ].map((tbl) => (
                <span
                  key={tbl}
                  className="px-2 py-0.5 rounded-md bg-surface-container font-mono text-[11px] text-on-surface border border-outline-variant/15"
                >
                  {tbl}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-outline-variant/10 text-xs font-mono text-outline">
            <span>Storage Bucket: avatars (Public Read, Auth Write)</span>
            <span className="text-emerald-400 font-semibold">Production Ready</span>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
