import {
  Task,
  TaskFilterOptions,
  CreateTaskInput,
  UpdateTaskInput,
  Subtask,
  TaskStatus,
  TaskPriority,
} from "@/types/task";
import { WorkspaceType, OfficePageId } from "@/types/workspace";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Database, TaskDbRow, SubtaskRow } from "@/types/database";

// Seeded local initial tasks representing realistic data across the 4 workspaces
const INITIAL_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Behind-the-scenes B-roll for ZK Production set",
    description: "Capture 4K 60fps slow-motion footage of director monitoring and sound stage setup.",
    workspaceId: "office",
    officePageId: "zk-production",
    status: "todo",
    stage: "IDEAS",
    priority: "high",
    dueDate: new Date().toISOString().split("T")[0],
    dueTime: "15:00",
    estimatedDurationMin: 45,
    actualDurationMin: 0,
    tags: ["reels", "cinematic", "4K"],
    isCompleted: false,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    subtasks: [
      { id: "sub-1", taskId: "task-1", title: "Clean Sony 24-70mm lens", completed: true },
      { id: "sub-2", taskId: "task-1", title: "Format high-speed SD cards", completed: true },
      { id: "sub-3", taskId: "task-1", title: "Setup gimbal balancing", completed: false },
    ],
    notes: "Coordinate with audio engineer before rolling camera.",
    activity: [
      { id: "act-1", taskId: "task-1", action: "Task created", actor: "Afaq", timestamp: "09:12 AM" },
      { id: "act-2", taskId: "task-1", action: "Subtask completed: Clean lens", actor: "Afaq", timestamp: "10:30 AM" },
    ],
  },
  {
    id: "task-2",
    title: "Select today's reel footage from interview card B",
    description: "Extract key soundbites with subtitles for Instagram and TikTok distribution.",
    workspaceId: "office",
    officePageId: "jahangir-khan",
    status: "in_progress",
    stage: "TODO",
    priority: "medium",
    dueDate: new Date().toISOString().split("T")[0],
    dueTime: "16:00",
    estimatedDurationMin: 20,
    actualDurationMin: 10,
    tags: ["interview", "reel"],
    isCompleted: false,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [
      { id: "sub-4", taskId: "task-2", title: "Import footage to Final Cut", completed: true },
      { id: "sub-5", taskId: "task-2", title: "Apply LUT color grade", completed: false },
    ],
    notes: "Export in 9:16 vertical 1080x1920 format.",
    activity: [
      { id: "act-3", taskId: "task-2", action: "Task created", actor: "Afaq", timestamp: "11:00 AM" },
    ],
  },
  {
    id: "task-3",
    title: "Suno Music: Album Cover Art v3 - Synthwave Track",
    description: "Finalize album artwork typography and Spotify Canvas 8-second video loop.",
    workspaceId: "office",
    officePageId: "suno-music",
    status: "review",
    stage: "DESIGN",
    priority: "high",
    dueDate: new Date().toISOString().split("T")[0],
    dueTime: "17:30",
    estimatedDurationMin: 60,
    actualDurationMin: 45,
    tags: ["spotify", "3000x3000px", "cover"],
    isCompleted: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [
      { id: "sub-6", taskId: "task-3", title: "Export 3000x3000px master PNG", completed: true },
      { id: "sub-7", taskId: "task-3", title: "Generate RGB color profile check", completed: true },
      { id: "sub-8", taskId: "task-3", title: "Client review signoff", completed: false },
    ],
    notes: "Ensure typography passes Spotify readability guidelines.",
    activity: [
      { id: "act-4", taskId: "task-3", action: "Status changed to REVIEW", actor: "Afaq", timestamp: "01:15 PM" },
    ],
  },
  {
    id: "task-4",
    title: "Vlog EP #42: Shoot Next.js learning montage & morning routine",
    description: "Capture workspace aesthetic B-roll, coding montage, and voiceover explanation.",
    workspaceId: "personal",
    status: "in_progress",
    stage: "RECORDING",
    priority: "high",
    dueDate: new Date().toISOString().split("T")[0],
    dueTime: "18:30",
    estimatedDurationMin: 90,
    actualDurationMin: 30,
    tags: ["vlog", "b-roll", "sony-a7iv"],
    linkedVlogEpisode: "EP #42",
    isCompleted: false,
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [
      { id: "sub-9", taskId: "task-4", title: "Record A-Roll desk tour intro", completed: true },
      { id: "sub-10", taskId: "task-4", title: "Record coding screen capture", completed: true },
      { id: "sub-11", taskId: "task-4", title: "Record Shure SM7B voiceover", completed: false },
      { id: "sub-12", taskId: "task-4", title: "Upload raw footage to library", completed: false },
    ],
    notes: "Keep background music under -18dB during talking head segments.",
    activity: [
      { id: "act-5", taskId: "task-4", action: "Subtask completed: Record A-Roll", actor: "Afaq", timestamp: "02:15 PM" },
    ],
  },
  {
    id: "task-5",
    title: "Refactor indexedDB cache hydration worker & optimistic sync",
    description: "Implement zero-latency mutations with automatic rollback on network failure.",
    workspaceId: "web-development",
    status: "ready",
    stage: "SPRINT",
    priority: "high",
    dueDate: new Date().toISOString().split("T")[0],
    dueTime: "20:00",
    estimatedDurationMin: 45,
    actualDurationMin: 0,
    tags: ["nextjs15", "indexeddb", "telemetry"],
    githubBranchOrCommit: "main@8f2a1b",
    isCompleted: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [
      { id: "sub-13", taskId: "task-5", title: "Write unit test for offline queue", completed: true },
      { id: "sub-14", taskId: "task-5", title: "Verify transaction rollback", completed: true },
    ],
    notes: "Check Edge runtime compatibility.",
    activity: [
      { id: "act-6", taskId: "task-5", action: "Status changed to READY", actor: "Afaq", timestamp: "03:40 PM" },
    ],
  },
  {
    id: "task-6",
    title: "Submit Data Structures Algorithm Analysis Chapter 4",
    description: "Complete graph traversal complexity comparisons and submit via university portal.",
    workspaceId: "college",
    status: "todo",
    stage: "ASSIGNMENT",
    priority: "medium",
    dueDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    dueTime: "23:59",
    estimatedDurationMin: 90,
    actualDurationMin: 0,
    tags: ["academics", "algorithms"],
    isCompleted: false,
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [
      { id: "sub-15", taskId: "task-6", title: "Solve Dijkstra proof", completed: false },
      { id: "sub-16", taskId: "task-6", title: "Generate LaTeX PDF report", completed: false },
    ],
    notes: "Due before midnight tomorrow.",
    activity: [
      { id: "act-7", taskId: "task-6", action: "Task created", actor: "Afaq", timestamp: "Yesterday" },
    ],
  },
  {
    id: "task-7",
    title: "Finalize TikTok & IG Reels Content Calendar for Q4",
    description: "Overdue strategy schedule for Ismail Shahid Fans & Jahangir Khan pages.",
    workspaceId: "office",
    officePageId: "ismail-shahid-fans",
    status: "todo",
    stage: "STRATEGY",
    priority: "high",
    dueDate: new Date(Date.now() - 86400000).toISOString().split("T")[0], // Yesterday (Overdue)
    dueTime: "14:30",
    estimatedDurationMin: 45,
    actualDurationMin: 0,
    tags: ["strategy", "reels"],
    isCompleted: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [
      { id: "sub-17", taskId: "task-7", title: "Review past engagement metrics", completed: true },
      { id: "sub-18", taskId: "task-7", title: "Draft 30 content hooks", completed: false },
    ],
    notes: "High priority backlog item.",
    activity: [
      { id: "act-8", taskId: "task-7", action: "Overdue alert triggered", actor: "System", timestamp: "Yesterday" },
    ],
  },
  {
    id: "task-8",
    title: "CS301 Morning Lecture Notes Synthesized",
    description: "Summarized binary search trees and balanced red-black rotation diagrams.",
    workspaceId: "college",
    status: "completed",
    stage: "DONE",
    priority: "low",
    dueDate: new Date().toISOString().split("T")[0],
    dueTime: "10:15",
    estimatedDurationMin: 30,
    actualDurationMin: 25,
    tags: ["notes", "lecture"],
    isCompleted: true,
    completedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    subtasks: [
      { id: "sub-19", taskId: "task-8", title: "Transcribe audio notes", completed: true },
      { id: "sub-20", taskId: "task-8", title: "Add markdown diagrams", completed: true },
    ],
    notes: "Archived to College Notes workspace.",
    activity: [
      { id: "act-9", taskId: "task-8", action: "Marked as completed", actor: "Afaq", timestamp: "10:15 AM" },
    ],
  },
  {
    id: "task-office-shooting-pub",
    title: "Verify published post & check audio copyright clearance",
    description: "Confirm Instagram & TikTok distribution, audio match, and check views.",
    workspaceId: "office",
    officePageId: "shooting-page",
    status: "published",
    stage: "PUBLISHED",
    priority: "medium",
    dueDate: new Date().toISOString().split("T")[0],
    dueTime: "11:30",
    estimatedDurationMin: 20,
    actualDurationMin: 18,
    tags: ["reels", "4K", "meta"],
    isCompleted: true,
    completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    subtasks: [
      { id: "sub-sp-1", taskId: "task-office-shooting-pub", title: "Check new content", completed: true },
      { id: "sub-sp-2", taskId: "task-office-shooting-pub", title: "Select content", completed: true },
      { id: "sub-sp-3", taskId: "task-office-shooting-pub", title: "Edit", completed: true },
      { id: "sub-sp-4", taskId: "task-office-shooting-pub", title: "Caption", completed: true },
      { id: "sub-sp-5", taskId: "task-office-shooting-pub", title: "Hashtags", completed: true },
      { id: "sub-sp-6", taskId: "task-office-shooting-pub", title: "Upload", completed: true },
      { id: "sub-sp-7", taskId: "task-office-shooting-pub", title: "Verify published", completed: true },
    ],
    notes: "Audio copyright cleared on Meta Creator Studio.",
    activity: [
      { id: "act-sp-1", taskId: "task-office-shooting-pub", action: "Published reel verified", actor: "Afaq", timestamp: "11:30 AM" },
    ],
  },
  {
    id: "task-office-shooting-edit",
    title: "Video color grade & audio level balance",
    description: "4K 60fps DaVinci Resolve color treatment and dynamic range normalization.",
    workspaceId: "office",
    officePageId: "shooting-page",
    status: "in_progress",
    stage: "IN_PROGRESS",
    priority: "high",
    dueDate: new Date().toISOString().split("T")[0],
    dueTime: "14:45",
    estimatedDurationMin: 45,
    actualDurationMin: 30,
    tags: ["4K", "davinci", "reels"],
    isCompleted: false,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [
      { id: "sub-sp-8", taskId: "task-office-shooting-edit", title: "Import raw 4K clip", completed: true },
      { id: "sub-sp-9", taskId: "task-office-shooting-edit", title: "Grade skin tones", completed: true },
      { id: "sub-sp-10", taskId: "task-office-shooting-edit", title: "Normalize dialogue to -14 LUFS", completed: false },
    ],
    activity: [
      { id: "act-sp-2", taskId: "task-office-shooting-edit", action: "Color grading started", actor: "Afaq", timestamp: "01:20 PM" },
    ],
  },
  {
    id: "task-office-ismail-pub",
    title: "Classic Scene 4K Remaster Clip #108",
    description: "Archived comedy clip remaster with AI upscale and cleaned Pashto dialogue audio.",
    workspaceId: "office",
    officePageId: "ismail-shahid-fans",
    status: "published",
    stage: "PUBLISHED",
    priority: "medium",
    dueDate: new Date().toISOString().split("T")[0],
    dueTime: "12:00",
    estimatedDurationMin: 25,
    actualDurationMin: 20,
    tags: ["comedy", "classic", "reels"],
    isCompleted: true,
    completedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    subtasks: [
      { id: "sub-isf-1", taskId: "task-office-ismail-pub", title: "Select episode cut", completed: true },
      { id: "sub-isf-2", taskId: "task-office-ismail-pub", title: "Topaz 4K enhance", completed: true },
      { id: "sub-isf-3", taskId: "task-office-ismail-pub", title: "Verify live post", completed: true },
    ],
    activity: [
      { id: "act-isf-1", taskId: "task-office-ismail-pub", action: "Published to Ismail Shahid Fans", actor: "Afaq", timestamp: "12:00 PM" },
    ],
  },
  {
    id: "task-office-ismail-ready",
    title: "Upload finalized 9:16 reel to Meta Business Scheduler",
    description: "Schedule peak evening release at 6:00 PM with comedy hashtags and collaborator credits.",
    workspaceId: "office",
    officePageId: "ismail-shahid-fans",
    status: "ready",
    stage: "READY",
    priority: "medium",
    dueDate: new Date().toISOString().split("T")[0],
    dueTime: "18:00",
    estimatedDurationMin: 15,
    actualDurationMin: 0,
    tags: ["reels", "meta", "scheduler"],
    isCompleted: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [
      { id: "sub-isf-4", taskId: "task-office-ismail-ready", title: "Upload master mp4", completed: true },
      { id: "sub-isf-5", taskId: "task-office-ismail-ready", title: "Set schedule 6:00 PM", completed: true },
      { id: "sub-isf-6", taskId: "task-office-ismail-ready", title: "Double-check thumbnail preview", completed: false },
    ],
    activity: [
      { id: "act-isf-2", taskId: "task-office-ismail-ready", action: "Stage updated to READY", actor: "Afaq", timestamp: "02:00 PM" },
    ],
  },
  {
    id: "task-office-zk-edit",
    title: "Edit reel & add dynamic auto-captions with motion pop",
    description: "Standard daily content production cycle for ZK Production featuring motion kinetic subtitles.",
    workspaceId: "office",
    officePageId: "zk-production",
    status: "in_progress",
    stage: "IN_PROGRESS",
    priority: "urgent",
    dueDate: new Date().toISOString().split("T")[0],
    dueTime: "14:30",
    estimatedDurationMin: 40,
    actualDurationMin: 25,
    tags: ["reels", "captions", "tiktok"],
    isCompleted: false,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [
      { id: "sub-zk-1", taskId: "task-office-zk-edit", title: "Check new content", completed: true },
      { id: "sub-zk-2", taskId: "task-office-zk-edit", title: "Select content", completed: true },
      { id: "sub-zk-3", taskId: "task-office-zk-edit", title: "Edit", completed: true },
      { id: "sub-zk-4", taskId: "task-office-zk-edit", title: "Caption", completed: false },
      { id: "sub-zk-5", taskId: "task-office-zk-edit", title: "Hashtags", completed: false },
      { id: "sub-zk-6", taskId: "task-office-zk-edit", title: "Upload", completed: false },
      { id: "sub-zk-7", taskId: "task-office-zk-edit", title: "Verify published", completed: false },
    ],
    activity: [
      { id: "act-zk-1", taskId: "task-office-zk-edit", action: "Captions editing in progress", actor: "Afaq", timestamp: "02:10 PM" },
    ],
  },
  {
    id: "task-office-inaya-todo",
    title: "Create thumbnail for Inaya Kailash poetry reel",
    description: "Design high-contrast aesthetic calligraphy overlay in Figma for 1080x1920 mobile viewport.",
    workspaceId: "office",
    officePageId: "inaya-kailash",
    status: "todo",
    stage: "TODO",
    priority: "medium",
    dueDate: new Date().toISOString().split("T")[0],
    dueTime: "16:30",
    estimatedDurationMin: 25,
    actualDurationMin: 0,
    tags: ["figma", "reels", "thumbnail"],
    isCompleted: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [
      { id: "sub-ik-1", taskId: "task-office-inaya-todo", title: "Extract frame from poetry recitation", completed: false },
      { id: "sub-ik-2", taskId: "task-office-inaya-todo", title: "Apply gradient vignette", completed: false },
    ],
    activity: [
      { id: "act-ik-1", taskId: "task-office-inaya-todo", action: "Task queued in To Do", actor: "Afaq", timestamp: "11:30 AM" },
    ],
  },
  {
    id: "task-office-political-pub",
    title: "Morning Roundup Reel & Policy Graphic Infographic",
    description: "Quick 60-second summary of assembly proceedings and legislative digest carousel.",
    workspaceId: "office",
    officePageId: "political-affairs",
    status: "published",
    stage: "PUBLISHED",
    priority: "high",
    dueDate: new Date().toISOString().split("T")[0],
    dueTime: "09:30",
    estimatedDurationMin: 35,
    actualDurationMin: 35,
    tags: ["shorts", "news", "digest"],
    isCompleted: true,
    completedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    subtasks: [
      { id: "sub-pa-1", taskId: "task-office-political-pub", title: "Check new content", completed: true },
      { id: "sub-pa-2", taskId: "task-office-political-pub", title: "Select content", completed: true },
      { id: "sub-pa-3", taskId: "task-office-political-pub", title: "Edit", completed: true },
      { id: "sub-pa-4", taskId: "task-office-political-pub", title: "Caption", completed: true },
      { id: "sub-pa-5", taskId: "task-office-political-pub", title: "Hashtags", completed: true },
      { id: "sub-pa-6", taskId: "task-office-political-pub", title: "Upload", completed: true },
      { id: "sub-pa-7", taskId: "task-office-political-pub", title: "Verify published", completed: true },
    ],
    activity: [
      { id: "act-pa-1", taskId: "task-office-political-pub", action: "Published and verified", actor: "Afaq", timestamp: "09:30 AM" },
    ],
  },
  {
    id: "task-office-political-review",
    title: "Review carousel layout text proofs & headline accuracy",
    description: "Editorial sign-off on statistical graphics and quote citations before evening boost.",
    workspaceId: "office",
    officePageId: "political-affairs",
    status: "review",
    stage: "REVIEW",
    priority: "medium",
    dueDate: new Date().toISOString().split("T")[0],
    dueTime: "17:00",
    estimatedDurationMin: 20,
    actualDurationMin: 0,
    tags: ["review", "quotes", "editorial"],
    isCompleted: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [
      { id: "sub-pa-8", taskId: "task-office-political-review", title: "Verify source dates", completed: true },
      { id: "sub-pa-9", taskId: "task-office-political-review", title: "Check headline grammar", completed: false },
    ],
    activity: [
      { id: "act-pa-2", taskId: "task-office-political-review", action: "Submitted for editor review", actor: "Afaq", timestamp: "01:45 PM" },
    ],
  },
  {
    id: "task-office-nazia-todo",
    title: "Write caption & hashtags for vintage concert throwback",
    description: "Research historical archive date and generate SEO-optimized Pashto music hashtags.",
    workspaceId: "office",
    officePageId: "nazia-iqbal-fanz",
    status: "todo",
    stage: "TODO",
    priority: "medium",
    dueDate: new Date().toISOString().split("T")[0],
    dueTime: "20:00",
    estimatedDurationMin: 20,
    actualDurationMin: 0,
    tags: ["pashto", "music", "throwback"],
    isCompleted: false,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [
      { id: "sub-ni-1", taskId: "task-office-nazia-todo", title: "Check new content", completed: true },
      { id: "sub-ni-2", taskId: "task-office-nazia-todo", title: "Select content", completed: false },
      { id: "sub-ni-3", taskId: "task-office-nazia-todo", title: "Edit", completed: false },
      { id: "sub-ni-4", taskId: "task-office-nazia-todo", title: "Caption", completed: false },
      { id: "sub-ni-5", taskId: "task-office-nazia-todo", title: "Hashtags", completed: false },
      { id: "sub-ni-6", taskId: "task-office-nazia-todo", title: "Upload", completed: false },
      { id: "sub-ni-7", taskId: "task-office-nazia-todo", title: "Verify published", completed: false },
    ],
    activity: [
      { id: "act-ni-1", taskId: "task-office-nazia-todo", action: "Clip selected for evening drop", actor: "Afaq", timestamp: "12:40 PM" },
    ],
  },
  {
    id: "task-office-suno-loop",
    title: "Animated Canvas Loop (Spotify 9:16)",
    description: "8-second seamless fluid motion graphics for mobile streaming background in After Effects.",
    workspaceId: "office",
    officePageId: "suno-music",
    status: "review",
    stage: "REVIEW",
    priority: "medium",
    dueDate: new Date().toISOString().split("T")[0],
    dueTime: "17:00",
    estimatedDurationMin: 35,
    actualDurationMin: 30,
    tags: ["spotify", "9:16", "aftereffects"],
    isCompleted: false,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [
      { id: "sub-sm-1", taskId: "task-office-suno-loop", title: "Render loop cycle", completed: true },
      { id: "sub-sm-2", taskId: "task-office-suno-loop", title: "Test Spotify Canvas dimensions", completed: true },
      { id: "sub-sm-3", taskId: "task-office-suno-loop", title: "Check compression artifacts", completed: false },
    ],
    activity: [
      { id: "act-sm-1", taskId: "task-office-suno-loop", action: "Loop submitted for review", actor: "Afaq", timestamp: "02:20 PM" },
    ],
  },
  {
    id: "task-office-suno-visualizer",
    title: "YouTube Audio Visualizer 4K",
    description: "Reactive audio waveform spectrum overlay with dynamic particle lighting for full song drop.",
    workspaceId: "office",
    officePageId: "suno-music",
    status: "ready",
    stage: "EXPORT",
    priority: "high",
    dueDate: new Date().toISOString().split("T")[0],
    dueTime: "19:00",
    estimatedDurationMin: 45,
    actualDurationMin: 40,
    tags: ["youtube", "4K", "visualizer"],
    isCompleted: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [
      { id: "sub-sm-4", taskId: "task-office-suno-visualizer", title: "Bake particle simulation", completed: true },
      { id: "sub-sm-5", taskId: "task-office-suno-visualizer", title: "Queue Adobe Media Encoder 4K 60fps", completed: true },
    ],
    activity: [
      { id: "act-sm-2", taskId: "task-office-suno-visualizer", action: "Ready for auto-dispatch", actor: "Afaq", timestamp: "03:10 PM" },
    ],
  },
  {
    id: "task-office-suno-master",
    title: "Generative Lo-Fi Beat Mastering",
    description: "Multi-band limiter and loudness mastering (-14 LUFS) for Suno AI generative composition.",
    workspaceId: "office",
    officePageId: "suno-music",
    status: "published",
    stage: "DELIVERED",
    priority: "medium",
    dueDate: new Date().toISOString().split("T")[0],
    dueTime: "10:00",
    estimatedDurationMin: 30,
    actualDurationMin: 30,
    tags: ["audio", "mastering", "suno"],
    isCompleted: true,
    completedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    subtasks: [
      { id: "sub-sm-6", taskId: "task-office-suno-master", title: "Stem separation", completed: true },
      { id: "sub-sm-7", taskId: "task-office-suno-master", title: "LUFS normalization", completed: true },
      { id: "sub-sm-8", taskId: "task-office-suno-master", title: "Deliver wav master", completed: true },
    ],
    activity: [
      { id: "act-sm-3", taskId: "task-office-suno-master", action: "Delivered master wav", actor: "Afaq", timestamp: "10:00 AM" },
    ],
  },
];

// In-memory store for fallback/offline operations
let localTasks: Task[] = [...INITIAL_TASKS];

// Helper to normalize Supabase status values
function normalizeStatus(statusStr?: string | null): TaskStatus {
  if (!statusStr) return "todo";
  const s = statusStr.toLowerCase();
  if (s === "done") return "completed";
  if (["todo", "in_progress", "review", "ready", "published", "completed"].includes(s)) {
    return s as TaskStatus;
  }
  return "todo";
}

// Convert Supabase Database Task Row to Frontend Task Interface
function mapDbRowToTask(row: TaskDbRow, subtasks: Subtask[] = [], tags: string[] = []): Task {
  const normStatus = normalizeStatus(row.status);
  const isComp = normStatus === "completed" || Boolean(row.completed_at);

  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description || undefined,
    workspaceId: ((row.workspace_id || "office").replace("_", "-")) as WorkspaceType,
    officePageId: (row.page_id as OfficePageId) || undefined,
    pageId: row.page_id || undefined,
    projectId: row.project_id || undefined,
    status: normStatus,
    priority: (row.priority as TaskPriority) || "medium",
    dueDate: row.due_date || undefined,
    dueTime: row.due_time ? row.due_time.substring(0, 5) : undefined,
    estimatedDurationMin: row.estimated_minutes || 0,
    actualDurationMin: row.actual_minutes || 0,
    tags: tags.length > 0 ? tags : [],
    isCompleted: isComp,
    completedAt: row.completed_at || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    subtasks: subtasks,
    notes: undefined,
    activity: [
      {
        id: `act-gen-${row.id}`,
        taskId: row.id,
        action: isComp ? "Completed" : "Active in queue",
        actor: "Afaq",
        timestamp: new Date(row.updated_at || row.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ],
  };
}

function mapSubtaskRow(row: SubtaskRow): Subtask {
  return {
    id: row.id,
    taskId: row.task_id,
    title: row.title,
    completed: row.completed,
    isCompleted: row.completed,
    position: row.position,
    createdAt: row.created_at,
  };
}

export const taskService = {
  /**
   * Get filtered, sorted list of tasks
   */
  getTasks: async (filters?: TaskFilterOptions): Promise<Task[]> => {
    const todayStr = new Date().toISOString().split("T")[0];

    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from("tasks").select("*");

        // Workspace filter
        if (filters?.workspaceId && filters.workspaceId !== "all") {
          const wsDb = filters.workspaceId.replace("-", "_");
          query = query.eq("workspace_id", wsDb);
        }

        // Office Page / Page filter
        if (filters?.officePageId && filters.officePageId !== "all") {
          query = query.eq("page_id", filters.officePageId);
        } else if (filters?.pageId && filters.pageId !== "all") {
          query = query.eq("page_id", filters.pageId);
        }

        // Project filter
        if (filters?.projectId && filters.projectId !== "all") {
          query = query.eq("project_id", filters.projectId);
        }

        // Priority filter
        if (filters?.priority && filters.priority !== "all") {
          query = query.eq("priority", filters.priority as Database["public"]["Enums"]["task_priority"]);
        }

        // Status filter
        if (filters?.status && filters.status !== "all") {
          const statusValue = filters.status === "done" ? "completed" : filters.status;
          query = query.eq("status", statusValue as Database["public"]["Enums"]["task_status"]);
        }

        // Tab-specific filters
        if (filters?.tab === "today") {
          query = query.eq("due_date", todayStr);
        } else if (filters?.tab === "upcoming") {
          query = query.gt("due_date", todayStr).neq("status", "completed");
        } else if (filters?.tab === "overdue") {
          query = query.lt("due_date", todayStr).neq("status", "completed");
        } else if (filters?.tab === "completed") {
          query = query.eq("status", "completed");
        }

        // Apply Sorting
        if (filters?.sortBy === "due_time") {
          query = query.order("due_date", { ascending: filters.sortOrder !== "desc" })
                       .order("due_time", { ascending: filters.sortOrder !== "desc", nullsFirst: false });
        } else if (filters?.sortBy === "priority") {
          query = query.order("priority", { ascending: filters.sortOrder === "asc" });
        } else {
          // Default: created_date
          query = query.order("created_at", { ascending: filters?.sortOrder === "asc" });
        }

        const { data: taskRows, error } = await query;

        if (!error && taskRows) {
          // Fetch subtasks for retrieved tasks
          const taskIds = taskRows.map((t) => t.id);
          const subtasksMap: Record<string, Subtask[]> = {};

          if (taskIds.length > 0) {
            const { data: subRows } = await supabase
              .from("subtasks")
              .select("*")
              .in("task_id", taskIds)
              .order("position", { ascending: true });

            if (subRows) {
              subRows.forEach((s) => {
                if (!subtasksMap[s.task_id]) subtasksMap[s.task_id] = [];
                subtasksMap[s.task_id].push(mapSubtaskRow(s));
              });
            }
          }

          let tasks = taskRows.map((row) =>
            mapDbRowToTask(row, subtasksMap[row.id] || [])
          );

          // Apply in-memory text search if provided
          if (filters?.searchQuery?.trim()) {
            const q = filters.searchQuery.toLowerCase();
            tasks = tasks.filter(
              (t) =>
                t.title.toLowerCase().includes(q) ||
                (t.description && t.description.toLowerCase().includes(q)) ||
                t.tags.some((tag) => tag.toLowerCase().includes(q))
            );
          }

          // Apply tag filter if provided
          if (filters?.tags && filters.tags.length > 0) {
            tasks = tasks.filter((t) =>
              filters.tags!.some((filterTag) => t.tags.includes(filterTag))
            );
          }

          return tasks;
        }
      } catch (err) {
        console.warn("[taskService] Supabase live getTasks failed, using fallback:", err);
      }
    }

    // Local Fallback Processing
    let result = [...localTasks];

    // Tab filter
    if (filters?.tab === "today") {
      result = result.filter((t) => t.dueDate === todayStr);
    } else if (filters?.tab === "upcoming") {
      result = result.filter((t) => t.dueDate && t.dueDate > todayStr && !t.isCompleted);
    } else if (filters?.tab === "overdue") {
      result = result.filter((t) => t.dueDate && t.dueDate < todayStr && !t.isCompleted);
    } else if (filters?.tab === "completed") {
      result = result.filter((t) => t.isCompleted || t.status === "completed" || t.status === "done");
    }

    // Workspace filter
    if (filters?.workspaceId && filters.workspaceId !== "all") {
      result = result.filter((t) => t.workspaceId === filters.workspaceId);
    }

    // Office Page filter
    if (filters?.officePageId && filters.officePageId !== "all") {
      result = result.filter((t) => t.officePageId === filters.officePageId);
    } else if (filters?.pageId && filters.pageId !== "all") {
      result = result.filter((t) => t.pageId === filters.pageId || t.officePageId === filters.pageId);
    }

    // Project filter
    if (filters?.projectId && filters.projectId !== "all") {
      result = result.filter((t) => t.projectId === filters.projectId);
    }

    // Priority filter
    if (filters?.priority && filters.priority !== "all") {
      result = result.filter((t) => t.priority === filters.priority);
    }

    // Status filter
    if (filters?.status && filters.status !== "all") {
      const targetStatus = filters.status === "done" ? "completed" : filters.status;
      result = result.filter((t) => t.status === targetStatus);
    }

    // Search query
    if (filters?.searchQuery?.trim()) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    // Tag filter
    if (filters?.tags && filters.tags.length > 0) {
      result = result.filter((t) =>
        filters.tags!.some((filterTag) => t.tags.includes(filterTag))
      );
    }

    // Sorting
    if (filters?.sortBy === "due_time") {
      result.sort((a, b) => {
        const timeA = `${a.dueDate || "9999"} ${a.dueTime || "23:59"}`;
        const timeB = `${b.dueDate || "9999"} ${b.dueTime || "23:59"}`;
        return filters.sortOrder === "desc" ? timeB.localeCompare(timeA) : timeA.localeCompare(timeB);
      });
    } else if (filters?.sortBy === "priority") {
      const priorityWeights: Record<string, number> = { high: 3, medium: 2, low: 1 };
      result.sort((a, b) => {
        const diff = (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0);
        return filters.sortOrder === "asc" ? -diff : diff;
      });
    } else {
      // created_date default
      result.sort((a, b) => {
        const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return filters?.sortOrder === "asc" ? -diff : diff;
      });
    }

    return result;
  },

  /**
   * Get single task with full subtasks, notes, and activity
   */
  getTaskById: async (id: string): Promise<Task | null> => {
    if (isSupabaseConfigured()) {
      try {
        const { data: taskRow, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (!error && taskRow) {
          // Fetch subtasks
          const { data: subRows } = await supabase
            .from("subtasks")
            .select("*")
            .eq("task_id", id)
            .order("position", { ascending: true });

          // Fetch notes
          const { data: noteRows } = await supabase
            .from("notes")
            .select("*")
            .eq("task_id", id)
            .maybeSingle();

          const subtasks = subRows ? subRows.map(mapSubtaskRow) : [];
          const task = mapDbRowToTask(taskRow, subtasks);
          if (noteRows) {
            task.notes = noteRows.content || undefined;
          }
          return task;
        }
      } catch (err) {
        console.warn("[taskService] getTaskById live failed:", err);
      }
    }

    const local = localTasks.find((t) => t.id === id);
    return local ? { ...local } : null;
  },

  /**
   * Create task in Supabase and update local cache
   */
  createTask: async (input: CreateTaskInput): Promise<Task> => {
    const defaultDate = input.dueDate || new Date().toISOString().split("T")[0];
    const defaultTime = input.dueTime || "17:00";
    const status = input.status || "todo";
    const priority = input.priority || "medium";

    if (isSupabaseConfigured()) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const insertPayload: Database["public"]["Tables"]["tasks"]["Insert"] = {
            user_id: user.id,
            workspace_id: input.workspaceId.replace("-", "_"),
            page_id: input.pageId || input.officePageId || null,
            project_id: input.projectId || null,
            title: input.title,
            description: input.description || null,
            status: status === "done" ? "completed" : status,
            priority: priority,
            due_date: defaultDate,
            due_time: defaultTime,
            estimated_minutes: input.estimatedDurationMin || 0,
            actual_minutes: 0,
          };

          const { data: createdTaskRow, error } = await supabase
            .from("tasks")
            .insert(insertPayload)
            .select()
            .single();

          if (!error && createdTaskRow) {
            const taskId = createdTaskRow.id;
            const createdSubtasks: Subtask[] = [];

            // Insert initial subtasks if present
            if (input.subtasks && input.subtasks.length > 0) {
              const subtaskInserts = input.subtasks.map((title, idx) => ({
                task_id: taskId,
                title,
                completed: false,
                position: idx,
              }));

              const { data: subRows } = await supabase
                .from("subtasks")
                .insert(subtaskInserts)
                .select();

              if (subRows) {
                createdSubtasks.push(...subRows.map(mapSubtaskRow));
              }
            }

            // Insert notes if present
            if (input.notes) {
              await supabase.from("notes").insert({
                user_id: user.id,
                workspace_id: input.workspaceId.replace("-", "_"),
                task_id: taskId,
                title: input.title,
                content: input.notes,
              });
            }

            const createdTask = mapDbRowToTask(createdTaskRow, createdSubtasks, input.tags || []);
            createdTask.notes = input.notes;
            localTasks.unshift(createdTask);
            return createdTask;
          }
        }
      } catch (err) {
        console.warn("[taskService] Live task insertion failed, falling back:", err);
      }
    }

    // Local Fallback Creation
    const newId = `task-${Date.now()}`;
    const localSubtasks: Subtask[] = (input.subtasks || []).map((subTitle, idx) => ({
      id: `sub-${Date.now()}-${idx}`,
      taskId: newId,
      title: subTitle,
      completed: false,
      isCompleted: false,
      position: idx,
    }));

    const newTask: Task = {
      id: newId,
      title: input.title,
      description: input.description,
      workspaceId: input.workspaceId,
      officePageId: input.officePageId,
      pageId: input.pageId,
      projectId: input.projectId,
      status: status,
      stage: input.stage || (status === "completed" ? "PUBLISHED" : "TODO"),
      priority: priority,
      dueDate: defaultDate,
      dueTime: defaultTime,
      estimatedDurationMin: input.estimatedDurationMin || 30,
      actualDurationMin: 0,
      tags: input.tags || ["task"],
      isCompleted: status === "completed" || status === "done",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subtasks: localSubtasks,
      notes: input.notes,
      activity: [
        {
          id: `act-${Date.now()}`,
          taskId: newId,
          action: "Task created",
          actor: "Afaq",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    };

    localTasks.unshift(newTask);
    return newTask;
  },

  /**
   * Update task property
   */
  updateTask: async (id: string, updates: UpdateTaskInput): Promise<Task | null> => {
    if (isSupabaseConfigured()) {
      try {
        const updatePayload: Database["public"]["Tables"]["tasks"]["Update"] = {};
        if (updates.title !== undefined) updatePayload.title = updates.title;
        if (updates.description !== undefined) updatePayload.description = updates.description;
        if (updates.workspaceId !== undefined) {
          updatePayload.workspace_id = updates.workspaceId.replace("-", "_");
        }
        if (updates.pageId !== undefined || updates.officePageId !== undefined) {
          updatePayload.page_id = updates.pageId || updates.officePageId || null;
        }
        if (updates.projectId !== undefined) updatePayload.project_id = updates.projectId;
        if (updates.priority !== undefined) updatePayload.priority = updates.priority;
        if (updates.status !== undefined) {
          updatePayload.status = updates.status === "done" ? "completed" : updates.status;
          if (updates.status === "completed" || updates.status === "done") {
            updatePayload.completed_at = new Date().toISOString();
          } else {
            updatePayload.completed_at = null;
          }
        }
        if (updates.dueDate !== undefined) updatePayload.due_date = updates.dueDate;
        if (updates.dueTime !== undefined) updatePayload.due_time = updates.dueTime;
        if (updates.estimatedDurationMin !== undefined) {
          updatePayload.estimated_minutes = updates.estimatedDurationMin;
        }
        if (updates.actualDurationMin !== undefined) {
          updatePayload.actual_minutes = updates.actualDurationMin;
        }

        const { data: updatedRow, error } = await supabase
          .from("tasks")
          .update(updatePayload)
          .eq("id", id)
          .select()
          .single();

        if (!error && updatedRow) {
          const updatedTask = mapDbRowToTask(updatedRow);
          // Sync local
          const idx = localTasks.findIndex((t) => t.id === id);
          if (idx !== -1) {
            localTasks[idx] = { ...localTasks[idx], ...updatedTask };
          }
          return updatedTask;
        }
      } catch (err) {
        console.warn("[taskService] updateTask live failed:", err);
      }
    }

    // Local update
    const idx = localTasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    const current = localTasks[idx];
    const isCompleted =
      updates.status !== undefined
        ? updates.status === "completed" || updates.status === "done"
        : current.isCompleted;

    const updated: Task = {
      ...current,
      ...updates,
      isCompleted,
      completedAt: isCompleted ? current.completedAt || new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
      activity: [
        ...(current.activity || []),
        {
          id: `act-${Date.now()}`,
          taskId: id,
          action: `Updated task properties`,
          actor: "Afaq",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    };

    localTasks[idx] = updated;
    return { ...updated };
  },

  /**
   * Update task status (TODO, IN_PROGRESS, REVIEW, READY, COMPLETED)
   */
  updateTaskStatus: async (id: string, status: TaskStatus): Promise<Task | null> => {
    const isComp = status === "completed" || status === "done";

    if (isSupabaseConfigured()) {
      try {
        const updatePayload: Database["public"]["Tables"]["tasks"]["Update"] = {
          status: isComp ? "completed" : status,
          completed_at: isComp ? new Date().toISOString() : null,
        };

        const { data, error } = await supabase
          .from("tasks")
          .update(updatePayload)
          .eq("id", id)
          .select()
          .single();

        if (!error && data) {
          const task = mapDbRowToTask(data);
          const idx = localTasks.findIndex((t) => t.id === id);
          if (idx !== -1) {
            localTasks[idx] = { ...localTasks[idx], ...task };
          }
          return task;
        }
      } catch (err) {
        console.warn("[taskService] updateTaskStatus live failed:", err);
      }
    }

    const idx = localTasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    localTasks[idx].status = status;
    localTasks[idx].isCompleted = isComp;
    localTasks[idx].completedAt = isComp ? new Date().toISOString() : undefined;
    localTasks[idx].updatedAt = new Date().toISOString();
    localTasks[idx].activity = [
      ...(localTasks[idx].activity || []),
      {
        id: `act-${Date.now()}`,
        taskId: id,
        action: `Status changed to ${status.toUpperCase()}`,
        actor: "Afaq",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];

    return { ...localTasks[idx] };
  },

  /**
   * Update task workflow stage (e.g. IDEAS, TODO, IN_PROGRESS, REVIEW, READY, PUBLISHED)
   */
  updateTaskStage: async (id: string, stage: string, explicitStatus?: TaskStatus): Promise<Task | null> => {
    let derivedStatus: TaskStatus = explicitStatus || "todo";
    const s = stage.toUpperCase();
    if (!explicitStatus) {
      if (s === "PUBLISHED" || s === "DELIVERED" || s === "DONE") {
        derivedStatus = "published";
      } else if (s === "READY" || s === "EXPORT") {
        derivedStatus = "ready";
      } else if (s === "REVIEW") {
        derivedStatus = "review";
      } else if (s === "IN_PROGRESS" || s === "DESIGN" || s === "RECORDING" || s === "EDITING") {
        derivedStatus = "in_progress";
      } else {
        derivedStatus = "todo";
      }
    }

    const isComp = derivedStatus === "completed" || derivedStatus === "published";

    if (isSupabaseConfigured()) {
      try {
        const dbStatus = isComp
          ? "completed"
          : derivedStatus === "done"
          ? "completed"
          : derivedStatus;

        const updatePayload: Database["public"]["Tables"]["tasks"]["Update"] = {
          status: dbStatus as Database["public"]["Enums"]["task_status"],
          completed_at: isComp ? new Date().toISOString() : null,
        };

        await supabase
          .from("tasks")
          .update(updatePayload)
          .eq("id", id);
      } catch (err) {
        console.warn("[taskService] updateTaskStage live failed:", err);
      }
    }

    // Sync local
    const idx = localTasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    localTasks[idx].stage = stage;
    localTasks[idx].status = derivedStatus;
    localTasks[idx].isCompleted = isComp;
    localTasks[idx].completedAt = isComp ? new Date().toISOString() : undefined;
    localTasks[idx].updatedAt = new Date().toISOString();
    localTasks[idx].activity = [
      ...(localTasks[idx].activity || []),
      {
        id: `act-${Date.now()}`,
        taskId: id,
        action: `Moved stage to ${stage}`,
        actor: "Afaq",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];

    return { ...localTasks[idx] };
  },

  /**
   * Toggle task completion
   */
  toggleTaskCompletion: async (id: string): Promise<Task | null> => {
    const current = await taskService.getTaskById(id);
    if (!current) return null;

    const nextCompleted = !current.isCompleted;
    const nextStatus: TaskStatus = nextCompleted ? "completed" : "todo";

    return taskService.updateTaskStatus(id, nextStatus);
  },

  /**
   * Delete task
   */
  deleteTask: async (id: string): Promise<boolean> => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from("tasks").delete().eq("id", id);
        if (!error) {
          localTasks = localTasks.filter((t) => t.id !== id);
          return true;
        }
      } catch (err) {
        console.warn("[taskService] deleteTask live failed:", err);
      }
    }

    const prevLen = localTasks.length;
    localTasks = localTasks.filter((t) => t.id !== id);
    return localTasks.length < prevLen;
  },

  /**
   * Subtask Operations
   */
  createSubtask: async (taskId: string, title: string): Promise<Subtask | null> => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("subtasks")
          .insert({
            task_id: taskId,
            title,
            completed: false,
            position: 99,
          })
          .select()
          .single();

        if (!error && data) {
          const sub = mapSubtaskRow(data);
          const task = localTasks.find((t) => t.id === taskId);
          if (task) {
            task.subtasks = [...(task.subtasks || []), sub];
          }
          return sub;
        }
      } catch (err) {
        console.warn("[taskService] createSubtask live failed:", err);
      }
    }

    const newSub: Subtask = {
      id: `sub-${Date.now()}`,
      taskId,
      title,
      completed: false,
      isCompleted: false,
      position: 99,
      createdAt: new Date().toISOString(),
    };

    const task = localTasks.find((t) => t.id === taskId);
    if (task) {
      task.subtasks = [...(task.subtasks || []), newSub];
    }
    return newSub;
  },

  updateSubtask: async (
    subtaskId: string,
    updates: { title?: string; completed?: boolean; position?: number }
  ): Promise<Subtask | null> => {
    if (isSupabaseConfigured()) {
      try {
        const updatePayload: Database["public"]["Tables"]["subtasks"]["Update"] = {};
        if (updates.title !== undefined) updatePayload.title = updates.title;
        if (updates.completed !== undefined) updatePayload.completed = updates.completed;
        if (updates.position !== undefined) updatePayload.position = updates.position;

        const { data, error } = await supabase
          .from("subtasks")
          .update(updatePayload)
          .eq("id", subtaskId)
          .select()
          .single();

        if (!error && data) {
          const sub = mapSubtaskRow(data);
          // Sync local
          localTasks.forEach((t) => {
            if (t.subtasks) {
              const idx = t.subtasks.findIndex((s) => s.id === subtaskId);
              if (idx !== -1) t.subtasks[idx] = sub;
            }
          });
          return sub;
        }
      } catch (err) {
        console.warn("[taskService] updateSubtask live failed:", err);
      }
    }

    let found: Subtask | null = null;
    localTasks.forEach((t) => {
      if (t.subtasks) {
        const idx = t.subtasks.findIndex((s) => s.id === subtaskId);
        if (idx !== -1) {
          t.subtasks[idx] = {
            ...t.subtasks[idx],
            ...updates,
            completed: updates.completed !== undefined ? updates.completed : t.subtasks[idx].completed,
            isCompleted: updates.completed !== undefined ? updates.completed : t.subtasks[idx].completed,
          };
          found = t.subtasks[idx];
        }
      }
    });

    return found;
  },

  toggleSubtask: async (subtaskId: string): Promise<Subtask | null> => {
    let currentCompleted = false;
    localTasks.forEach((t) => {
      const found = (t.subtasks || []).find((s) => s.id === subtaskId);
      if (found) currentCompleted = Boolean(found.completed || found.isCompleted);
    });
    return taskService.updateSubtask(subtaskId, { completed: !currentCompleted });
  },

  deleteSubtask: async (subtaskId: string): Promise<boolean> => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from("subtasks").delete().eq("id", subtaskId);
        if (!error) {
          localTasks.forEach((t) => {
            if (t.subtasks) {
              t.subtasks = t.subtasks.filter((s) => s.id !== subtaskId);
            }
          });
          return true;
        }
      } catch (err) {
        console.warn("[taskService] deleteSubtask live failed:", err);
      }
    }

    localTasks.forEach((t) => {
      if (t.subtasks) {
        t.subtasks = t.subtasks.filter((s) => s.id !== subtaskId);
      }
    });
    return true;
  },

  reorderSubtasks: async (taskId: string, orderedIds: string[]): Promise<boolean> => {
    if (isSupabaseConfigured()) {
      try {
        const updates = orderedIds.map((id, index) =>
          supabase.from("subtasks").update({ position: index }).eq("id", id)
        );
        await Promise.all(updates);
      } catch (err) {
        console.warn("[taskService] reorderSubtasks live failed:", err);
      }
    }

    const task = localTasks.find((t) => t.id === taskId);
    if (task && task.subtasks) {
      task.subtasks.sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id));
    }
    return true;
  },

  /**
   * Calculate task statistics for Dashboard and summary cards
   */
  getTaskStats: async () => {
    const tasks = await taskService.getTasks();
    const todayStr = new Date().toISOString().split("T")[0];

    const total = tasks.length;
    const completed = tasks.filter((t) => t.isCompleted || t.status === "completed").length;
    const pending = total - completed;
    const overdue = tasks.filter((t) => t.dueDate && t.dueDate < todayStr && !t.isCompleted).length;
    const highPriority = tasks.filter((t) => t.priority === "high" && !t.isCompleted).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      pending,
      overdue,
      highPriority,
      rate,
    };
  },
};
