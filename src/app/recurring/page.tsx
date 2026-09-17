"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import {
  RecurringRule,
  RecurringFilterTab,
  RecurrenceType,
  TemplateId,
  CreateRecurringRuleInput,
} from "@/types/recurring";
import { WorkspaceType, OfficePageId } from "@/types/workspace";
import { TaskPriority } from "@/types/task";
import { recurringTaskService } from "@/services/recurringTaskService";
import { formatRecurringPattern, formatTime12h } from "@/lib/recurrenceEngine";
import { OFFICE_PAGES } from "@/lib/constants";

const WORKSPACE_COLORS: Record<WorkspaceType, { border: string; bg: string; text: string; glow: string }> = {
  office: {
    border: "border-blue-500/40",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    glow: "shadow-[0_0_12px_rgba(59,130,246,0.15)]",
  },
  personal: {
    border: "border-purple-500/40",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    glow: "shadow-[0_0_12px_rgba(168,85,247,0.15)]",
  },
  college: {
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    glow: "shadow-[0_0_12px_rgba(16,185,129,0.15)]",
  },
  "web-development": {
    border: "border-cyan-500/40",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    glow: "shadow-[0_0_12px_rgba(6,182,212,0.15)]",
  },
  web_development: {
    border: "border-cyan-500/40",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    glow: "shadow-[0_0_12px_rgba(6,182,212,0.15)]",
  },
};

export default function RecurringTasksPage() {
  const [rules, setRules] = useState<RecurringRule[]>([]);
  const [filterTab, setFilterTab] = useState<RecurringFilterTab>("active");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  // Form State
  const [templateId, setTemplateId] = useState<TemplateId | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [workspaceId, setWorkspaceId] = useState<WorkspaceType>("office");
  const [officePageId, setOfficePageId] = useState<OfficePageId | "">("shooting-page");
  const [priority, setPriority] = useState<TaskPriority>("high");
  const [dueTime, setDueTime] = useState("13:15");
  const [estimatedDurationMin, setEstimatedDurationMin] = useState(45);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>("WEEKDAYS");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [checklistItems, setChecklistItems] = useState<string[]>([]);
  const [newChecklistInput, setNewChecklistInput] = useState("");

  const refreshRules = useCallback(async () => {
    const data = await recurringTaskService.getRules(filterTab);
    setRules(data);
  }, [filterTab]);

  useEffect(() => {
    let isMounted = true;
    recurringTaskService.getRules(filterTab).then((data) => {
      if (isMounted) {
        setRules(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [filterTab]);

  // Telemetry Counts
  const totalCount = rules.length;
  const activeCount = rules.filter((r) => r.status === "ACTIVE").length;
  const pausedCount = rules.filter((r) => r.status === "PAUSED").length;
  const expiredCount = rules.filter((r) => r.status === "EXPIRED").length;

  // Handle Template Selection in Modal
  const handleTemplateChange = (tplId: TemplateId | "") => {
    setTemplateId(tplId);
    if (!tplId) return;

    const templates = recurringTaskService.getTemplates();
    const tpl = templates.find((t) => t.id === tplId);
    if (!tpl) return;

    setTitle(tpl.name);
    setDescription(tpl.description);
    setWorkspaceId(tpl.workspaceId);
    setOfficePageId(tpl.officePageId || "");
    setPriority(tpl.priority);
    setDueTime(tpl.dueTime);
    setEstimatedDurationMin(tpl.estimatedDurationMin);
    setRecurrenceType(tpl.recurrenceType);
    setDaysOfWeek(tpl.daysOfWeek);
    setChecklistItems([...tpl.checklist]);
  };

  const openCreateModal = () => {
    setModalMode("create");
    setEditingRuleId(null);
    setTemplateId("");
    setTitle("");
    setDescription("");
    setWorkspaceId("office");
    setOfficePageId("shooting-page");
    setPriority("high");
    setDueTime("13:15");
    setEstimatedDurationMin(45);
    setRecurrenceType("WEEKDAYS");
    setDaysOfWeek([1, 2, 3, 4, 5]);
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate("");
    setChecklistItems([
      "Check new content",
      "Select content",
      "Edit",
      "Caption",
      "Hashtags",
      "Upload",
      "Verify upload",
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (rule: RecurringRule) => {
    setModalMode("edit");
    setEditingRuleId(rule.id);
    setTemplateId(rule.templateId || "");
    setTitle(rule.title);
    setDescription(rule.description || "");
    setWorkspaceId(rule.workspaceId);
    setOfficePageId(rule.officePageId || "");
    setPriority(rule.priority);
    setDueTime(rule.dueTime);
    setEstimatedDurationMin(rule.estimatedDurationMin);
    setRecurrenceType(rule.recurrenceType);
    setDaysOfWeek(rule.daysOfWeek || []);
    setStartDate(rule.startDate);
    setEndDate(rule.endDate || "");
    setChecklistItems([...(rule.checklist || [])]);
    setIsModalOpen(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (modalMode === "create") {
      const input: CreateRecurringRuleInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        templateId: templateId || undefined,
        workspaceId,
        officePageId: workspaceId === "office" ? (officePageId as OfficePageId) : undefined,
        priority,
        dueTime,
        estimatedDurationMin: Number(estimatedDurationMin) || 30,
        startDate,
        endDate: endDate || null,
        recurrenceType,
        daysOfWeek,
        checklist: checklistItems,
      };

      await recurringTaskService.createRule(input);
      setFeedback({
        message: `Recurring automation "${title}" created successfully!`,
        type: "success",
      });
    } else if (editingRuleId) {
      await recurringTaskService.updateRule(editingRuleId, {
        title: title.trim(),
        description: description.trim() || undefined,
        templateId: templateId || undefined,
        workspaceId,
        officePageId: workspaceId === "office" ? (officePageId as OfficePageId) : undefined,
        priority,
        dueTime,
        estimatedDurationMin: Number(estimatedDurationMin) || 30,
        startDate,
        endDate: endDate || null,
        recurrenceType,
        daysOfWeek,
        checklist: checklistItems,
      });
      setFeedback({
        message: `Updated recurring automation "${title}".`,
        type: "info",
      });
    }

    setIsModalOpen(false);
    refreshRules();
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleTogglePause = async (rule: RecurringRule) => {
    if (rule.status === "ACTIVE") {
      await recurringTaskService.pauseRule(rule.id);
      setFeedback({ message: `Paused automation "${rule.title}".`, type: "info" });
    } else {
      await recurringTaskService.resumeRule(rule.id);
      setFeedback({ message: `Resumed automation "${rule.title}".`, type: "success" });
    }
    refreshRules();
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDeleteRule = async (id: string, ruleTitle: string) => {
    if (confirm(`Delete recurring routine "${ruleTitle}"?`)) {
      await recurringTaskService.deleteRule(id);
      setFeedback({ message: `Deleted routine "${ruleTitle}".`, type: "info" });
      refreshRules();
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleGenerateNow = async () => {
    setIsGenerating(true);
    try {
      const result = await recurringTaskService.generateUpcomingTasks(14);
      setFeedback({
        message: result.message,
        type: "success",
      });
      refreshRules();
    } catch {
      setFeedback({
        message: "Failed to generate upcoming task instances.",
        type: "info",
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const toggleDay = (dayIndex: number) => {
    if (daysOfWeek.includes(dayIndex)) {
      setDaysOfWeek(daysOfWeek.filter((d) => d !== dayIndex));
    } else {
      setDaysOfWeek([...daysOfWeek, dayIndex].sort());
    }
  };

  const addChecklistItem = () => {
    if (!newChecklistInput.trim()) return;
    setChecklistItems([...checklistItems, newChecklistInput.trim()]);
    setNewChecklistInput("");
  };

  const removeChecklistItem = (idx: number) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== idx));
  };

  const templates = recurringTaskService.getTemplates();

  return (
    <PageContainer>
      <PageHeader
        badge="Recurring Automation Engine"
        metaText="Phase 7 • Zero-duplication scheduling • User timezone (UTC+5 / Asia/Karachi)"
        title="Recurring Tasks & Routines"
        description="Automate daily content publishing workflows, live academic classes, and development sprints without duplicate tasks."
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              icon={isGenerating ? "sync" : "bolt"}
              onClick={handleGenerateNow}
              disabled={isGenerating}
              className="border-primary/40 text-primary hover:bg-primary/10"
            >
              {isGenerating ? "Generating..." : "⚡ Generate 14 Days Now"}
            </Button>
            <Button variant="primary" icon="add" onClick={openCreateModal}>
              + New Recurring Routine
            </Button>
          </div>
        }
      />

      {/* Toast Feedback Notification */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm font-mono transition-all animate-fadeIn ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-blue-500/10 border-blue-500/30 text-blue-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Icon name={feedback.type === "success" ? "check_circle" : "info"} size={18} />
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-on-surface-variant hover:text-on-surface"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}

      {/* 4 Telemetry Header KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="low" className="p-4 border-l-4 border-l-primary space-y-1">
          <span className="font-mono text-xs uppercase tracking-wider text-on-surface-variant">
            Total Routines
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-headline text-on-surface">{totalCount}</span>
            <span className="text-xs text-primary font-mono font-medium">All domains</span>
          </div>
        </Card>

        <Card variant="low" className="p-4 border-l-4 border-l-emerald-500 space-y-1">
          <span className="font-mono text-xs uppercase tracking-wider text-on-surface-variant">
            Active Running
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-headline text-emerald-400">{activeCount}</span>
            <span className="text-xs text-emerald-400 font-mono font-medium">Auto-populating</span>
          </div>
        </Card>

        <Card variant="low" className="p-4 border-l-4 border-l-amber-500 space-y-1">
          <span className="font-mono text-xs uppercase tracking-wider text-on-surface-variant">
            Paused Routines
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-headline text-amber-400">{pausedCount}</span>
            <span className="text-xs text-amber-400 font-mono font-medium">Standby</span>
          </div>
        </Card>

        <Card variant="low" className="p-4 border-l-4 border-l-purple-500 space-y-1">
          <span className="font-mono text-xs uppercase tracking-wider text-on-surface-variant">
            Configured Timezone
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold font-headline text-purple-300">Asia/Karachi</span>
            <span className="text-xs text-purple-400 font-mono font-medium">UTC+5</span>
          </div>
        </Card>
      </div>

      {/* Segmented Filter Tabs */}
      <div className="flex items-center justify-between border-b border-outline-variant/15 pb-2">
        <div className="inline-flex p-1 rounded-xl bg-surface-container-low border border-outline-variant/20 gap-1">
          {(
            [
              { id: "active", label: "Active", icon: "check_circle", count: activeCount },
              { id: "paused", label: "Paused", icon: "pause_circle", count: pausedCount },
              { id: "upcoming", label: "Upcoming Order", icon: "schedule", count: activeCount },
              { id: "expired", label: "Expired", icon: "event_busy", count: expiredCount },
              { id: "all", label: "All Rules", icon: "repeat", count: totalCount },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterTab(tab.id as RecurringFilterTab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterTab === tab.id
                  ? "bg-primary-container text-white shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Icon name={tab.icon} size={14} />
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/20 font-mono text-[10px]">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Rules Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-on-surface-variant font-mono text-sm">
          Loading recurring rules...
        </div>
      ) : rules.length === 0 ? (
        <Card variant="low" className="p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center mx-auto text-primary">
            <Icon name="repeat" size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-on-surface">No recurring tasks in this view</h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Create a new recurring routine or generate one from our preloaded templates.
            </p>
          </div>
          <Button variant="primary" icon="add" onClick={openCreateModal}>
            Create Routine Now
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule) => {
            const domain = WORKSPACE_COLORS[rule.workspaceId] || WORKSPACE_COLORS.office;
            const isPaused = rule.status === "PAUSED";
            const isExpired = rule.status === "EXPIRED";

            return (
              <Card
                key={rule.id}
                variant="low"
                className={`p-5 border-l-4 ${domain.border} space-y-4 transition-all hover:bg-surface-container ${domain.glow} ${
                  isPaused ? "opacity-75" : ""
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase ${domain.bg} ${domain.text}`}
                    >
                      {rule.workspaceId.replace("_", " ")}
                    </span>
                    {rule.officePageId && (
                      <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-mono text-[10px]">
                        {rule.officePageId}
                      </span>
                    )}
                    {rule.templateId && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono text-[10px] font-semibold">
                        Template: {rule.templateId.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full font-mono text-[11px] font-semibold ${
                      rule.status === "ACTIVE"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : rule.status === "PAUSED"
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        : "bg-slate-500/15 text-slate-400 border border-slate-500/30"
                    }`}
                  >
                    {rule.status}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h4 className="text-base font-bold text-on-surface flex items-center gap-2">
                    <span>{rule.title}</span>
                    {rule.priority === "high" && (
                      <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 text-[10px] font-mono font-bold uppercase">
                        High
                      </span>
                    )}
                  </h4>
                  {rule.description && (
                    <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">
                      {rule.description}
                    </p>
                  )}
                </div>

                {/* Schedule & Recurrence Pattern */}
                <div className="p-3 rounded-xl bg-surface-container/60 border border-outline-variant/10 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-on-surface-variant flex items-center gap-1.5">
                      <Icon name="repeat" size={14} className="text-primary" />
                      <span>{formatRecurringPattern(rule)}</span>
                    </span>
                    <span className="text-on-surface-variant">
                      ⏱ {rule.estimatedDurationMin}m
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-outline-variant/10">
                    <span className="text-on-surface-variant">
                      Next Run:{" "}
                      <span className="text-on-surface font-semibold">
                        {rule.nextOccurrence
                          ? rule.nextOccurrence.replace("T", " at ")
                          : "Expired"}
                      </span>
                    </span>
                    {rule.endDate && (
                      <span className="text-amber-400/80">Expires: {rule.endDate}</span>
                    )}
                  </div>
                </div>

                {/* Checklist Preview */}
                {rule.checklist && rule.checklist.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-on-surface-variant">
                      <span>Task Subtask Checklist Template ({rule.checklist.length} items)</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {rule.checklist.slice(0, 4).map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-surface-container text-[11px] text-on-surface-variant border border-outline-variant/10 flex items-center gap-1"
                        >
                          <Icon name="check" size={10} className="text-emerald-400" />
                          <span>{item}</span>
                        </span>
                      ))}
                      {rule.checklist.length > 4 && (
                        <span className="px-2 py-0.5 rounded-lg bg-surface-container text-[11px] text-on-surface-variant font-mono">
                          +{rule.checklist.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions Footer */}
                <div className="pt-3 border-t border-outline-variant/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={isPaused ? "play_arrow" : "pause"}
                      onClick={() => handleTogglePause(rule)}
                      disabled={isExpired}
                      className={
                        isPaused
                          ? "text-emerald-400 hover:bg-emerald-500/10"
                          : "text-amber-400 hover:bg-amber-500/10"
                      }
                    >
                      {isPaused ? "Resume" : "Pause"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="edit"
                      onClick={() => openEditModal(rule)}
                    >
                      Edit
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    icon="delete"
                    onClick={() => handleDeleteRule(rule.id, rule.title)}
                    className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT RECURRING ROUTINE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 space-y-5 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/15">
              <div>
                <h3 className="text-lg font-bold text-on-surface">
                  {modalMode === "create" ? "New Recurring Automation Routine" : "Edit Recurring Routine"}
                </h3>
                <p className="text-xs text-on-surface-variant font-mono">
                  Guaranteed zero duplicates • Timezone: Asia/Karachi (UTC+5)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-4">
              {/* Template Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-on-surface-variant">
                  Load Reusable Template (Optional)
                </label>
                <select
                  value={templateId}
                  onChange={(e) => handleTemplateChange(e.target.value as TemplateId)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/20 text-on-surface text-sm focus:outline-none focus:border-primary"
                >
                  <option value="">Custom Routine (No Template)</option>
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name} — {tpl.workspaceId.toUpperCase()} ({tpl.recurrenceType})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-on-surface-variant">
                  Routine Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Daily Shooting Page Management"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/20 text-on-surface text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-on-surface-variant">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notes or context for generated task instances..."
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/20 text-on-surface text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Workspace, Office Page, Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-on-surface-variant">
                    Workspace
                  </label>
                  <select
                    value={workspaceId}
                    onChange={(e) => setWorkspaceId(e.target.value as WorkspaceType)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/20 text-on-surface text-sm focus:outline-none focus:border-primary capitalize"
                  >
                    <option value="office">Office</option>
                    <option value="personal">Personal</option>
                    <option value="college">College</option>
                    <option value="web_development">Web Development</option>
                  </select>
                </div>

                {workspaceId === "office" ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-semibold text-on-surface-variant">
                      Office Page
                    </label>
                    <select
                      value={officePageId}
                      onChange={(e) => setOfficePageId(e.target.value as OfficePageId)}
                      className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/20 text-on-surface text-sm focus:outline-none focus:border-primary"
                    >
                      {OFFICE_PAGES.map((page) => (
                        <option key={page.id} value={page.id}>
                          {page.title}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-semibold text-on-surface-variant">
                      Domain Category
                    </label>
                    <input
                      disabled
                      value={workspaceId.replace("_", " ")}
                      className="w-full px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/10 text-on-surface-variant text-sm capitalize"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-on-surface-variant">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/20 text-on-surface text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {/* Time & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-on-surface-variant">
                    Scheduled Due Time (Asia/Karachi)
                  </label>
                  <input
                    type="time"
                    required
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/20 text-on-surface text-sm focus:outline-none focus:border-primary font-mono"
                  />
                  <span className="text-[11px] font-mono text-outline">
                    Display: {formatTime12h(dueTime)}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-on-surface-variant">
                    Estimated Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="480"
                    step="5"
                    value={estimatedDurationMin}
                    onChange={(e) => setEstimatedDurationMin(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/20 text-on-surface text-sm focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>

              {/* Recurrence Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-on-surface-variant">
                  Recurrence Type
                </label>
                <select
                  value={recurrenceType}
                  onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/20 text-on-surface text-sm focus:outline-none focus:border-primary"
                >
                  <option value="EVERY_DAY">Every day</option>
                  <option value="WEEKDAYS">Weekdays (Monday – Friday)</option>
                  <option value="SPECIFIC_WEEKDAYS">Specific weekdays</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="CUSTOM_INTERVAL">Custom interval (every N days)</option>
                </select>
              </div>

              {/* Specific Weekdays Checkbox Selector */}
              {(recurrenceType === "SPECIFIC_WEEKDAYS" || recurrenceType === "WEEKLY") && (
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-on-surface-variant">
                    Active Days of Week
                  </label>
                  <div className="grid grid-cols-7 gap-1.5">
                    {[
                      { idx: 1, label: "Mon" },
                      { idx: 2, label: "Tue" },
                      { idx: 3, label: "Wed" },
                      { idx: 4, label: "Thu" },
                      { idx: 5, label: "Fri" },
                      { idx: 6, label: "Sat" },
                      { idx: 0, label: "Sun" },
                    ].map((d) => {
                      const isSelected = daysOfWeek.includes(d.idx);
                      return (
                        <button
                          key={d.idx}
                          type="button"
                          onClick={() => toggleDay(d.idx)}
                          className={`py-2 rounded-xl text-xs font-mono font-semibold transition-all border ${
                            isSelected
                              ? "bg-primary-container text-white border-primary shadow-sm"
                              : "bg-surface-container text-on-surface-variant border-outline-variant/20 hover:border-outline-variant/50"
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Start Date & End Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-on-surface-variant">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/20 text-on-surface text-sm focus:outline-none focus:border-primary font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-on-surface-variant">
                    End Date (Expiration • Optional)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="None (Runs indefinitely)"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/20 text-on-surface text-sm focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>

              {/* Subtasks Checklist Builder */}
              <div className="space-y-2 pt-2 border-t border-outline-variant/15">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-semibold text-on-surface-variant">
                    Auto-Generated Checklist Subtasks ({checklistItems.length})
                  </label>
                  <span className="text-[11px] font-mono text-outline">
                    Instantiated into every created task
                  </span>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {checklistItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-surface-container border border-outline-variant/10 text-xs text-on-surface"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-outline">{idx + 1}.</span>
                        <span>{item}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeChecklistItem(idx)}
                        className="text-on-surface-variant hover:text-red-400"
                      >
                        <Icon name="close" size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Checklist Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newChecklistInput}
                    onChange={(e) => setNewChecklistInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addChecklistItem();
                      }
                    }}
                    placeholder="Add subtask step (e.g. Verify upload)..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-surface-container border border-outline-variant/20 text-on-surface text-xs focus:outline-none focus:border-primary"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon="add"
                    onClick={addChecklistItem}
                  >
                    Add Step
                  </Button>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-outline-variant/15 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" icon="save">
                  {modalMode === "create" ? "Create Routine" : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
