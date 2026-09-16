"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { OfficePageDailyStatus, DailyChecklistStep } from "@/types/office";

interface DailyContentChecklistProps {
  dailyStatuses: OfficePageDailyStatus[];
  onToggleStep: (pageId: string, stepId: string, completed: boolean) => void;
  onMarkPageComplete?: (pageId: string) => void;
  onOpenTaskDetail?: (taskId: string) => void;
}

export function DailyContentChecklist({
  dailyStatuses,
  onToggleStep,
  onMarkPageComplete,
  onOpenTaskDetail,
}: DailyContentChecklistProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center">
            <Icon name="checklist" size={18} />
          </span>
          <h2 className="font-headline text-base font-bold text-on-surface">
            Daily Content Publishing Checklist (7 Steps)
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-mono text-[10px]">
            Standard Workflow
          </span>
        </div>
        <span className="text-xs text-outline font-mono">
          Check new content → Select → Edit → Caption → Hashtags → Upload → Verify
        </span>
      </div>

      {/* 8-page checklist cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {dailyStatuses.map((pageStatus) => {
          const completedCount = pageStatus.steps.filter((s) => s.completed).length;
          const totalCount = pageStatus.steps.length;
          const pct = Math.round((completedCount / totalCount) * 100);
          const isFullyDispatched = completedCount === totalCount || pageStatus.isFullyDispatched;

          return (
            <Card
              key={pageStatus.pageId}
              variant="low"
              className={`p-4 flex flex-col justify-between border transition-all ${
                isFullyDispatched
                  ? "border-secondary/30 bg-surface-container-low/90"
                  : "border-outline-variant/15"
              }`}
            >
              <div>
                {/* Page header */}
                <div className="flex items-center justify-between gap-1 mb-2 pb-2 border-b border-outline-variant/10">
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isFullyDispatched
                          ? "bg-secondary"
                          : completedCount > 0
                          ? "bg-primary animate-pulse"
                          : "bg-outline"
                      }`}
                    />
                    <span className="font-headline text-sm font-bold text-on-surface truncate">
                      {pageStatus.pageTitle}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold uppercase ${
                      isFullyDispatched
                        ? "bg-secondary/15 text-secondary"
                        : completedCount > 0
                        ? "bg-primary-container/20 text-primary"
                        : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    {isFullyDispatched ? "Dispatched" : completedCount > 0 ? "In Prod" : "Queued"}
                  </span>
                </div>

                {/* Task title and time */}
                <div className="mb-3">
                  <div
                    onClick={() => pageStatus.taskId && onOpenTaskDetail?.(pageStatus.taskId)}
                    className="text-xs font-semibold text-on-surface hover:text-primary transition-colors line-clamp-1 cursor-pointer"
                  >
                    {pageStatus.taskTitle}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-outline mt-0.5">
                    <span>Slot: {pageStatus.scheduledTime || "16:00"}</span>
                    <span className="text-secondary">{completedCount} / {totalCount} Done ({pct}%)</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isFullyDispatched ? "bg-secondary" : "bg-primary"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* 7 Interactive Checklist Steps */}
                <div className="space-y-1.5">
                  {pageStatus.steps.map((step: DailyChecklistStep) => (
                    <label
                      key={step.id}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        step.completed
                          ? "bg-surface-container/50 text-secondary"
                          : "hover:bg-surface-container text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={step.completed}
                        onChange={(e) =>
                          onToggleStep(pageStatus.pageId, step.id, e.target.checked)
                        }
                        className="rounded border-outline-variant text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer accent-indigo-500"
                      />
                      <span
                        className={`truncate ${
                          step.completed ? "line-through text-outline font-normal" : "font-medium"
                        }`}
                      >
                        {step.title}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="mt-3 pt-2.5 border-t border-outline-variant/10 flex items-center justify-between">
                {isFullyDispatched ? (
                  <span className="flex items-center gap-1 text-[11px] text-secondary font-mono">
                    <Icon name="verified" size={14} />
                    <span>Live &amp; Verified</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onMarkPageComplete?.(pageStatus.pageId)}
                    className="text-[11px] font-semibold text-primary hover:text-white flex items-center gap-1 hover:underline transition-colors"
                  >
                    <Icon name="done_all" size={14} />
                    <span>Complete All 7 Steps</span>
                  </button>
                )}

                {pageStatus.taskId && (
                  <button
                    type="button"
                    onClick={() => onOpenTaskDetail?.(pageStatus.taskId!)}
                    className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
                    title="View task detail"
                  >
                    <Icon name="open_in_new" size={14} />
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
