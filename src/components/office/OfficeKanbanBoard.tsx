"use client";

import React from "react";
import { Icon } from "@/components/ui/Icon";
import { Task } from "@/types/task";
import { OFFICE_WORKFLOW_STAGES, officeService } from "@/services/officeService";
import { OfficeWorkflowStage } from "@/types/office";
import { OFFICE_PAGES } from "@/lib/constants";

interface OfficeKanbanBoardProps {
  tasks: Task[];
  onOpenTaskDetail: (task: Task) => void;
  onAdvanceStage: (taskId: string, newStage: OfficeWorkflowStage) => void;
  onRetreatStage: (taskId: string, newStage: OfficeWorkflowStage) => void;
  onQuickAddAtStage: (stage: OfficeWorkflowStage) => void;
  onToggleSubtask?: (subtaskId: string) => void;
}

export function OfficeKanbanBoard({
  tasks,
  onOpenTaskDetail,
  onAdvanceStage,
  onRetreatStage,
  onQuickAddAtStage,
  onToggleSubtask,
}: OfficeKanbanBoardProps) {
  const getPageInfo = (pageId?: string) => {
    return OFFICE_PAGES.find((p) => p.id === pageId);
  };

  // Group tasks into the 6 workflow stages
  const getTasksForStage = (stage: OfficeWorkflowStage) => {
    return tasks.filter((t) => {
      const taskStage = (t.stage || "").toUpperCase();
      if (taskStage === stage) return true;

      // Fallback status mapping if stage is not set explicitly
      if (stage === "PUBLISHED") {
        return t.status === "completed" || t.status === "published" || taskStage === "DELIVERED";
      }
      if (stage === "READY") {
        return t.status === "ready" || taskStage === "EXPORT";
      }
      if (stage === "REVIEW") {
        return t.status === "review";
      }
      if (stage === "IN_PROGRESS") {
        return t.status === "in_progress" || taskStage === "DESIGN" || taskStage === "RECORDING";
      }
      if (stage === "TODO") {
        return t.status === "todo" && taskStage !== "IDEAS" && taskStage !== "STRATEGY";
      }
      if (stage === "IDEAS") {
        return taskStage === "IDEAS" || taskStage === "STRATEGY";
      }
      return false;
    });
  };

  const getStageDotColor = (stage: OfficeWorkflowStage) => {
    switch (stage) {
      case "IDEAS":
        return "bg-outline";
      case "TODO":
        return "bg-primary";
      case "IN_PROGRESS":
        return "bg-primary-container animate-pulse";
      case "REVIEW":
        return "bg-amber-400";
      case "READY":
        return "bg-secondary";
      case "PUBLISHED":
        return "bg-emerald-400";
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="font-headline text-base font-bold text-on-surface">
            Content Production Stages
          </h2>
          <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-mono text-[11px] font-semibold">
            Active 6-Stage Pipeline
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-outline text-xs font-mono">
          <Icon name="swap_horiz" size={16} />
          <span className="hidden sm:inline">Use arrows to advance tasks between stages</span>
        </div>
      </div>

      {/* 6 Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start">
        {OFFICE_WORKFLOW_STAGES.map((stage, colIdx) => {
          const stageTasks = getTasksForStage(stage);
          const isFirstCol = colIdx === 0;
          const isLastCol = colIdx === OFFICE_WORKFLOW_STAGES.length - 1;

          return (
            <div
              key={stage}
              className="flex flex-col gap-3 rounded-2xl bg-surface-container-low p-3.5 shadow-sm border border-outline-variant/15 min-h-[300px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1 pb-1 border-b border-outline-variant/10">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${getStageDotColor(stage)}`} />
                  <span className="text-xs font-bold font-mono text-on-surface uppercase tracking-wider">
                    {stage.replace("_", " ")}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-mono text-[10px] font-semibold">
                  {stageTasks.length}
                </span>
              </div>

              {/* Tasks in Column */}
              <div className="flex flex-col gap-2.5 flex-1">
                {stageTasks.map((task) => {
                  const page = getPageInfo(task.officePageId || task.pageId || undefined);
                  const completedSubtasks = (task.subtasks || []).filter((st) => st.completed).length;
                  const totalSubtasks = (task.subtasks || []).length;

                  return (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-all shadow-sm border border-outline-variant/10 flex flex-col gap-2 group cursor-pointer"
                      onClick={() => onOpenTaskDetail(task)}
                    >
                      {/* Card Top: Page badge + Move controls */}
                      <div className="flex items-center justify-between gap-1">
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono text-[10px] font-semibold truncate max-w-[120px]">
                          {page?.shortTitle || "Office Page"}
                        </span>

                        <div
                          className="flex items-center gap-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {!isFirstCol && (
                            <button
                              type="button"
                              onClick={() => {
                                const prev = officeService.retreatStage(stage);
                                onRetreatStage(task.id, prev);
                              }}
                              className="p-1 rounded hover:bg-surface-container-highest text-outline hover:text-on-surface transition-colors"
                              title={`Move back to ${OFFICE_WORKFLOW_STAGES[colIdx - 1]}`}
                            >
                              <Icon name="arrow_back" size={14} />
                            </button>
                          )}
                          {!isLastCol && (
                            <button
                              type="button"
                              onClick={() => {
                                const next = officeService.advanceStage(stage);
                                onAdvanceStage(task.id, next);
                              }}
                              className="p-1 rounded hover:bg-surface-container-highest text-primary hover:text-white transition-colors"
                              title={`Advance to ${OFFICE_WORKFLOW_STAGES[colIdx + 1]}`}
                            >
                              <Icon name="arrow_forward" size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Card Title */}
                      <p className="text-xs font-semibold text-on-surface leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {task.title}
                      </p>

                      {/* Subtasks Micro-Panel (as featured in Stitch design) */}
                      {totalSubtasks > 0 && (
                        <div
                          className="p-2 rounded-lg bg-surface-container-low/70 flex flex-col gap-1 my-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between text-[10px] text-outline font-mono">
                            <span className="uppercase font-semibold">Subtasks</span>
                            <span className="text-primary font-bold">
                              {completedSubtasks} / {totalSubtasks}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {(task.subtasks || []).slice(0, 3).map((st) => (
                              <div
                                key={st.id}
                                onClick={() => onToggleSubtask?.(st.id)}
                                className="flex items-center gap-1.5 text-[11px] hover:text-primary transition-colors cursor-pointer"
                              >
                                <Icon
                                  name={st.completed ? "check_box" : "check_box_outline_blank"}
                                  size={13}
                                  className={st.completed ? "text-secondary" : "text-outline"}
                                />
                                <span
                                  className={`truncate ${
                                    st.completed ? "line-through text-outline" : "text-on-surface-variant"
                                  }`}
                                >
                                  {st.title}
                                </span>
                              </div>
                            ))}
                            {totalSubtasks > 3 && (
                              <span className="text-[10px] text-outline pl-4 font-mono">
                                +{totalSubtasks - 3} more subtasks...
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Card Footer */}
                      <div className="flex items-center justify-between pt-1 border-t border-outline-variant/10 text-[10px] text-outline font-mono">
                        <div className="flex items-center gap-1 truncate max-w-[110px]">
                          {task.dueTime && (
                            <span className="text-secondary">{task.dueTime}</span>
                          )}
                          {task.tags.length > 0 && (
                            <span className="bg-surface-container-highest px-1 py-0.2 rounded text-[9px]">
                              #{task.tags[0]}
                            </span>
                          )}
                        </div>

                        {task.priority === "urgent" || task.priority === "high" ? (
                          <span className="px-1 py-0.2 rounded bg-rose-500/15 text-rose-400 font-bold uppercase text-[9px]">
                            {task.priority}
                          </span>
                        ) : (
                          <span>{task.estimatedDurationMin || 20}m</span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {stageTasks.length === 0 && (
                  <div className="p-4 rounded-xl border border-dashed border-outline-variant/20 flex flex-col items-center justify-center text-center text-outline text-xs">
                    <span>No tasks</span>
                  </div>
                )}
              </div>

              {/* Add Task Button at bottom of column */}
              <button
                type="button"
                onClick={() => onQuickAddAtStage(stage)}
                className="w-full py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-mono text-xs flex items-center justify-center gap-1 transition-colors mt-auto border border-outline-variant/10"
              >
                <Icon name="add" size={14} />
                <span>Add to {stage.replace("_", " ")}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
