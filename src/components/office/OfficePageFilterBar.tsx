"use client";

import React from "react";
import { Icon } from "@/components/ui/Icon";
import { OFFICE_PAGES } from "@/lib/constants";
import { PageStatusDetail, OfficePlatform } from "@/types/office";

interface OfficePageFilterBarProps {
  selectedPage: string;
  onSelectPage: (pageId: string) => void;
  pageStatuses: PageStatusDetail[];
  totalTasksCount: number;
  selectedPlatform: OfficePlatform;
  onSelectPlatform: (platform: OfficePlatform) => void;
}

export function OfficePageFilterBar({
  selectedPage,
  onSelectPage,
  pageStatuses,
  totalTasksCount,
  selectedPlatform,
  onSelectPlatform,
}: OfficePageFilterBarProps) {
  const getStatusDetail = (id: string) => pageStatuses.find((p) => p.pageId === id);

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none">
      {/* 8 Page Filter Tabs */}
      <div className="flex items-center gap-1.5 min-w-max">
        {/* All Pages Tab */}
        <button
          type="button"
          onClick={() => onSelectPage("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm ${
            selectedPage === "all"
              ? "bg-primary-container text-on-primary-container ring-1 ring-primary-container"
              : "bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span>All Pages</span>
          <span
            className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] ${
              selectedPage === "all"
                ? "bg-on-primary-container text-primary-container font-bold"
                : "bg-surface-container-highest text-on-surface"
            }`}
          >
            {totalTasksCount}
          </span>
        </button>

        {/* 8 Individual Pages */}
        {OFFICE_PAGES.map((page) => {
          const detail = getStatusDetail(page.id);
          const isSelected = selectedPage === page.id;
          const isSuno = page.id === "suno-music";
          const isCompleted = detail?.status === "completed";
          const isInProgress = detail?.status === "in_progress";

          if (isSuno) {
            return (
              <button
                key={page.id}
                type="button"
                onClick={() => onSelectPage(page.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm ${
                  isSelected
                    ? "bg-purple-600 text-white ring-2 ring-purple-400/40"
                    : "bg-purple-500/15 text-purple-300 hover:bg-purple-500/25"
                }`}
              >
                <Icon name="graphic_eq" size={14} />
                <span>Suno Music</span>
                <span className="px-1.5 py-0.2 rounded-full bg-purple-500/30 text-purple-200 font-mono text-[10px]">
                  {detail?.totalTasks || 4} Assets
                </span>
              </button>
            );
          }

          return (
            <button
              key={page.id}
              type="button"
              onClick={() => onSelectPage(page.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm ${
                isSelected
                  ? "bg-surface-container-high text-on-surface border border-primary-container ring-1 ring-primary-container"
                  : "bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isCompleted ? "bg-secondary" : isInProgress ? "bg-primary" : "bg-outline"
                }`}
              />
              <span>{page.title}</span>

              {isCompleted ? (
                <Icon name="check" size={14} className="text-secondary" />
              ) : isInProgress ? (
                <span className="px-1.5 py-0.2 rounded bg-surface-container-highest font-mono text-[9px] text-primary">
                  In Prog
                </span>
              ) : (
                <span className="font-mono text-[10px] text-outline">
                  {detail?.totalTasks || 0}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Platform Filter Chips */}
      <div className="flex items-center gap-1.5 shrink-0 pl-1 border-t lg:border-t-0 pt-2 lg:pt-0 border-outline-variant/10">
        <span className="text-outline font-mono text-[11px] uppercase mr-1">Platform:</span>
        {(["all", "reels", "tiktok", "shorts"] as OfficePlatform[]).map((platform) => (
          <button
            key={platform}
            type="button"
            onClick={() => onSelectPlatform(platform)}
            className={`px-2 py-1 rounded-lg font-mono text-[11px] transition-colors uppercase ${
              selectedPlatform === platform
                ? "bg-primary-container text-white font-bold"
                : "bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
            }`}
          >
            {platform}
          </button>
        ))}
      </div>
    </div>
  );
}
