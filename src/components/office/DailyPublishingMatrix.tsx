"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { PageStatusDetail } from "@/types/office";

interface DailyPublishingMatrixProps {
  pageStatuses: PageStatusDetail[];
  selectedPage: string;
  onSelectPage: (pageId: string) => void;
  dispatchedCount: number;
  totalCount: number;
  onToggleChecklistView?: () => void;
  isChecklistViewActive?: boolean;
}

export function DailyPublishingMatrix({
  pageStatuses,
  selectedPage,
  onSelectPage,
  dispatchedCount,
  totalCount,
  onToggleChecklistView,
  isChecklistViewActive = false,
}: DailyPublishingMatrixProps) {
  return (
    <Card variant="low" className="p-3.5 sm:p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Icon name="hub" size={18} />
          </span>
          <span className="text-sm font-bold text-on-surface font-headline">
            Daily Publishing Matrix (8 Pages)
          </span>
          <span className="px-2 py-0.5 bg-surface-container-highest text-on-surface-variant font-mono text-[11px] rounded-full font-semibold">
            {dispatchedCount} / {totalCount} Dispatched
          </span>
        </div>

        {onToggleChecklistView && (
          <button
            type="button"
            onClick={onToggleChecklistView}
            className={`text-xs font-semibold flex items-center gap-1 transition-colors px-2.5 py-1 rounded-lg ${
              isChecklistViewActive
                ? "bg-primary-container text-white"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            }`}
          >
            <span>{isChecklistViewActive ? "Hide Checklist Details" : "Expand Checklist Details"}</span>
            <Icon name={isChecklistViewActive ? "keyboard_arrow_up" : "keyboard_arrow_down"} size={16} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {pageStatuses.map((page) => {
          const isSelected = selectedPage === page.pageId;
          const isCompleted = page.status === "completed";
          const isInProgress = page.status === "in_progress";

          return (
            <div
              key={page.pageId}
              onClick={() => onSelectPage(page.pageId)}
              className={`p-2.5 rounded-xl bg-surface-container flex flex-col gap-1.5 transition-all cursor-pointer shadow-sm hover:-translate-y-0.5 ${
                isSelected
                  ? "border border-primary-container ring-2 ring-primary-container/40 bg-surface-container-high"
                  : "border border-outline-variant/15 hover:border-outline-variant/40"
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-semibold text-on-surface truncate">
                  {page.pageTitle.replace(" Page", "").replace(" Fanz", "").replace(" Fans", " Fans")}
                </span>
                {isCompleted ? (
                  <span className="text-secondary">
                    <Icon name="check_circle" size={16} />
                  </span>
                ) : isInProgress ? (
                  <span className="text-primary animate-pulse">
                    <Icon name="timelapse" size={16} />
                  </span>
                ) : (
                  <span className="text-outline">
                    <Icon name="schedule" size={16} />
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] font-mono block truncate ${
                  isCompleted
                    ? "text-secondary font-medium"
                    : isInProgress
                    ? "text-primary font-medium"
                    : "text-on-surface-variant"
                }`}
              >
                {page.summary}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
