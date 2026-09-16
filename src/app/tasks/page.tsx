"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TaskCard } from "@/components/tasks/TaskCard";
import { EmptyState } from "@/components/common/EmptyState";
import { taskService } from "@/services/taskService";
import { Task } from "@/types/task";
import { WORKSPACES } from "@/lib/constants";

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "board">("board");

  useEffect(() => {
    taskService.getTasks().then(setTasks);
  }, []);

  const handleToggleComplete = async (taskId: string) => {
    const updated = await taskService.toggleTaskCompletion(taskId);
    if (updated) {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (selectedPriority !== "all" && task.priority !== selectedPriority) return false;
    if (selectedWorkspace !== "all" && task.workspaceId !== selectedWorkspace) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(q) ||
        task.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <PageContainer>
      <PageHeader
        badge="Universal Task Hub"
        metaText="Unified inbox across all 4 production workspaces"
        title="My Tasks"
        description="Filter, organize, and execute daily action items with keyboard-friendly interactions."
        actions={
          <div className="flex items-center gap-2">
            <div className="inline-flex p-1 rounded-xl bg-surface-container-low border border-outline-variant/20">
              <button
                type="button"
                onClick={() => setViewMode("board")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "board"
                    ? "bg-primary-container text-white shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Board
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "list"
                    ? "bg-primary-container text-white shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                List
              </button>
            </div>
            <Button variant="primary" icon="add">
              New Task
            </Button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority Filter */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-outline font-mono mr-1">Priority:</span>
            {["all", "high", "medium", "low"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setSelectedPriority(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium uppercase transition-colors ${
                  selectedPriority === p
                    ? "bg-primary-container text-white font-semibold"
                    : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Workspace Filter */}
          <div className="flex items-center gap-1 ml-0 md:ml-4">
            <span className="text-xs text-outline font-mono mr-1">Workspace:</span>
            <button
              type="button"
              onClick={() => setSelectedWorkspace("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedWorkspace === "all"
                  ? "bg-primary-container text-white font-semibold"
                  : "bg-surface-container text-on-surface-variant hover:text-on-surface"
              }`}
            >
              All
            </button>
            {WORKSPACES.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setSelectedWorkspace(w.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedWorkspace === w.id
                    ? "bg-primary-container text-white font-semibold"
                    : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {w.title}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full md:w-64">
          <Input
            icon="search"
            placeholder="Filter tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Task Content Grid or Empty State */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon="task_alt"
          badge="Tasks Clean"
          title="All caught up!"
          description="No tasks match the active filter criteria. Create an item or reset filters."
          primaryActionLabel="+ Create Task"
          onPrimaryAction={() => {
            setSelectedPriority("all");
            setSelectedWorkspace("all");
            setSearchQuery("");
          }}
          secondaryActionLabel="Reset Filters"
          onSecondaryAction={() => {
            setSelectedPriority("all");
            setSelectedWorkspace("all");
            setSearchQuery("");
          }}
        />
      ) : (
        <div
          className={
            viewMode === "board"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              : "flex flex-col gap-2.5 max-w-4xl"
          }
        >
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={handleToggleComplete}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
