"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { WorkspaceType, OfficePageId, OfficePage } from "@/types/workspace";
import { TaskPriority, CreateTaskInput, Task } from "@/types/task";
import { WORKSPACES, OFFICE_PAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { taskService } from "@/services/taskService";

export interface QuickTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated?: (createdTask: Task) => void;
  defaultWorkspace?: WorkspaceType;
  defaultPage?: OfficePageId | string;
  defaultStage?: string;
}

export const QuickTaskModal: React.FC<QuickTaskModalProps> = ({
  isOpen,
  onClose,
  onTaskCreated,
  defaultWorkspace = "office",
  defaultPage = "",
  defaultStage,
}) => {
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceType>(defaultWorkspace);
  const [selectedOfficePage, setSelectedOfficePage] = useState<OfficePageId | "">(
    (defaultPage as OfficePageId) || ""
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueTime, setDueTime] = useState("17:00");
  const [estimatedDurationMin, setEstimatedDurationMin] = useState(30);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const clean = tagInput.trim().replace(/^#/, "");
    if (!tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    setSubtasks([...subtasks, subtaskInput.trim()]);
    setSubtaskInput("");
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload: CreateTaskInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        workspaceId: selectedWorkspace,
        officePageId: selectedWorkspace === "office" && selectedOfficePage ? selectedOfficePage : undefined,
        stage: defaultStage,
        priority,
        dueDate,
        dueTime,
        estimatedDurationMin,
        tags: tags.length > 0 ? tags : ["task"],
        subtasks: subtasks.length > 0 ? subtasks : undefined,
        notes: notes.trim() || undefined,
      };

      const created = await taskService.createTask(payload);
      if (created) {
        onTaskCreated?.(created);
        // Reset form
        setTitle("");
        setDescription("");
        setTags([]);
        setSubtasks([]);
        setNotes("");
        onClose();
      }
    } catch (err) {
      console.error("Failed to create task:", err);
      setErrorMessage("Could not create task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-surface-container-low border border-outline-variant/30 p-space-lg shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/15">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary-container/20 text-primary">
              <Icon name="add_task" size={20} />
            </span>
            <h3 className="font-headline-sm text-base font-bold text-on-surface">
              Create New Task
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <Icon name="error" size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-space-md flex flex-col gap-space-md">
          {/* Workspace Target Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-outline uppercase tracking-wider font-mono">
              Workspace Target *
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {WORKSPACES.map((w) => {
                const isSelected = selectedWorkspace === w.id;
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setSelectedWorkspace(w.id)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5",
                      isSelected
                        ? "bg-primary-container text-white border-primary-container shadow-sm font-semibold"
                        : "bg-surface-container-high text-on-surface border-outline-variant/20 hover:bg-surface-container-highest"
                    )}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: isSelected ? "#ffffff" : w.color }}
                    />
                    <span>{w.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Office Page Selection if Office Workspace */}
          {selectedWorkspace === "office" && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-outline uppercase tracking-wider font-mono">
                Office Page Context
              </label>
              <select
                value={selectedOfficePage}
                onChange={(e) => setSelectedOfficePage(e.target.value as OfficePageId)}
                className="w-full px-3 py-2 rounded-lg bg-surface-container text-on-surface text-xs border border-outline-variant/20 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">None / General Office Work</option>
                {OFFICE_PAGES.map((p: OfficePage) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Task Title Input */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-outline uppercase tracking-wider font-mono">
              Task Title *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be accomplished?"
              className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline border border-outline-variant/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>

          {/* Description Input */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-outline uppercase tracking-wider font-mono">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key objectives, reference links, or context..."
              className="w-full px-3.5 py-2 rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline border border-outline-variant/30 text-xs focus:outline-none focus:ring-1 focus:ring-primary-container resize-y"
            />
          </div>

          {/* Priority & Duration Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Priority Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-outline uppercase tracking-wider font-mono">
                Priority Level
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["high", "medium", "low"] as TaskPriority[]).map((p) => {
                  const active = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={cn(
                        "py-1.5 px-2 rounded-lg text-xs font-mono uppercase font-semibold border transition-all flex items-center justify-center gap-1",
                        p === "high" &&
                          (active
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/50"
                            : "bg-surface-container text-outline border-outline-variant/20"),
                        p === "medium" &&
                          (active
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                            : "bg-surface-container text-outline border-outline-variant/20"),
                        p === "low" &&
                          (active
                            ? "bg-slate-500/20 text-slate-300 border-slate-500/50"
                            : "bg-surface-container text-outline border-outline-variant/20")
                      )}
                    >
                      <span>{p}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Estimated Duration */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-outline uppercase tracking-wider font-mono">
                Duration (Minutes)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={5}
                  step={5}
                  value={estimatedDurationMin}
                  onChange={(e) => setEstimatedDurationMin(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-surface-container text-on-surface text-xs font-mono border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary-container"
                />
                <span className="absolute right-3 top-2 text-outline pointer-events-none">
                  <Icon name="timer" size={16} />
                </span>
              </div>
            </div>
          </div>

          {/* Due Date and Due Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-outline uppercase tracking-wider font-mono">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-surface-container text-on-surface text-xs font-mono border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary-container"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-outline uppercase tracking-wider font-mono">
                Due Time
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-surface-container text-on-surface text-xs font-mono border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary-container"
              />
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-outline uppercase tracking-wider font-mono">
              Subtasks Checklist
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Add a subtask..."
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-xs text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary-container"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 rounded-lg bg-surface-container text-xs font-medium text-on-surface hover:bg-surface-container-high"
              >
                + Add
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="flex flex-col gap-1 pt-1 max-h-28 overflow-y-auto">
                {subtasks.map((sub, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-2 py-1 rounded bg-surface-container text-xs"
                  >
                    <span className="truncate">• {sub}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(idx)}
                      className="text-outline hover:text-rose-400 p-0.5"
                    >
                      <Icon name="close" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Tags */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-outline uppercase tracking-wider font-mono">
                Tags
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="tag (press enter)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-xs text-on-surface border border-outline-variant/30 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-2 py-1.5 bg-surface-container text-xs text-on-surface rounded"
                >
                  Add
                </button>
              </div>
              <div className="flex items-center gap-1 flex-wrap pt-1">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded bg-surface-container text-primary font-mono text-[10px] flex items-center gap-1"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="text-outline hover:text-rose-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-outline uppercase tracking-wider font-mono">
                Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Important reference notes..."
                className="w-full px-3 py-1.5 rounded-lg bg-surface-container-lowest text-xs text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary-container resize-y"
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-space-sm flex items-center justify-end gap-2 border-t border-outline-variant/15 mt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={isSubmitting ? "hourglass_top" : "check"}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
