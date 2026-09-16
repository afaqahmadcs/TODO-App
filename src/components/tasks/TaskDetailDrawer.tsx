"use client";

import React, { useState } from "react";
import { Task, TaskStatus, TaskPriority } from "@/types/task";
import { WorkspaceType, OfficePageId, OfficePage } from "@/types/workspace";
import { WORKSPACES, OFFICE_PAGES } from "@/lib/constants";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { taskService } from "@/services/taskService";

export interface TaskDetailDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated?: (updatedTask: Task) => void;
  onTaskDeleted?: (taskId: string) => void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  task,
  isOpen,
  onClose,
  onTaskUpdated,
  onTaskDeleted,
}) => {
  const [currentTask, setCurrentTask] = useState<Task | null>(task);
  const [prevTaskId, setPrevTaskId] = useState(task?.id);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [notes, setNotes] = useState(task?.notes || "");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newTag, setNewTag] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");

  if (task && task.id !== prevTaskId) {
    setPrevTaskId(task.id);
    setCurrentTask(task);
    setTitle(task.title);
    setDescription(task.description || "");
    setNotes(task.notes || "");
    setSaveStatus("saved");
  }

  if (!isOpen || !currentTask) return null;

  const handleTitleBlur = async () => {
    setIsEditingTitle(false);
    if (title.trim() && title !== currentTask.title) {
      setSaveStatus("saving");
      const updated = await taskService.updateTask(currentTask.id, { title: title.trim() });
      if (updated) {
        setCurrentTask(updated);
        onTaskUpdated?.(updated);
        setSaveStatus("saved");
      } else {
        setSaveStatus("error");
      }
    }
  };

  const handleDescriptionBlur = async () => {
    if (description !== (currentTask.description || "")) {
      setSaveStatus("saving");
      const updated = await taskService.updateTask(currentTask.id, { description });
      if (updated) {
        setCurrentTask(updated);
        onTaskUpdated?.(updated);
        setSaveStatus("saved");
      } else {
        setSaveStatus("error");
      }
    }
  };

  const handleNotesBlur = async () => {
    if (notes !== (currentTask.notes || "")) {
      setSaveStatus("saving");
      const updated = await taskService.updateTask(currentTask.id, { notes });
      if (updated) {
        setCurrentTask(updated);
        onTaskUpdated?.(updated);
        setSaveStatus("saved");
      } else {
        setSaveStatus("error");
      }
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setSaveStatus("saving");
    // Optimistic update
    const prev = { ...currentTask };
    const isComp = newStatus === "completed" || newStatus === "done";
    const optimistic: Task = {
      ...currentTask,
      status: newStatus,
      isCompleted: isComp,
      completedAt: isComp ? new Date().toISOString() : undefined,
    };
    setCurrentTask(optimistic);
    onTaskUpdated?.(optimistic);

    const updated = await taskService.updateTaskStatus(currentTask.id, newStatus);
    if (updated) {
      setCurrentTask(updated);
      onTaskUpdated?.(updated);
      setSaveStatus("saved");
    } else {
      setCurrentTask(prev);
      onTaskUpdated?.(prev);
      setSaveStatus("error");
    }
  };

  const handlePriorityChange = async (newPriority: TaskPriority) => {
    setSaveStatus("saving");
    const updated = await taskService.updateTask(currentTask.id, { priority: newPriority });
    if (updated) {
      setCurrentTask(updated);
      onTaskUpdated?.(updated);
      setSaveStatus("saved");
    }
  };

  const handleWorkspaceChange = async (newWs: WorkspaceType) => {
    setSaveStatus("saving");
    const updated = await taskService.updateTask(currentTask.id, { workspaceId: newWs });
    if (updated) {
      setCurrentTask(updated);
      onTaskUpdated?.(updated);
      setSaveStatus("saved");
    }
  };

  const handleOfficePageChange = async (newPageId: OfficePageId) => {
    setSaveStatus("saving");
    const updated = await taskService.updateTask(currentTask.id, { officePageId: newPageId });
    if (updated) {
      setCurrentTask(updated);
      onTaskUpdated?.(updated);
      setSaveStatus("saved");
    }
  };

  const handleDueDateChange = async (newDate: string) => {
    setSaveStatus("saving");
    const updated = await taskService.updateTask(currentTask.id, { dueDate: newDate });
    if (updated) {
      setCurrentTask(updated);
      onTaskUpdated?.(updated);
      setSaveStatus("saved");
    }
  };

  const handleDueTimeChange = async (newTime: string) => {
    setSaveStatus("saving");
    const updated = await taskService.updateTask(currentTask.id, { dueTime: newTime });
    if (updated) {
      setCurrentTask(updated);
      onTaskUpdated?.(updated);
      setSaveStatus("saved");
    }
  };

  const handleToggleComplete = async () => {
    setSaveStatus("saving");
    const nextCompleted = !currentTask.isCompleted;
    const nextStatus: TaskStatus = nextCompleted ? "completed" : "todo";
    await handleStatusChange(nextStatus);
  };

  const handleDeleteTask = async () => {
    if (confirm("Are you sure you want to delete this task?")) {
      const deleted = await taskService.deleteTask(currentTask.id);
      if (deleted) {
        onTaskDeleted?.(currentTask.id);
        onClose();
      }
    }
  };

  // Subtask Handlers
  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const added = await taskService.createSubtask(currentTask.id, newSubtaskTitle.trim());
    if (added) {
      const updatedSubtasks = [...(currentTask.subtasks || []), added];
      const updatedTask = { ...currentTask, subtasks: updatedSubtasks };
      setCurrentTask(updatedTask);
      onTaskUpdated?.(updatedTask);
      setNewSubtaskTitle("");
    }
  };

  const handleToggleSubtask = async (subtaskId: string, currentCompleted: boolean) => {
    const updated = await taskService.updateSubtask(subtaskId, { completed: !currentCompleted });
    if (updated) {
      const updatedSubtasks = (currentTask.subtasks || []).map((s) =>
        s.id === subtaskId ? updated : s
      );
      const updatedTask = { ...currentTask, subtasks: updatedSubtasks };
      setCurrentTask(updatedTask);
      onTaskUpdated?.(updatedTask);
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    const deleted = await taskService.deleteSubtask(subtaskId);
    if (deleted) {
      const updatedSubtasks = (currentTask.subtasks || []).filter((s) => s.id !== subtaskId);
      const updatedTask = { ...currentTask, subtasks: updatedSubtasks };
      setCurrentTask(updatedTask);
      onTaskUpdated?.(updatedTask);
    }
  };

  const handleMoveSubtask = async (index: number, direction: "up" | "down") => {
    const subs = [...(currentTask.subtasks || [])];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= subs.length) return;

    const temp = subs[index];
    subs[index] = subs[targetIndex];
    subs[targetIndex] = temp;

    const orderedIds = subs.map((s) => s.id);
    await taskService.reorderSubtasks(currentTask.id, orderedIds);
    const updatedTask = { ...currentTask, subtasks: subs };
    setCurrentTask(updatedTask);
    onTaskUpdated?.(updatedTask);
  };

  // Tag Handlers
  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    const cleanTag = newTag.trim().replace(/^#/, "");
    if (!currentTask.tags.includes(cleanTag)) {
      const updatedTags = [...currentTask.tags, cleanTag];
      const updated = await taskService.updateTask(currentTask.id, { tags: updatedTags });
      if (updated) {
        const fullTask = { ...currentTask, tags: updatedTags };
        setCurrentTask(fullTask);
        onTaskUpdated?.(fullTask);
      }
    }
    setNewTag("");
    setShowTagInput(false);
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    const updatedTags = currentTask.tags.filter((t) => t !== tagToRemove);
    const updated = await taskService.updateTask(currentTask.id, { tags: updatedTags });
    if (updated) {
      const fullTask = { ...currentTask, tags: updatedTags };
      setCurrentTask(fullTask);
      onTaskUpdated?.(fullTask);
    }
  };

  const subtasks = currentTask.subtasks || [];
  const completedSubtasksCount = subtasks.filter((s) => s.completed || s.isCompleted).length;
  const subtasksProgress = subtasks.length > 0 ? Math.round((completedSubtasksCount / subtasks.length) * 100) : 0;

  return (
    <aside
      className="w-full xl:w-[410px] shrink-0 rounded-2xl bg-surface-container-low p-space-lg flex flex-col gap-space-md shadow-2xl border border-outline-variant/20 relative z-40"
      role="region"
      aria-label="Task Details"
    >
      {/* 1. Panel Header & Actions */}
      <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/15">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleComplete}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all",
              currentTask.isCompleted
                ? "bg-secondary text-on-secondary shadow-sm"
                : "bg-secondary/15 hover:bg-secondary/25 text-secondary"
            )}
          >
            <Icon name="check_circle" size={16} />
            <span>{currentTask.isCompleted ? "Completed" : "Mark Done"}</span>
          </button>

          <button
            type="button"
            onClick={handleDeleteTask}
            className="p-2 rounded-lg bg-surface-container hover:bg-rose-500/20 text-outline hover:text-rose-400 transition-colors"
            title="Delete Task"
          >
            <Icon name="delete" size={16} />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono text-outline flex items-center gap-1">
            {saveStatus === "saving" ? (
              <span className="text-primary flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" /> Saving...
              </span>
            ) : saveStatus === "error" ? (
              <span className="text-rose-400">Sync error</span>
            ) : (
              <span className="text-secondary flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> Auto-saved
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors ml-2"
            title="Close Panel"
          >
            <Icon name="close" size={18} />
          </button>
        </div>
      </div>

      {/* 2. Editable Task Title Heading */}
      <div className="flex flex-col gap-1">
        {isEditingTitle ? (
          <input
            type="text"
            value={title}
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleTitleBlur();
              if (e.key === "Escape") {
                setTitle(currentTask.title);
                setIsEditingTitle(false);
              }
            }}
            className="font-headline-lg text-lg font-bold text-on-surface bg-surface-container-lowest px-2 py-1 rounded-lg border border-primary focus:outline-none w-full"
          />
        ) : (
          <h2
            onClick={() => setIsEditingTitle(true)}
            className="font-headline-lg text-lg font-bold text-on-surface leading-tight hover:text-primary cursor-pointer transition-colors"
            title="Click to edit title"
          >
            {currentTask.title}
          </h2>
        )}

        <div className="flex items-center gap-2 text-outline font-label-sm text-[11px] pt-1">
          <span>Created {new Date(currentTask.createdAt).toLocaleDateString()}</span>
          <span>•</span>
          <span className="uppercase font-mono">{currentTask.workspaceId}</span>
        </div>
      </div>

      {/* 3. Metadata Properties Table */}
      <div className="flex flex-col gap-2.5 p-space-md rounded-xl bg-surface-container border border-outline-variant/15 text-xs">
        {/* Status Property */}
        <div className="flex items-center justify-between">
          <span className="text-outline flex items-center gap-1.5">
            <Icon name="sync_alt" size={15} /> Status
          </span>
          <select
            value={currentTask.status === "done" ? "completed" : currentTask.status}
            onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
            className="bg-surface-container-high text-on-surface px-2.5 py-1 rounded-lg border border-outline-variant/20 font-mono text-xs focus:outline-none cursor-pointer"
          >
            <option value="todo">TODO</option>
            <option value="in_progress">IN_PROGRESS</option>
            <option value="review">REVIEW</option>
            <option value="ready">READY</option>
            <option value="completed">COMPLETED</option>
          </select>
        </div>

        {/* Priority Property */}
        <div className="flex items-center justify-between">
          <span className="text-outline flex items-center gap-1.5">
            <Icon name="flag" size={15} /> Priority
          </span>
          <div className="flex items-center gap-1">
            {(["low", "medium", "high"] as TaskPriority[]).map((p) => {
              const active = currentTask.priority === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePriorityChange(p)}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-mono uppercase font-semibold transition-all border",
                    p === "high" &&
                      (active
                        ? "bg-rose-500/30 text-rose-300 border-rose-500/50 shadow-sm"
                        : "bg-surface-container-high text-outline hover:text-on-surface border-transparent"),
                    p === "medium" &&
                      (active
                        ? "bg-amber-500/30 text-amber-300 border-amber-500/50 shadow-sm"
                        : "bg-surface-container-high text-outline hover:text-on-surface border-transparent"),
                    p === "low" &&
                      (active
                        ? "bg-slate-500/30 text-slate-300 border-slate-500/50 shadow-sm"
                        : "bg-surface-container-high text-outline hover:text-on-surface border-transparent")
                  )}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* Workspace Property */}
        <div className="flex items-center justify-between">
          <span className="text-outline flex items-center gap-1.5">
            <Icon name="workspaces" size={15} /> Workspace
          </span>
          <select
            value={currentTask.workspaceId}
            onChange={(e) => handleWorkspaceChange(e.target.value as WorkspaceType)}
            className="bg-surface-container-high text-on-surface px-2.5 py-1 rounded-lg border border-outline-variant/20 font-medium text-xs focus:outline-none cursor-pointer"
          >
            {WORKSPACES.map((w) => (
              <option key={w.id} value={w.id}>
                {w.title}
              </option>
            ))}
          </select>
        </div>

        {/* Office Page Property (for Office workspace) */}
        {currentTask.workspaceId === "office" && (
          <div className="flex items-center justify-between">
            <span className="text-outline flex items-center gap-1.5">
              <Icon name="layers" size={15} /> Office Page
            </span>
            <select
              value={currentTask.officePageId || ""}
              onChange={(e) => handleOfficePageChange(e.target.value as OfficePageId)}
              className="bg-surface-container-high text-on-surface px-2 py-1 rounded-lg border border-outline-variant/20 text-xs focus:outline-none cursor-pointer max-w-[200px] truncate"
            >
              <option value="">None / General</option>
              {OFFICE_PAGES.map((p: OfficePage) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Due Date & Time */}
        <div className="flex items-center justify-between">
          <span className="text-outline flex items-center gap-1.5">
            <Icon name="event" size={15} /> Due Date
          </span>
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={currentTask.dueDate || ""}
              onChange={(e) => handleDueDateChange(e.target.value)}
              className="bg-surface-container-high text-on-surface px-2 py-0.5 rounded border border-outline-variant/20 font-mono text-xs focus:outline-none"
            />
            <input
              type="time"
              value={currentTask.dueTime || "16:00"}
              onChange={(e) => handleDueTimeChange(e.target.value)}
              className="bg-surface-container-high text-on-surface px-1.5 py-0.5 rounded border border-outline-variant/20 font-mono text-xs focus:outline-none w-20"
            />
          </div>
        </div>

        {/* Time Estimation */}
        <div className="flex items-center justify-between">
          <span className="text-outline flex items-center gap-1.5">
            <Icon name="hourglass_top" size={15} /> Duration
          </span>
          <span className="font-mono text-on-surface">
            {currentTask.estimatedDurationMin || 30} mins
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-col gap-1.5 pt-1 border-t border-outline-variant/10">
          <div className="flex items-center justify-between">
            <span className="text-outline flex items-center gap-1.5">
              <Icon name="sell" size={15} /> Tags
            </span>
            <button
              type="button"
              onClick={() => setShowTagInput(!showTagInput)}
              className="text-[11px] text-primary hover:underline font-mono"
            >
              + Add Tag
            </button>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {currentTask.tags.map((tag) => (
              <span
                key={tag}
                className="group px-2 py-0.5 rounded bg-surface-container-high text-primary font-mono text-[11px] flex items-center gap-1"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-outline hover:text-rose-400 ml-0.5"
                >
                  ×
                </button>
              </span>
            ))}

            {showTagInput && (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="tag-name"
                  value={newTag}
                  autoFocus
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                    if (e.key === "Escape") setShowTagInput(false);
                  }}
                  className="w-20 px-1.5 py-0.5 rounded bg-surface-container-lowest text-xs font-mono border border-primary text-on-surface focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-1.5 py-0.5 bg-primary text-on-primary rounded text-[10px] font-mono"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Description Section */}
      <div className="flex flex-col gap-1.5">
        <span className="font-semibold text-xs uppercase tracking-wider text-outline">
          Description
        </span>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleDescriptionBlur}
          placeholder="Add detailed task instructions or background context..."
          className="w-full p-2.5 rounded-xl bg-surface-container text-xs text-on-surface placeholder:text-outline border border-outline-variant/15 focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-y"
        />
      </div>

      {/* 5. Subtasks Checklist Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-xs uppercase tracking-wider text-outline">
            Subtasks
          </span>
          <span className="font-mono text-xs text-primary">
            {completedSubtasksCount} / {subtasks.length} done ({subtasksProgress}%)
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${subtasksProgress}%` }}
          />
        </div>

        {/* Subtask list */}
        <div className="flex flex-col gap-1 pt-1 max-h-48 overflow-y-auto">
          {subtasks.map((sub, index) => {
            const isCompleted = sub.completed || sub.isCompleted;
            return (
              <div
                key={sub.id}
                className="group flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-surface-container transition-colors text-xs"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={() => handleToggleSubtask(sub.id, Boolean(isCompleted))}
                    className="w-4 h-4 rounded text-primary accent-primary bg-surface-container-highest cursor-pointer"
                  />
                  <span
                    className={cn(
                      "truncate transition-all",
                      isCompleted && "line-through text-outline"
                    )}
                  >
                    {sub.title}
                  </span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMoveSubtask(index, "up")}
                      className="text-outline hover:text-on-surface p-0.5"
                      title="Move up"
                    >
                      <Icon name="arrow_upward" size={12} />
                    </button>
                  )}
                  {index < subtasks.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMoveSubtask(index, "down")}
                      className="text-outline hover:text-on-surface p-0.5"
                      title="Move down"
                    >
                      <Icon name="arrow_downward" size={12} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(sub.id)}
                    className="text-outline hover:text-rose-400 p-0.5"
                    title="Delete subtask"
                  >
                    <Icon name="close" size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add new subtask inline form */}
        <form onSubmit={handleAddSubtask} className="flex items-center gap-1.5 mt-1">
          <input
            type="text"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            placeholder="+ Add a subtask and press Enter..."
            className="flex-1 px-2.5 py-1.5 rounded-lg bg-surface-container text-xs text-on-surface placeholder:text-outline border border-outline-variant/15 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            className="px-2.5 py-1.5 rounded-lg bg-primary-container text-on-primary text-xs font-medium hover:brightness-110"
          >
            Add
          </button>
        </form>
      </div>

      {/* 6. Notes Section */}
      <div className="flex flex-col gap-1.5">
        <span className="font-semibold text-xs uppercase tracking-wider text-outline">
          Notes
        </span>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleNotesBlur}
          placeholder="Freeform notes, quick links, or reminders..."
          className="w-full p-2.5 rounded-xl bg-surface-container text-xs text-on-surface placeholder:text-outline border border-outline-variant/15 focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-y"
        />
      </div>

      {/* 7. Activity & History Log */}
      <div className="flex flex-col gap-1.5 pt-1 border-t border-outline-variant/10">
        <span className="font-semibold text-xs uppercase tracking-wider text-outline">
          Recent Activity
        </span>
        <div className="flex flex-col gap-1.5 text-[11px] text-outline font-mono">
          {currentTask.activity && currentTask.activity.length > 0 ? (
            currentTask.activity.slice(-3).map((act) => (
              <div key={act.id} className="flex items-center gap-2">
                <Icon name="history" size={13} className="text-primary shrink-0" />
                <span className="truncate">
                  <strong className="text-on-surface-variant font-medium">{act.actor}</strong>:{" "}
                  {act.action} ({act.timestamp})
                </span>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-2">
              <Icon name="add_circle" size={13} className="text-primary shrink-0" />
              <span>Created in TaskFlow</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
