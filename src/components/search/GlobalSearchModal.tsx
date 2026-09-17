"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { searchService } from "@/services/searchService";
import {
  SearchCategory,
  SearchResultItem,
  GroupedSearchResults,
} from "@/types/search";
import { cn } from "@/lib/utils";

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTask?: (taskId: string) => void;
}

const EMPTY_RESULTS: GroupedSearchResults = {
  TASKS: [],
  PROJECTS: [],
  PAGES: [],
  NOTES: [],
  "VLOG ENTRIES": [],
};

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTask,
}) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<SearchCategory>("all");
  const [rawResults, setRawResults] = useState<GroupedSearchResults>(EMPTY_RESULTS);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return EMPTY_RESULTS;
    return rawResults;
  }, [query, rawResults]);

  const handleClose = useCallback(() => {
    setQuery("");
    setActiveCategory("all");
    setSelectedIndex(0);
    setRawResults(EMPTY_RESULTS);
    setIsLoading(false);
    onClose();
  }, [onClose]);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (val.trim()) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
      setRawResults(EMPTY_RESULTS);
    }
  };

  const handleCategoryChange = (cat: SearchCategory) => {
    setActiveCategory(cat);
    if (query.trim()) {
      setIsLoading(true);
    }
  };

  // Execute search queries with debounce
  useEffect(() => {
    if (!isOpen || !query.trim()) return;

    let isCurrent = true;
    const debounceTimer = setTimeout(async () => {
      try {
        const data = await searchService.searchAll(query, activeCategory);
        if (isCurrent) {
          setRawResults(data);
          setSelectedIndex(0);
          setIsLoading(false);
        }
      } catch (err) {
        if (isCurrent) {
          console.warn("[GlobalSearch] Search error:", err);
          setIsLoading(false);
        }
      }
    }, 120);

    return () => {
      isCurrent = false;
      clearTimeout(debounceTimer);
    };
  }, [query, activeCategory, isOpen]);

  // Flattened results for keyboard navigation
  const flatResults = useMemo(() => {
    const list: SearchResultItem[] = [];
    (Object.keys(results) as Array<keyof GroupedSearchResults>).forEach((categoryKey) => {
      list.push(...results[categoryKey]);
    });
    return list;
  }, [results]);

  const totalResultsCount = flatResults.length;

  // Handle item selection / deep linking
  const handleSelectItem = useCallback((item: SearchResultItem) => {
    handleClose();

    if (item.taskId && onSelectTask) {
      onSelectTask(item.taskId);
      return;
    }

    if (item.url) {
      router.push(item.url);
    }
  }, [handleClose, onSelectTask, router]);

  // Keyboard navigation listener (<ArrowDown>, <ArrowUp>, <Enter>, <Escape>)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (totalResultsCount > 0 ? (prev + 1) % totalResultsCount : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          totalResultsCount > 0 ? (prev - 1 + totalResultsCount) % totalResultsCount : 0
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (flatResults[selectedIndex]) {
          handleSelectItem(flatResults[selectedIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose, selectedIndex, totalResultsCount, flatResults, handleSelectItem]);

  // Handle outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const categories: { id: SearchCategory; label: string; count: number }[] = [
    { id: "all" as SearchCategory, label: "All", count: totalResultsCount },
    { id: "tasks" as SearchCategory, label: "Tasks", count: results.TASKS.length },
    { id: "projects" as SearchCategory, label: "Projects", count: results.PROJECTS.length },
    { id: "pages" as SearchCategory, label: "Pages", count: results.PAGES.length },
    { id: "notes" as SearchCategory, label: "Notes", count: results.NOTES.length },
    { id: "vlogs" as SearchCategory, label: "Vlogs", count: results["VLOG ENTRIES"].length },
  ];

  let runningIndexCounter = 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 sm:pt-20 bg-black/65 backdrop-blur-md animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label="Global Search"
    >
      <div
        ref={containerRef}
        className="w-full max-w-2xl bg-surface-container-low border border-outline-variant/25 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-outline-variant/15 bg-surface-container/50">
          <Icon name="search" size={20} className="text-secondary shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search tasks, projects, office pages, notes, vlogs..."
            aria-label="Search query"
            className="w-full bg-transparent text-sm sm:text-base text-on-surface placeholder:text-outline focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                handleQueryChange("");
                inputRef.current?.focus();
              }}
              aria-label="Clear search query"
              className="p-1 rounded-md text-outline hover:text-on-surface transition-colors"
            >
              <Icon name="close" size={18} />
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-outline">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-container-highest border border-outline-variant/20">
                ESC
              </kbd>
              <span>to close</span>
            </div>
          )}
        </div>

        {/* Filter Category Chips */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-outline-variant/10 bg-surface-container-lowest overflow-x-auto">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-mono font-medium shrink-0 transition-all flex items-center gap-1.5",
                  isActive
                    ? "bg-secondary text-on-secondary shadow-sm"
                    : "bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                )}
              >
                <span>{cat.label}</span>
                {query.trim() && (
                  <span
                    className={cn(
                      "px-1.5 py-0.2 rounded text-[10px]",
                      isActive ? "bg-black/20 text-on-secondary" : "bg-surface-container-highest text-outline"
                    )}
                  >
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Results / Suggestions Scroll Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {isLoading ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono text-outline">Searching across workspaces...</p>
            </div>
          ) : !query.trim() ? (
            /* Blank state: Quick Shortcuts & Prompt */
            <div className="py-6 px-2 space-y-4">
              <div className="text-center space-y-1">
                <p className="font-headline text-sm font-bold text-on-surface">
                  Universal Workspace Search
                </p>
                <p className="text-xs text-outline max-w-sm mx-auto">
                  Type to query live data across Tasks, Projects, 8 Office Pages, Technical Notes, and Vlog entries.
                </p>
              </div>

              {/* Quick Jump Suggestions */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-outline px-2">
                  Quick Navigation
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { title: "Shooting Page Reel Uploads", icon: "apartment", href: "/office?page=shooting-page", label: "Office" },
                    { title: "Portfolio Website Roadmap", icon: "folder_special", href: "/projects", label: "Projects" },
                    { title: "Vlog EP #42 Footage Pipeline", icon: "videocam", href: "/personal", label: "Personal" },
                    { title: "CS-401 Big-O Notes", icon: "article", href: "/notes", label: "Notes" },
                  ].map((qj, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        handleClose();
                        router.push(qj.href);
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-left border border-outline-variant/10 group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon name={qj.icon} size={18} className="text-secondary group-hover:text-primary transition-colors" />
                        <span className="text-xs font-semibold text-on-surface truncate">
                          {qj.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-outline px-1.5 py-0.5 rounded bg-surface-container-highest">
                        {qj.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : totalResultsCount === 0 ? (
            /* No Results Empty State */
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-surface-container-high text-outline flex items-center justify-center mx-auto">
                <Icon name="search_off" size={24} />
              </div>
              <p className="font-headline text-sm font-bold text-on-surface">
                No matching results found
              </p>
              <p className="text-xs text-outline max-w-xs mx-auto">
                No items matched &ldquo;{query}&rdquo;. Try checking your spelling, using broader keywords, or selecting &ldquo;All&rdquo;.
              </p>
            </div>
          ) : (
            /* Grouped Results Rendering */
            (Object.keys(results) as Array<keyof GroupedSearchResults>).map((groupName) => {
              const items = results[groupName];
              if (items.length === 0) return null;

              return (
                <div key={groupName} className="space-y-1.5">
                  {/* Category Header */}
                  <div className="flex items-center justify-between px-2 pt-1">
                    <span className="text-[11px] font-mono font-bold tracking-wider text-secondary uppercase flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                      {groupName}
                    </span>
                    <span className="text-[10px] font-mono text-outline">
                      {items.length} {items.length === 1 ? "match" : "matches"}
                    </span>
                  </div>

                  {/* Group Items */}
                  <div className="space-y-1">
                    {items.map((item) => {
                      const itemGlobalIndex = runningIndexCounter++;
                      const isSelected = itemGlobalIndex === selectedIndex;

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectItem(item)}
                          onMouseEnter={() => setSelectedIndex(itemGlobalIndex)}
                          className={cn(
                            "flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-xl transition-all cursor-pointer border",
                            isSelected
                              ? "bg-surface-container-high border-primary/50 shadow-md ring-1 ring-primary/40 text-on-surface"
                              : "bg-surface-container hover:bg-surface-container-high border-outline-variant/10 text-on-surface-variant"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                isSelected ? "bg-primary text-on-primary" : "bg-surface-container-highest text-secondary"
                              )}
                            >
                              <Icon name={item.icon} size={18} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-xs sm:text-sm font-semibold text-on-surface truncate">
                                {item.title}
                              </p>
                              {item.subtitle && (
                                <p className="text-[11px] text-on-surface-variant truncate leading-relaxed">
                                  {item.subtitle}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {item.meta && (
                              <span className="text-[10px] font-mono text-outline hidden sm:inline">
                                {item.meta}
                              </span>
                            )}
                            {item.badge && (
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded text-[10px] font-mono font-medium border",
                                  item.badgeColor || "bg-surface-container-highest text-outline"
                                )}
                              >
                                {item.badge}
                              </span>
                            )}
                            <Icon
                              name="arrow_forward"
                              size={14}
                              className={cn(
                                "transition-transform",
                                isSelected ? "text-primary translate-x-0.5" : "text-outline/40"
                              )}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-4 py-2.5 border-t border-outline-variant/10 bg-surface-container/60 flex items-center justify-between text-[11px] font-mono text-outline">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 rounded bg-surface-container-highest">↑</kbd>
              <kbd className="px-1 py-0.2 rounded bg-surface-container-highest">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 rounded bg-surface-container-highest">↵</kbd>
              <span>to select</span>
            </span>
          </div>
          <span className="hidden sm:inline text-secondary font-semibold">
            Google Stitch Universal Search
          </span>
        </div>
      </div>
    </div>
  );
};
