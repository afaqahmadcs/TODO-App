"use client";

import React from "react";
import { Task, TaskStatus } from "@/types/task";
import { Checkbox } from "@/components/ui/Checkbox";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export interface TaskCardProps {
  task: Task;
  onToggleComplete?: (id: string) => void;
  onStatusChange?: (id: string, status: TaskStatus) => void;
  onClick?: (task: Task) => void;
  isSelected?: boolean;
  layoutMode?: "card" | "row";
  className?: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onStatusChange,
  onClick,
  isSelected = false,
  layoutMode = "card",
  className,
}) => {
  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((s) => s.completed || s.isCompleted).length;

  // Workspace color mapping
  const wsColors: Record<string, { bg: string; text: string; dot: string }> = {
    office: { bg: "bg-[#2563EB]/15", text: "text-[#93c5fd]", dot: "bg-[#2563EB]" },
    personal: { bg: "bg-[#8B5CF6]/15", text: "text-[#c4b5fd]", dot: "bg-[#8B5CF6]" },
    college: { bg: "bg-[#0D9488]/15", text: "text-[#5eead4]", dot: "bg-[#0D9488]" },
    "web-development": { bg: "bg-[#06B6D4]/15", text: "text-[#67e8f9]", dot: "bg-[#06B6D4]" },
  };
  const wsTheme = wsColors[task.workspaceId] || wsColors.office;

  // Priority styling
  const priorityTheme: Record<string, { bg: string; text: string }> = {
    high: { bg: "bg-rose-500/20", text: "text-rose-300" },
    medium: { bg: "bg-amber-500/20", text: "text-amber-300" },
    low: { bg: "bg-slate-500/20", text: "text-slate-300" },
    urgent: { bg: "bg-red-600/30", text: "text-red-400" },
  };
  const pTheme = priorityTheme[task.priority] || priorityTheme.medium;

  const normStatus = task.status === "done" ? "completed" : task.status;

  if (layoutMode === "row") {
    return (
      <div
        onClick={() => onClick?.(task)}
        className={cn(
          "group relative flex items-center justify-between p-3.5 rounded-xl transition-all cursor-pointer border",
          isSelected
            ? "bg-surface-container-high border-primary/50 shadow-md ring-1 ring-primary/40"
            : "bg-surface-container hover:bg-surface-container-high border-outline-variant/15 hover:border-outline-variant/30",
          task.isCompleted && "opacity-60 bg-surface-container/50",
          className
        )}
      >
        {/* Active row indicator */}
        {isSelected && (
          <div className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r" />
        )}

        <div className="flex items-center gap-3 min-w-0 flex-1 pl-1">
          {/* Checkbox */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete?.(task.id);
            }}
            className="shrink-0"
          >
            <Checkbox
              checked={task.isCompleted}
              onChange={() => onToggleComplete?.(task.id)}
              ariaLabel={`Mark "${task.title}" as completed`}
            />
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            {/* Title & Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "font-headline-sm text-sm font-semibold text-on-surface group-hover:text-primary transition-colors truncate",
                  task.isCompleted && "line-through text-outline"
                )}
              >
                {task.title}
              </span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1",
                  wsTheme.bg,
                  wsTheme.text
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full", wsTheme.dot)} />
                <span className="capitalize">{task.workspaceId.replace("-", " ")}</span>
              </span>
              {task.officePageId && (
                <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant text-[11px]">
                  {task.officePageId}
                </span>
              )}
            </div>

            {/* Meta Row: Due Time, Subtasks, Duration, Tags */}
            <div className="flex items-center gap-3 pt-1 text-outline text-xs">
              {task.dueTime && (
                <span className="flex items-center gap-1 text-secondary font-mono">
                  <Icon name="schedule" size={13} /> {task.dueTime}
                </span>
              )}
              {subtasks.length > 0 && (
                <span className="flex items-center gap-1 font-mono">
                  <Icon name="check_box" size={13} />
                  {completedSubtasks}/{subtasks.length} subtasks
                </span>
              )}
              {task.estimatedDurationMin && (
                <span className="flex items-center gap-1 font-mono">
                  <Icon name="timer" size={13} />
                  {task.estimatedDurationMin}m
                </span>
              )}
              {task.tags.slice(0, 2).map((tag, idx) => (
                <span key={idx} className="font-mono text-primary text-[10px]">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right side controls: Inline Status + Priority */}
        <div
          className="flex items-center gap-2 shrink-0 ml-2"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Inline Status Dropdown */}
          <select
            value={normStatus}
            onChange={(e) => onStatusChange?.(task.id, e.target.value as TaskStatus)}
            className="bg-surface-container-highest text-on-surface-variant text-[11px] font-mono px-2 py-1 rounded-lg border border-outline-variant/20 focus:outline-none cursor-pointer"
          >
            <option value="todo">TODO</option>
            <option value="in_progress">IN_PROGRESS</option>
            <option value="review">REVIEW</option>
            <option value="ready">READY</option>
            <option value="completed">COMPLETED</option>
          </select>

          {/* Priority Badge */}
          <span
            className={cn(
              "px-2.5 py-1 rounded text-xs font-medium uppercase font-mono",
              pTheme.bg,
              pTheme.text
            )}
          >
            {task.priority}
          </span>

          <button
            type="button"
            onClick={() => onClick?.(task)}
            className="p-1 text-outline group-hover:text-on-surface transition-colors"
            title="Inspect Task"
          >
            <Icon name="chevron_right" size={18} />
          </button>
        </div>
      </div>
    );
  }

  // Card Layout (for Kanban / Board mode)
  return (
    <div
      onClick={() => onClick?.(task)}
      className={cn(
        "group relative p-4 rounded-xl bg-surface-container hover:bg-surface-container-high border transition-all duration-150 flex flex-col gap-3 cursor-pointer shadow-sm",
        isSelected
          ? "border-primary shadow-md ring-1 ring-primary/40 bg-surface-container-high"
          : "border-outline-variant/15 hover:border-outline-variant/30",
        task.isCompleted && "opacity-60 bg-surface-container/50",
        className
      )}
    >
      {/* Top Row: Workspace Badge, Status Dropdown, Priority */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "px-2.5 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1.5",
            wsTheme.bg,
            wsTheme.text
          )}
        >
          <span className={cn("w-1.5 h-1.5 rounded-full", wsTheme.dot)} />
          <span className="capitalize">{task.workspaceId.replace("-", " ")}</span>
        </span>

        <div
          className="flex items-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <select
            value={normStatus}
            onChange={(e) => onStatusChange?.(task.id, e.target.value as TaskStatus)}
            className="bg-surface-container-highest text-on-surface-variant text-[10px] font-mono px-1.5 py-0.5 rounded border border-outline-variant/15 focus:outline-none cursor-pointer"
          >
            <option value="todo">TODO</option>
            <option value="in_progress">IN_PROG</option>
            <option value="review">REVIEW</option>
            <option value="ready">READY</option>
            <option value="completed">DONE</option>
          </select>

          <span
            className={cn(
              "px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold",
              pTheme.bg,
              pTheme.text
            )}
          >
            {task.priority}
          </span>
        </div>
      </div>

      {/* Main Content: Checkbox & Task Title */}
      <div className="flex items-start gap-3">
        <div
          className="pt-0.5"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete?.(task.id);
          }}
        >
          <Checkbox
            checked={task.isCompleted}
            onChange={() => onToggleComplete?.(task.id)}
            ariaLabel={`Mark "${task.title}" as completed`}
          />
        </div>
        <p
          className={cn(
            "text-sm font-semibold text-on-surface leading-snug flex-1 transition-all group-hover:text-primary",
            task.isCompleted && "line-through text-outline"
          )}
        >
          {task.title}
        </p>
      </div>

      {/* Description Snippet if present */}
      {task.description && (
        <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Tags & Meta Details Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10 text-xs mt-auto">
        {/* Tags & Subtasks count */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {subtasks.length > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-surface-container-highest font-mono text-[10px] text-on-surface-variant flex items-center gap-1">
              <Icon name="check_box" size={11} />
              {completedSubtasks}/{subtasks.length}
            </span>
          )}
          {task.tags.slice(0, 2).map((tag, idx) => (
            <span
              key={idx}
              className="px-1.5 py-0.5 rounded bg-surface-container-highest font-mono text-[10px] text-primary"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Due Time / Estimate */}
        <div className="flex items-center gap-1.5 text-outline font-mono text-[11px]">
          {task.dueTime && (
            <span className="flex items-center gap-1 text-secondary">
              <Icon name="schedule" size={13} />
              <span>{task.dueTime}</span>
            </span>
          )}
          {task.estimatedDurationMin && (
            <span className="px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant">
              {task.estimatedDurationMin}m
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
