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
  onRenamePage?: (pageId: string, currentTitle: string) => void;
}

export function DailyPublishingMatrix({
  pageStatuses,
  selectedPage,
  onSelectPage,
  dispatchedCount,
  totalCount,
  onToggleChecklistView,
  isChecklistViewActive = false,
  onRenamePage,
}: DailyPublishingMatrixProps) {
  // Separate into High Priority Client Reels (5), Medium Priority Facebook (2), and Music (1)
  const clientReels = pageStatuses.slice(0, 5);
  const fbPages = pageStatuses.slice(5, 7);
  const musicPage = pageStatuses.slice(7, 8);

  const renderPageCard = (page: PageStatusDetail) => {
    const isSelected = selectedPage === page.pageId;
    const isCompleted = page.status === "completed";
    const isInProgress = page.status === "in_progress";

    return (
      <div
        key={page.pageId}
        onClick={() => onSelectPage(page.pageId)}
        className={`p-3 rounded-xl bg-surface-container flex flex-col justify-between gap-2 transition-all cursor-pointer shadow-sm hover:-translate-y-0.5 ${
          isSelected
            ? "border border-primary-container ring-2 ring-primary-container/40 bg-surface-container-high"
            : "border border-outline-variant/15 hover:border-outline-variant/40"
        }`}
      >
        <div className="flex items-start justify-between gap-1.5">
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-on-surface truncate font-headline" title={page.pageTitle}>
              {page.pageTitle}
            </span>
            <span className="text-[10px] font-mono text-outline uppercase tracking-wider">
              {page.priority === "high" ? "High Priority" : "Medium Priority"}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {page.isEditable && onRenamePage && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRenamePage(page.pageId, page.pageTitle);
                }}
                className="p-1 rounded text-outline hover:text-primary hover:bg-surface-container-highest transition-colors"
                title="Rename page"
              >
                <Icon name="edit" size={13} />
              </button>
            )}
            {isCompleted ? (
              <span className="text-secondary" title="Completed">
                <Icon name="check_circle" size={17} />
              </span>
            ) : isInProgress ? (
              <span className="text-primary animate-pulse" title="In Progress">
                <Icon name="timelapse" size={17} />
              </span>
            ) : (
              <span className="text-outline" title="Pending">
                <Icon name="radio_button_unchecked" size={17} />
              </span>
            )}
          </div>
        </div>

        {/* Page status label according to specification */}
        <div className="flex items-center justify-between pt-1 border-t border-outline-variant/10 text-[11px] font-mono">
          <span
            className={`font-semibold flex items-center gap-1 ${
              isCompleted
                ? "text-secondary"
                : isInProgress
                ? "text-primary"
                : "text-on-surface-variant"
            }`}
          >
            {isCompleted ? "✓ Completed" : isInProgress ? "⚡ In Progress" : "○ Pending"}
          </span>
          <span className="text-outline text-[10px]">
            {page.completedTasks}/{page.totalTasks || 1}
          </span>
        </div>
      </div>
    );
  };

  return (
    <Card variant="low" className="p-3.5 sm:p-4 shadow-sm space-y-3">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Icon name="hub" size={18} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-on-surface font-headline">
                Page-Wise Daily Completion Matrix
              </span>
              <span className="px-2 py-0.5 bg-surface-container-highest text-on-surface-variant font-mono text-[11px] rounded-full font-semibold">
                {dispatchedCount} / {totalCount} Completed
              </span>
            </div>
          </div>
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
            <span>{isChecklistViewActive ? "Hide Checklist Details" : "Expand Daily Checklist"}</span>
            <Icon name={isChecklistViewActive ? "keyboard_arrow_up" : "keyboard_arrow_down"} size={16} />
          </button>
        )}
      </div>

      {/* High Priority Client Reels Strip (5 pages) */}
      <div>
        <div className="flex items-center justify-between mb-1.5 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">
              High Priority — Client Reels (5 Channels)
            </span>
          </div>
          <span className="text-[10px] font-mono text-outline">
            Daily Reel: Prepare → Edit → Caption → Hashtags → Upload → Verify
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {clientReels.map(renderPageCard)}
        </div>
      </div>

      {/* Medium Priority Facebook & Music (3 pages) */}
      <div className="pt-2 border-t border-outline-variant/10">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-400">
              Medium Priority — Facebook &amp; Music (3 Channels)
            </span>
          </div>
          <span className="text-[10px] font-mono text-outline">
            Facebook Fan Distribution &amp; Suno Visual Production
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {fbPages.map(renderPageCard)}
          {musicPage.map(renderPageCard)}
        </div>
      </div>
    </Card>
  );
}
