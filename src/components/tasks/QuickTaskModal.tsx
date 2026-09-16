"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { WorkspaceType } from "@/types/workspace";
import { TaskPriority } from "@/types/task";
import { WORKSPACES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface QuickTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated?: (task: {
    title: string;
    workspaceId: WorkspaceType;
    priority: TaskPriority;
    estimate: string;
  }) => void;
}

export const QuickTaskModal: React.FC<QuickTaskModalProps> = ({
  isOpen,
  onClose,
  onTaskCreated,
}) => {
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceType>("office");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [estimate, setEstimate] = useState("30 mins");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (onTaskCreated) {
      onTaskCreated({
        title,
        workspaceId: selectedWorkspace,
        priority,
        estimate,
      });
    }

    setTitle("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-surface-container-low border border-outline-variant/30 p-space-lg shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/15">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary-container/20 text-primary">
              <Icon name="add_task" size={20} />
            </span>
            <h3 className="font-headline-sm text-base font-bold text-on-surface">
              Universal Quick Task
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

        <form onSubmit={handleSubmit} className="mt-space-md flex flex-col gap-space-md">
          {/* Workspace Target Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider font-mono">
              Workspace Target
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

          {/* Task Title Input */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider font-mono">
              Task Title
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

          {/* Priority Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider font-mono">
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPriority("high")}
                className={cn(
                  "py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border transition-all",
                  priority === "high"
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm"
                    : "bg-surface-container-high text-on-surface border-outline-variant/20"
                )}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>High</span>
              </button>
              <button
                type="button"
                onClick={() => setPriority("medium")}
                className={cn(
                  "py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border transition-all",
                  priority === "medium"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm"
                    : "bg-surface-container-high text-on-surface border-outline-variant/20"
                )}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Medium</span>
              </button>
              <button
                type="button"
                onClick={() => setPriority("low")}
                className={cn(
                  "py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border transition-all",
                  priority === "low"
                    ? "bg-slate-500/20 text-slate-300 border-slate-500/50 shadow-sm"
                    : "bg-surface-container-high text-on-surface border-outline-variant/20"
                )}
              >
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>Low</span>
              </button>
            </div>
          </div>

          {/* Estimate input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider font-mono">
              Estimated Duration
            </label>
            <div className="relative">
              <input
                type="text"
                value={estimate}
                onChange={(e) => setEstimate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-surface-container-lowest text-on-surface text-xs border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary-container"
              />
              <span className="absolute right-3 top-2 text-outline pointer-events-none">
                <Icon name="timer" size={16} />
              </span>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-space-sm flex items-center justify-end gap-2 border-t border-outline-variant/15">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon="check">
              Create Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
