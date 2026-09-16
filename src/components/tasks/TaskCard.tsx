"use client";

import React from "react";
import { Task } from "@/types/task";
import { Checkbox } from "@/components/ui/Checkbox";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export interface TaskCardProps {
  task: Task;
  onToggleComplete?: (id: string) => void;
  className?: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  className,
}) => {
  return (
    <div
      className={cn(
        "group relative p-3.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 shadow-sm transition-all duration-150 flex flex-col gap-2.5",
        task.isCompleted && "opacity-60 bg-surface-container/60",
        className
      )}
    >
      {/* Top Row: Workspace Badge, Priority, and Drag Handle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="workspace" workspace={task.workspaceId}>
            {task.workspaceId.toUpperCase()}
          </Badge>
          <Badge variant="priority" priority={task.priority} showPulse={!task.isCompleted} />
        </div>
        <span className="text-outline-variant group-hover:text-outline cursor-grab transition-colors">
          <Icon name="drag_indicator" size={16} />
        </span>
      </div>

      {/* Main Content: Checkbox & Task Title */}
      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          <Checkbox
            checked={task.isCompleted}
            onChange={() => onToggleComplete?.(task.id)}
            ariaLabel={`Mark "${task.title}" as completed`}
          />
        </div>
        <p
          className={cn(
            "text-sm font-medium text-on-surface leading-snug flex-1 transition-all",
            task.isCompleted && "line-through text-on-surface-variant"
          )}
        >
          {task.title}
        </p>
      </div>

      {/* Tags & Meta Details */}
      <div className="flex items-center justify-between pt-1 border-t border-outline-variant/10 text-xs">
        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {task.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="px-1.5 py-0.5 rounded bg-surface-container-highest font-mono text-[10px] text-on-surface-variant"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Due Time / Estimate */}
        <div className="flex items-center gap-1.5 text-outline font-mono text-[11px]">
          {task.dueTime && (
            <span className="flex items-center gap-1 text-secondary">
              <Icon name="schedule" size={14} />
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
