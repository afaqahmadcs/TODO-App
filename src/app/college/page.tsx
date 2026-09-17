"use client";

import React, { useState, useEffect, useMemo } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Task, TaskPriority } from "@/types/task";
import { taskService } from "@/services/taskService";

type CollegeTab = "all" | "classes" | "assignments" | "projects" | "exams" | "notes";

export default function CollegeWorkspacePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<CollegeTab>("all");
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [newAssignmentTitle, setNewAssignmentTitle] = useState("");
  const [newAssignmentSubject, setNewAssignmentSubject] = useState("CS301 Algorithms");
  const [showAddModal, setShowAddModal] = useState(false);

  // Load live tasks from taskService / Supabase
  useEffect(() => {
    let mounted = true;
    async function loadCollegeTasks() {
      try {
        const allTasks = await taskService.getTasks();
        if (mounted) {
          setTasks(allTasks);
        }
      } catch (e) {
        console.error("Failed to load college tasks:", e);
      }
    }
    loadCollegeTasks();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter tasks belonging to the college workspace
  const collegeTasks = useMemo(() => {
    return tasks.filter((t) => t.workspaceId === "college");
  }, [tasks]);

  // Derived sections
  const classesList = useMemo(() => {
    return collegeTasks.filter((t) => t.collegeCategory === "classes");
  }, [collegeTasks]);

  const assignmentsList = useMemo(() => {
    return collegeTasks.filter(
      (t) => t.collegeCategory === "assignments" || t.stage === "ASSIGNMENT"
    );
  }, [collegeTasks]);

  const projectsList = useMemo(() => {
    return collegeTasks.filter((t) => t.collegeCategory === "projects");
  }, [collegeTasks]);

  const examsList = useMemo(() => {
    return collegeTasks.filter((t) => t.collegeCategory === "exams");
  }, [collegeTasks]);

  const notesList = useMemo(() => {
    return collegeTasks.filter(
      (t) => t.collegeCategory === "notes" || t.tags.includes("notes")
    );
  }, [collegeTasks]);

  // Pomodoro timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Toggle assignment completion
  const handleToggleAssignment = async (taskId: string, isCompleted: boolean) => {
    const updated = await taskService.updateTask(taskId, {
      status: isCompleted ? "todo" : "completed",
    });
    if (updated) {
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    }
  };

  // Quick add new assignment
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignmentTitle.trim()) return;

    const newTask = await taskService.createTask({
      title: newAssignmentTitle.trim(),
      workspaceId: "college",
      subject: newAssignmentSubject,
      collegeCategory: "assignments",
      priority: "high" as TaskPriority,
      status: "todo",
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
      dueTime: "23:59",
      estimatedDurationMin: 120,
    });

    setTasks((prev) => [newTask, ...prev]);
    setNewAssignmentTitle("");
    setShowAddModal(false);
  };

  return (
    <PageContainer>
      {/* Top Workspace Header Banner */}
      <PageHeader
        badge="ACADEMIC PORTAL • CS MAJOR"
        badgeColor="text-secondary bg-secondary/15"
        metaText="FALL 2024 • SEMESTER 5 • CGPA: 3.82"
        title="College Workspace"
        description="Coursework tracking, lecture schedules, lab submissions, and exam preparation with unified GPA telemetry."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {/* Pomodoro Study Timer */}
            <button
              type="button"
              onClick={() => setTimerActive(!timerActive)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-mono text-xs transition-all border border-outline-variant/15"
            >
              <Icon
                name="timer"
                size={16}
                className={`text-secondary ${timerActive ? "animate-spin" : ""}`}
              />
              <span>Study Timer</span>
              <span className="text-secondary font-bold ml-1">{formatTimer(timerSeconds)}</span>
            </button>

            <Button variant="secondary" icon="grid_view">
              Syllabus Matrix
            </Button>
            <Button
              variant="primary"
              icon="add_task"
              onClick={() => setShowAddModal(true)}
            >
              + New Assignment
            </Button>
          </div>
        }
      />

      {/* TOP DASHBOARD STATS (5 Cards from Stitch Design) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Stat 1: Today's Classes */}
        <div className="bg-surface-container rounded-xl p-4 flex flex-col justify-between shadow-sm hover:-translate-y-0.5 transition-transform border border-outline-variant/10">
          <div className="flex items-start justify-between">
            <span className="font-mono text-xs text-outline uppercase tracking-wider">Today&apos;s Classes</span>
            <Icon name="school" size={18} className="text-secondary" />
          </div>
          <div className="mt-3">
            <div className="font-headline text-2xl text-on-surface font-bold">2 Lectures</div>
            <div className="mt-1 flex flex-col gap-0.5 text-xs font-mono text-on-surface-variant">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> CS301 (08:00 AM)
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> CS340 (11:30 AM)
              </div>
            </div>
          </div>
        </div>

        {/* Stat 2: Active Assignments */}
        <div className="bg-surface-container rounded-xl p-4 flex flex-col justify-between shadow-sm hover:-translate-y-0.5 transition-transform border border-outline-variant/10">
          <div className="flex items-start justify-between">
            <span className="font-mono text-xs text-outline uppercase tracking-wider">Assignments</span>
            <Icon name="assignment_late" size={18} className="text-rose-400" />
          </div>
          <div className="mt-3">
            <div className="font-headline text-2xl text-on-surface font-bold">
              {assignmentsList.length} Active
            </div>
            <div className="mt-1 flex items-center justify-between text-xs font-mono text-on-surface-variant">
              <span className="text-rose-400 font-semibold">1 due today</span>
              <span className="text-outline">•</span>
              <span>2 this week</span>
            </div>
          </div>
        </div>

        {/* Stat 3: Upcoming Exams */}
        <div className="bg-surface-container rounded-xl p-4 flex flex-col justify-between shadow-sm hover:-translate-y-0.5 transition-transform border border-outline-variant/10">
          <div className="flex items-start justify-between">
            <span className="font-mono text-xs text-outline uppercase tracking-wider">Upcoming Exams</span>
            <Icon name="event_note" size={18} className="text-purple-400" />
          </div>
          <div className="mt-3">
            <div className="font-headline text-2xl text-on-surface font-bold">2 Upcoming</div>
            <div className="mt-1 text-xs text-on-surface-variant">
              <span className="text-purple-300 font-semibold font-mono">Midterms</span> in 6 days (CS301, MATH)
            </div>
          </div>
        </div>

        {/* Stat 4: Pending Work */}
        <div className="bg-surface-container rounded-xl p-4 flex flex-col justify-between shadow-sm hover:-translate-y-0.5 transition-transform border border-outline-variant/10">
          <div className="flex items-start justify-between">
            <span className="font-mono text-xs text-outline uppercase tracking-wider">Pending Work</span>
            <Icon name="pending_actions" size={18} className="text-secondary" />
          </div>
          <div className="mt-3">
            <div className="font-headline text-2xl text-on-surface font-bold">3 Tasks</div>
            <div className="mt-2 w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
              <div className="bg-secondary h-full rounded-full" style={{ width: "80%" }} />
            </div>
            <div className="mt-1 flex justify-between font-mono text-[10px] text-outline">
              <span>Lab Report 80%</span>
              <span>P-Set Pending</span>
            </div>
          </div>
        </div>

        {/* Stat 5: Semester Track & GPA */}
        <div className="bg-surface-container rounded-xl p-4 flex flex-col justify-between shadow-sm hover:-translate-y-0.5 transition-transform border border-outline-variant/10">
          <div className="flex items-start justify-between">
            <span className="font-mono text-xs text-outline uppercase tracking-wider">Semester Track</span>
            <Icon name="verified" size={18} className="text-secondary" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-2xl text-on-surface font-bold">3.82</span>
              <span className="font-mono text-xs text-secondary font-semibold">GPA</span>
              <span className="font-mono text-xs text-outline ml-auto">18 Done</span>
            </div>
            <div className="mt-1 text-xs text-secondary flex items-center gap-1 font-mono">
              <Icon name="trending_up" size={14} />
              <span>94% On-time delivery rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* WORKSPACE NAVIGATION / 5 SECTION TABS */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1">
        <div className="flex items-center gap-1 bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/10">
          {[
            { id: "all", label: "All Overview" },
            { id: "classes", label: "Classes", count: classesList.length },
            { id: "assignments", label: "Assignments", count: assignmentsList.length },
            { id: "projects", label: "Projects", count: projectsList.length },
            { id: "exams", label: "Exams", count: examsList.length },
            { id: "notes", label: "Notes & Docs", count: notesList.length },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as CollegeTab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-surface-container-high text-secondary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? "bg-secondary/20 text-secondary" : "bg-surface-container-highest text-outline"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="hidden xl:flex items-center gap-2 font-mono text-xs text-on-surface-variant">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-low border border-outline-variant/10">
            <span className="w-2 h-2 rounded-full bg-secondary" /> 3 Course Enrollments
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-low border border-outline-variant/10">
            <span className="w-2 h-2 rounded-full bg-primary" /> 18 Credit Units
          </span>
        </div>
      </div>

      {/* SECTION 1: CLASSES (Today's Lecture & Lab Schedule) */}
      {(activeTab === "all" || activeTab === "classes") && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-5 bg-secondary rounded-full" />
              <h2 className="font-headline text-lg text-on-surface font-semibold">
                Today&apos;s Lecture &amp; Lab Schedule
              </h2>
              <span className="font-mono text-xs text-outline px-2 py-0.5 rounded bg-surface-container-high">
                Wednesday
              </span>
            </div>
            <a href="#schedule" className="text-xs font-mono text-secondary hover:underline flex items-center gap-1">
              Full Timetable <Icon name="arrow_forward" size={14} />
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {classesList.map((cls) => {
              const isAttended = cls.status === "completed";
              const isUpcoming = cls.status === "in_progress";
              return (
                <div
                  key={cls.id}
                  className="bg-surface-container p-5 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden border border-outline-variant/10 group hover:border-secondary/30 transition-all"
                >
                  <div
                    className={`absolute top-0 left-0 bottom-0 w-1 ${
                      isAttended ? "bg-secondary" : isUpcoming ? "bg-primary" : "bg-purple-400"
                    }`}
                  />
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs text-secondary font-semibold bg-secondary/10 px-2 py-0.5 rounded">
                        {cls.dueTime || "Schedule"}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-semibold ${
                          isAttended
                            ? "bg-surface-container-highest text-secondary"
                            : isUpcoming
                            ? "bg-primary/20 text-primary"
                            : "bg-surface-container-highest text-outline"
                        }`}
                      >
                        {isAttended && <Icon name="check_circle" size={12} />}
                        {isUpcoming && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />}
                        <span>{isAttended ? "Attended" : isUpcoming ? "Upcoming Today" : "Next Session"}</span>
                      </span>
                    </div>

                    <h3 className="font-headline text-base text-on-surface font-semibold group-hover:text-secondary transition-colors">
                      {cls.title}
                    </h3>

                    <div className="mt-1 flex items-center gap-3 text-xs font-mono text-outline">
                      <span className="flex items-center gap-1">
                        <Icon name="meeting_room" size={14} /> {cls.roomOrLocation || "Hall 4"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="person" size={14} /> {cls.instructor || "Instructor"}
                      </span>
                    </div>

                    <div className="mt-3 p-2.5 bg-surface-container-low rounded-lg text-xs text-on-surface-variant border border-outline-variant/5">
                      <span className="text-on-surface font-medium">Topic:</span> {cls.description}
                    </div>
                  </div>

                  <div className="mt-4 pt-2 flex items-center justify-between bg-surface-container-low/60 px-3 py-1.5 rounded-lg border border-outline-variant/5 font-mono text-xs">
                    <div className="flex items-center gap-1.5 text-secondary">
                      <Icon name="sync_saved_locally" size={14} />
                      <span>{isAttended ? "Lecture Notes Synced" : "Environment Ready"}</span>
                    </div>
                    <button
                      type="button"
                      className="text-outline hover:text-on-surface underline text-xs"
                    >
                      {isAttended ? "View Deck" : "Join Lab"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: ASSIGNMENTS (Comprehensive Tracker) */}
      {(activeTab === "all" || activeTab === "assignments") && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-5 bg-secondary rounded-full" />
              <h2 className="font-headline text-lg text-on-surface font-semibold">
                Active Assignments Tracker
              </h2>
              <span className="bg-surface-container-high text-on-surface font-mono text-xs px-2 py-0.5 rounded">
                {assignmentsList.length} Tracked
              </span>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto font-mono text-xs">
              <span className="text-outline">Sort by:</span>
              <button
                type="button"
                className="px-2 py-1 rounded bg-surface-container-high text-on-surface font-semibold"
              >
                Urgency
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-2.5 py-1 rounded bg-secondary text-on-secondary font-semibold hover:bg-secondary-fixed transition-all"
              >
                + Add Assignment
              </button>
            </div>
          </div>

          <div className="bg-surface-container rounded-xl overflow-hidden shadow-sm border border-outline-variant/10">
            {/* Desktop Table Header */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-3 bg-surface-container-low font-mono text-xs text-outline uppercase tracking-wider border-b border-outline-variant/10">
              <div className="col-span-4">Assignment Title &amp; Details</div>
              <div className="col-span-2">Subject</div>
              <div className="col-span-2">Due Date &amp; Est. Time</div>
              <div className="col-span-1">Priority</div>
              <div className="col-span-2">Status &amp; Progress</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {/* Assignment Rows */}
            <div className="flex flex-col divide-y divide-outline-variant/10">
              {assignmentsList.map((assign) => {
                const isDone = assign.status === "completed" || assign.isCompleted;
                const progress = assign.progressPercent ?? (isDone ? 100 : 0);

                return (
                  <div
                    key={assign.id}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-3 p-4 hover:bg-surface-container-high transition-colors items-center"
                  >
                    {/* Title & Checkbox */}
                    <div className="col-span-1 lg:col-span-4 flex items-start gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => handleToggleAssignment(assign.id, isDone)}
                        className="mt-1 w-4 h-4 rounded text-secondary focus:ring-0 bg-surface-container-lowest border-0 accent-secondary cursor-pointer shrink-0"
                      />
                      <div className="flex flex-col min-w-0">
                        <span
                          className={`font-headline text-sm font-semibold truncate hover:text-secondary cursor-pointer ${
                            isDone ? "text-outline line-through" : "text-on-surface"
                          }`}
                        >
                          {assign.title}
                        </span>
                        <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">
                          {assign.description || assign.notes || "Complete coursework and lab requirements."}
                        </p>
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="col-span-1 lg:col-span-2 flex items-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/10 text-secondary font-mono text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                        <span>{assign.subject || "CS Course"}</span>
                      </span>
                    </div>

                    {/* Due Date & Est. Time */}
                    <div className="col-span-1 lg:col-span-2 flex flex-col font-mono text-xs">
                      <span className="text-rose-400 font-semibold flex items-center gap-1">
                        <Icon name="schedule" size={14} />
                        <span>
                          {assign.dueDate === new Date().toISOString().split("T")[0]
                            ? `Today, ${assign.dueTime || "17:00"}`
                            : assign.dueDate || "Upcoming"}
                        </span>
                      </span>
                      <span className="text-outline text-[11px] mt-0.5">
                        Est. Time: {Math.floor((assign.estimatedDurationMin || 90) / 60)}h{" "}
                        {(assign.estimatedDurationMin || 90) % 60}m
                      </span>
                    </div>

                    {/* Priority */}
                    <div className="col-span-1 flex items-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] font-semibold uppercase ${
                          assign.priority === "high"
                            ? "bg-rose-500/20 text-rose-400"
                            : assign.priority === "medium"
                            ? "bg-secondary/20 text-secondary"
                            : "bg-surface-container-highest text-outline"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            assign.priority === "high" ? "bg-rose-400" : "bg-secondary"
                          }`}
                        />
                        <span>{assign.priority}</span>
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="col-span-1 lg:col-span-2 flex flex-col gap-1">
                      <div className="flex justify-between items-center font-mono text-[11px]">
                        <span className="text-secondary font-medium">
                          {isDone ? "Completed" : progress > 0 ? "In Progress" : "To Do"}
                        </span>
                        <span className="text-on-surface font-bold">{progress}%</span>
                      </div>
                      <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-secondary h-full rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex items-center justify-end gap-1 text-outline">
                      <button
                        type="button"
                        className="p-1 hover:text-on-surface rounded hover:bg-surface-container-highest"
                        title="View notes"
                      >
                        <Icon name="attach_file" size={16} />
                      </button>
                      <button
                        type="button"
                        className="p-1 hover:text-on-surface rounded hover:bg-surface-container-highest"
                        title="Options"
                      >
                        <Icon name="more_vert" size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3 & 4: PROJECTS & EXAMS (2 Column Grid) */}
      {(activeTab === "all" || activeTab === "projects" || activeTab === "exams") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Column A: Major Course Projects */}
          {(activeTab === "all" || activeTab === "projects") && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-5 bg-secondary rounded-full" />
                  <h2 className="font-headline text-lg text-on-surface font-semibold">
                    Major Course Projects
                  </h2>
                </div>
                <span className="font-mono text-secondary text-xs font-semibold">
                  {projectsList.length} Active
                </span>
              </div>

              {projectsList.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-surface-container p-5 rounded-xl flex flex-col gap-3 shadow-sm border border-outline-variant/10"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded bg-secondary/10 text-secondary font-mono text-xs font-semibold">
                          {proj.subject || "Capstone"}
                        </span>
                        <span className="text-outline text-xs font-mono">• {proj.dueDate || "Due Nov 12"}</span>
                      </div>
                      <h3 className="font-headline text-base text-on-surface font-semibold">
                        {proj.title}
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {proj.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-surface-container-high px-2 py-1 rounded font-mono text-xs text-secondary font-bold">
                      <span>{proj.progressPercent || 65}%</span>
                    </div>
                  </div>

                  <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-secondary h-full rounded-full"
                      style={{ width: `${proj.progressPercent || 65}%` }}
                    />
                  </div>

                  {/* Subtasks Milestones */}
                  {proj.subtasks && proj.subtasks.length > 0 && (
                    <div className="flex flex-col gap-1.5 bg-surface-container-low p-3 rounded-lg border border-outline-variant/5">
                      <span className="font-mono text-[11px] text-outline uppercase tracking-wider mb-0.5">
                        Milestones &amp; Subtasks
                      </span>
                      {proj.subtasks.map((sub) => (
                        <label key={sub.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sub.completed}
                            readOnly
                            className="accent-secondary rounded cursor-pointer"
                          />
                          <span
                            className={`text-xs ${
                              sub.completed ? "text-on-surface-variant line-through" : "text-on-surface"
                            }`}
                          >
                            {sub.title}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs font-mono pt-1">
                    <span className="text-on-surface-variant">Solo Project (Lead) • GitHub connected</span>
                    <button
                      type="button"
                      className="text-secondary font-semibold hover:underline flex items-center gap-1"
                    >
                      Repo &amp; PRs <Icon name="open_in_new" size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Column B: Upcoming Exams & Countdown */}
          {(activeTab === "all" || activeTab === "exams") && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-5 bg-purple-400 rounded-full" />
                  <h2 className="font-headline text-lg text-on-surface font-semibold">
                    Upcoming Exams &amp; Countdown
                  </h2>
                </div>
                <span className="font-mono text-purple-300 text-xs font-semibold">
                  Midterm Season
                </span>
              </div>

              {examsList.map((exam, idx) => (
                <div
                  key={exam.id}
                  className="bg-surface-container p-5 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden border border-outline-variant/10"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-secondary/10 text-secondary font-mono text-xs font-semibold">
                        {exam.subject}
                      </span>
                      <h3 className="font-headline text-base text-on-surface font-semibold mt-1">
                        {exam.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-3 text-xs font-mono text-outline">
                        <span className="flex items-center gap-1">
                          <Icon name="calendar_today" size={14} /> {exam.examDate || "Oct 22"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="schedule" size={14} /> 09:00 AM - 11:00 AM
                        </span>
                      </div>
                    </div>

                    {/* Countdown Badge */}
                    <div className="shrink-0 bg-surface-container-high px-3 py-1.5 rounded-lg flex flex-col items-center">
                      <span className="font-headline text-xl text-secondary font-bold">
                        {idx === 0 ? "6" : "10"}
                      </span>
                      <span className="font-mono text-[10px] text-outline uppercase tracking-wider">
                        Days Left
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 p-2.5 bg-surface-container-low rounded-lg text-xs text-on-surface-variant flex flex-col gap-0.5 border border-outline-variant/5">
                    <span className="text-on-surface font-medium font-mono">Coverage Scope:</span>
                    <span>{exam.description}</span>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-outline">Prep Status</span>
                        <span className="text-secondary font-bold">
                          {exam.progressPercent || 70}% Reviewed
                        </span>
                      </div>
                      <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-secondary h-full rounded-full"
                          style={{ width: `${exam.progressPercent || 70}%` }}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-mono text-xs shrink-0 border border-outline-variant/10"
                    >
                      Study Guide
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 5: NOTES & DOCS */}
      {(activeTab === "all" || activeTab === "notes") && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-5 bg-secondary rounded-full" />
              <h2 className="font-headline text-lg text-on-surface font-semibold">
                Lecture Notes &amp; Course Documentation
              </h2>
            </div>
            <span className="font-mono text-xs text-outline">
              {notesList.length} Synthesized Notes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notesList.map((note) => (
              <div
                key={note.id}
                className="bg-surface-container p-4 rounded-xl flex flex-col justify-between shadow-sm border border-outline-variant/10 hover:border-secondary/30 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 rounded bg-secondary/15 text-secondary font-mono text-[11px] font-semibold">
                      {note.subject}
                    </span>
                    <span className="font-mono text-[11px] text-outline">Synced to repo</span>
                  </div>
                  <h4 className="font-headline text-sm font-semibold text-on-surface">
                    {note.title}
                  </h4>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    {note.description || note.notes}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-outline-variant/10 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-outline">Markdown • LaTeX formulas</span>
                  <button
                    type="button"
                    className="text-secondary font-mono text-xs hover:underline flex items-center gap-1"
                  >
                    Open Document <Icon name="open_in_new" size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Assignment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container rounded-xl p-5 max-w-md w-full shadow-2xl border border-outline-variant/20 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-base font-bold text-on-surface">
                Create New College Assignment
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-outline hover:text-on-surface p-1 rounded"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-outline mb-1">
                  Assignment Title
                </label>
                <input
                  type="text"
                  required
                  value={newAssignmentTitle}
                  onChange={(e) => setNewAssignmentTitle(e.target.value)}
                  placeholder="e.g. Dijkstra Shortest Path Proofs Chapter 4"
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-high border border-outline-variant/20 text-on-surface text-sm focus:outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-outline mb-1">Subject</label>
                <select
                  value={newAssignmentSubject}
                  onChange={(e) => setNewAssignmentSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-high border border-outline-variant/20 text-on-surface text-sm focus:outline-none focus:border-secondary"
                >
                  <option value="CS301 Algorithms">CS301 Algorithms</option>
                  <option value="CS340 Databases">CS340 Databases</option>
                  <option value="MATH204 Discrete Math">MATH204 Discrete Math</option>
                  <option value="CS380 Software Engineering">CS380 Software Engineering</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Assignment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
