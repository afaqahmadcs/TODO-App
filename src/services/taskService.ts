import {
  Task,
  TaskFilterOptions,
  CreateTaskInput,
  UpdateTaskInput,
  Subtask,
  TaskStatus,
  TaskPriority,
  SocialPlatform,
  ThumbnailStatus,
} from "@/types/task";
import { WorkspaceType, OfficePageId } from "@/types/workspace";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Database, TaskDbRow, SubtaskRow } from "@/types/database";
import { authService } from "./authService";

// Seeded local initial tasks representing realistic data across the 4 workspaces
const INITIAL_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Edit ZK Production Reel",
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
    title: "Prepare Jahangir Khan Content",
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
    title: "Create Suno Music Visual",
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
    id: "task-personal-ep42",
    title: "Record Daily Vlog",
    description: "Vlog documenting the dual life of morning agency client work followed by coding the Next.js portfolio website navbar and state management.",
    workspaceId: "personal",
    status: "in_progress",
    stage: "FOOTAGE READY",
    priority: "high",
    dueDate: new Date().toISOString().split("T")[0],
    dueTime: "18:30",
    estimatedDurationMin: 90,
    actualDurationMin: 30,
    tags: ["vlog", "b-roll", "sony-a7iv", "portfolio"],
    linkedVlogEpisode: "EP #42",
    isCompleted: false,
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    updatedAt: new Date().toISOString(),
    thumbnailStatus: "approved",
    thumbnailUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2VJD5USG40NPDu6AthW2xx5syMrwq-35JwrcLyFAB1Pj-J_vQuizMI22CyI3P-J6gq-LnDo0MdPhnyzw0_LQ-RInpDCFu3NTR7Exhn3KtBv2VgOElbQeDB-aVV_WxTKA3z_F2M97Ytc3RAnaLRd-tJUG58fFsamTCn02N_4SvFG7SK1eUa_q1xDBkgqOP7OQilmM7yxwPn11PFK0-xE9R97TLVxlqkCQ8Adej0uemSz18KVAZYqWEBA",
    caption: "Balancing agency clients with college & building my dream portfolio from scratch. Day 12 of the web dev journey is live! 🔥 #developer #vlog #productivity",
    platforms: ["YouTube", "Instagram", "TikTok", "Facebook", "X"],
    publishingStatus: "scheduled",
    distributionStatus: {
      YouTube: "SCHED 07:00 PM",
      Instagram: "VERIFIED ✓",
      TikTok: "DRAFT SAVED",
      Facebook: "PENDING",
      X: "COPY APPROVED",
    },
    recordingChecklist: [
      { id: "rc-1", title: "Morning desk setup B-roll (Sony A7IV 24mm f1.4)", completed: true },
      { id: "rc-2", title: "Commute & college lecture vlog clip", completed: true },
      { id: "rc-3", title: "Screen recording of coding session (OBS 4K 60fps)", completed: true },
      { id: "rc-4", title: "Shure SM7B voiceover commentary track", completed: false },
      { id: "rc-5", title: "Golden hour outro talk-to-camera", completed: false },
    ],
    editingChecklist: [
      { id: "ec-1", title: "Rough assembly", completed: true },
      { id: "ec-2", title: "L-cut transitions", completed: true },
      { id: "ec-3", title: "Synthwave LUT", completed: false },
      { id: "ec-4", title: "Motion code FX", completed: false },
    ],
    subtasks: [
      { id: "sub-9", taskId: "task-personal-ep42", title: "Record A-Roll desk tour intro", completed: true },
      { id: "sub-10", taskId: "task-personal-ep42", title: "Record coding screen capture", completed: true },
      { id: "sub-11", taskId: "task-personal-ep42", title: "Record Shure SM7B voiceover", completed: false },
      { id: "sub-12", taskId: "task-personal-ep42", title: "Upload raw footage to library", completed: false },
    ],
    notes: "Audio sync matched via Tentacle Sync Jam-Sync • 48kHz 24-bit WAV dual-channel.",
    activity: [
      { id: "act-5", taskId: "task-personal-ep42", action: "Footage ingested into Final Cut", actor: "Afaq", timestamp: "02:15 PM" },
    ],
  },
  {
    id: "task-personal-ep41",
    title: "Upload Vlog",
    description: "Documenting early morning study routine and graph algorithm lab preparation.",
    workspaceId: "personal",
    status: "published",
    stage: "PUBLISHED",
    priority: "medium",
    dueDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    dueTime: "10:00",
    tags: ["vlog", "college", "morning"],
    linkedVlogEpisode: "EP #41",
    isCompleted: true,
    completedAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    thumbnailStatus: "approved",
    caption: "Early mornings as a CS major. Balancing code, gym, and coursework. 📚💻",
    platforms: ["YouTube", "Instagram"],
    publishingStatus: "published",
    distributionStatus: {
      YouTube: "PUBLISHED (4.2k views)",
      Instagram: "PUBLISHED (14k plays)",
    },
    recordingChecklist: [
      { id: "rc-41-1", title: "Sunrise coffee brewing shot", completed: true },
      { id: "rc-41-2", title: "Desk time-lapse", completed: true },
    ],
    editingChecklist: [
      { id: "ec-41-1", title: "Color grade rec709", completed: true },
      { id: "ec-41-2", title: "Audio clean RX10", completed: true },
    ],
    subtasks: [],
    notes: "Archived to YouTube creator library.",
    activity: [
      { id: "act-41-1", taskId: "task-personal-ep41", action: "Published on all channels", actor: "Afaq", timestamp: "Yesterday" },
    ],
  },
  {
    id: "task-personal-ep43",
    title: "Edit Daily Vlog",
    description: "High-paced agency editing day with Suno Music design delivery.",
    workspaceId: "personal",
    status: "in_progress",
    stage: "EDITING",
    priority: "high",
    dueDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    dueTime: "19:00",
    tags: ["vlog", "office", "suno"],
    linkedVlogEpisode: "EP #43",
    isCompleted: false,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date().toISOString(),
    thumbnailStatus: "designed",
    caption: "Inside our creative agency pipeline: Managing 8 client channels in one day!",
    platforms: ["YouTube", "TikTok"],
    publishingStatus: "draft",
    distributionStatus: {
      YouTube: "READY TO EXPORT",
      TikTok: "DRAFT IN TIMELINE",
    },
    recordingChecklist: [
      { id: "rc-43-1", title: "Dual monitor setup b-roll", completed: true },
      { id: "rc-43-2", title: "Team sync screen recording", completed: true },
    ],
    editingChecklist: [
      { id: "ec-43-1", title: "Rough assembly cut", completed: true },
      { id: "ec-43-2", title: "Audio track compression", completed: true },
      { id: "ec-43-3", title: "Motion text overlays", completed: false },
    ],
    subtasks: [],
    notes: "Premiere Pro project synced to local NAS.",
    activity: [],
  },
  {
    id: "task-personal-ep44",
    title: "Create Vlog Thumbnail",
    description: "Design high-CTR 1280x720 thumbnail with high-contrast text overlay.",
    workspaceId: "personal",
    status: "todo",
    stage: "RECORDING",
    priority: "medium",
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
    dueTime: "17:00",
    tags: ["vlog", "webdev", "class"],
    linkedVlogEpisode: "EP #44",
    isCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    thumbnailStatus: "pending",
    caption: "Next.js 15 deep dive + building the portfolio that will get me hired.",
    platforms: ["YouTube", "Instagram", "X"],
    publishingStatus: "draft",
    recordingChecklist: [
      { id: "rc-44-1", title: "Virtual lab screen recording", completed: false },
      { id: "rc-44-2", title: "Voiceover microphone test", completed: false },
    ],
    editingChecklist: [],
    subtasks: [],
    activity: [],
  },
  {
    id: "task-personal-ep45",
    title: "Write Vlog Caption",
    description: "Unfiltered thoughts on solo entrepreneurship and learning computer science.",
    workspaceId: "personal",
    status: "todo",
    stage: "IDEA",
    priority: "low",
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0],
    tags: ["vlog", "reflections"],
    linkedVlogEpisode: "EP #45",
    isCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    thumbnailStatus: "pending",
    caption: "What no one tells you about learning to code while running a business.",
    platforms: ["YouTube"],
    publishingStatus: "draft",
    recordingChecklist: [],
    editingChecklist: [],
    subtasks: [],
    activity: [],
  },
  {
    id: "task-web-navbar",
    title: "Build Portfolio Website",
    description: "Construct responsive portfolio website with project showcases, dynamic case studies, and fast performance.",
    workspaceId: "web-development",
    status: "ready",
    stage: "SPRINT",
    priority: "high",
    dueDate: new Date().toISOString().split("T")[0],
    dueTime: "20:00",
    estimatedDurationMin: 45,
    actualDurationMin: 35,
    tags: ["nextjs15", "tailwind", "responsive"],
    githubBranchOrCommit: "main@8f2a1b",
    linkedVlogId: "task-personal-ep42", // RELATIONAL FOREIGN-KEY REFERENCE
    isCompleted: false,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [
      { id: "sub-wn-1", taskId: "task-web-navbar", title: "Implement backdrop blur header", completed: true },
      { id: "sub-wn-2", taskId: "task-web-navbar", title: "Add mobile touch drawer navigation", completed: true },
      { id: "sub-wn-3", taskId: "task-web-navbar", title: "Keyboard focus trap tests", completed: false },
    ],
    notes: "Vlog target linked: EP #42 (Timeline 04:15).",
    activity: [],
  },
  {
    id: "task-web-supabase",
    title: "Deploy PostgreSQL database on Supabase & auth edge functions",
    description: "Configure multi-workspace RLS policies, connection pooling, and optimistic indexing.",
    workspaceId: "web-development",
    status: "completed",
    stage: "DONE",
    priority: "high",
    dueDate: new Date().toISOString().split("T")[0],
    dueTime: "15:00",
    estimatedDurationMin: 60,
    actualDurationMin: 55,
    tags: ["database", "supabase", "postgres"],
    githubBranchOrCommit: "feat/supabase-migrations",
    linkedVlogId: "task-personal-ep42", // RELATIONAL FOREIGN-KEY REFERENCE
    isCompleted: true,
    completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    subtasks: [
      { id: "sub-ws-1", taskId: "task-web-supabase", title: "Write 12 table DDL migration", completed: true },
      { id: "sub-ws-2", taskId: "task-web-supabase", title: "Verify RLS policies", completed: true },
    ],
    notes: "32m screen recording ingested for EP #42.",
    activity: [],
  },
  {
    id: "task-web-nextauth",
    title: "Attend Web Development Class",
    description: "Attend evening fullstack web development session covering Next.js App Router, server state, and API routing.",
    workspaceId: "web-development",
    status: "in_progress",
    stage: "SPRINT",
    priority: "high",
    dueDate: new Date().toISOString().split("T")[0],
    dueTime: "22:00",
    estimatedDurationMin: 90,
    actualDurationMin: 45,
    tags: ["nextauth", "jwt", "security"],
    githubBranchOrCommit: "feat/auth-tokens",
    linkedVlogId: "task-personal-ep43", // RELATIONAL FOREIGN-KEY REFERENCE
    isCompleted: false,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [
      { id: "sub-na-1", taskId: "task-web-nextauth", title: "Configure session rotation", completed: true },
      { id: "sub-na-2", taskId: "task-web-nextauth", title: "Handle edge auth middleware", completed: false },
    ],
    notes: "Vlog EP #43: Debugging Auth at 2AM & Why JWTs are Hard.",
    activity: [],
  },
  {
    id: "task-web-ratelimit",
    title: "Fix Responsive Layout",
    description: "Fix mobile navigation drawer, header spacing, and responsive card wrapping across breakpoints.",
    workspaceId: "web-development",
    status: "ready",
    stage: "SPRINT",
    priority: "high",
    dueDate: new Date().toISOString().split("T")[0],
    dueTime: "18:00",
    estimatedDurationMin: 40,
    actualDurationMin: 30,
    tags: ["redis", "ratelimit", "api"],
    githubBranchOrCommit: "feat/rate-limit",
    linkedVlogId: "task-personal-ep42", // RELATIONAL FOREIGN-KEY REFERENCE
    isCompleted: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [
      { id: "sub-rl-1", taskId: "task-web-ratelimit", title: "Write unit tests for sliding window", completed: true },
      { id: "sub-rl-2", taskId: "task-web-ratelimit", title: "Deploy to staging edge worker", completed: true },
    ],
    activity: [],
  },
  {
    id: "task-web-leetcode",
    title: "Practice JavaScript",
    description: "Practice modern JavaScript language features, async patterns, closures, and algorithmic problem solving.",
    workspaceId: "web-development",
    status: "in_progress",
    stage: "PRACTICE",
    priority: "medium",
    dueDate: new Date().toISOString().split("T")[0],
    dueTime: "17:30",
    estimatedDurationMin: 45,
    actualDurationMin: 20,
    tags: ["leetcode", "algorithms", "graph"],
    githubBranchOrCommit: "leetcode/graph",
    isCompleted: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [],
    activity: [],
  },
  {
    id: "task-web-combobox",
    title: "Build TaskFlow Feature",
    description: "Build multi-workspace task filtering, drawer animations, and keyboard shortcuts.",
    workspaceId: "web-development",
    status: "todo",
    stage: "SPRINT",
    priority: "medium",
    dueDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    dueTime: "16:00",
    estimatedDurationMin: 40,
    tags: ["ui", "combobox", "a11y"],
    githubBranchOrCommit: "ui/combobox",
    isCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [],
    activity: [],
  },
  {
    id: "task-college-cs301-lec",
    title: "Attend College Class",
    description: "Lecture session covering algorithms, data structures, and computational thinking.",
    workspaceId: "college",
    collegeCategory: "classes",
    subject: "Computer Science",
    roomOrLocation: "Room 402",
    instructor: "Prof. Vance",
    dueTime: "08:00 AM - 09:30 AM",
    status: "completed",
    priority: "high",
    isCompleted: true,
    tags: ["lecture", "college", "academics"],
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date().toISOString(),
    notes: "Lecture slides and notes synced to college workspace.",
    subtasks: [],
    activity: [],
  },
  {
    id: "task-college-cs340-lec",
    title: "Attend Database Lab Session",
    description: "Hands-on laboratory session for relational database queries and schema design.",
    workspaceId: "college",
    collegeCategory: "classes",
    subject: "Computer Science",
    roomOrLocation: "Lab 3B",
    instructor: "Prof. Reynolds",
    dueTime: "11:30 AM - 01:00 PM",
    status: "in_progress",
    priority: "medium",
    isCompleted: false,
    tags: ["lab", "databases", "college"],
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date().toISOString(),
    notes: "Database cluster configured on localhost:5432.",
    subtasks: [],
    activity: [],
  },
  {
    id: "task-college-math204-lec",
    title: "Attend Mathematics Class",
    description: "Discrete mathematics concepts, algorithmic logic, and mathematical proofs.",
    workspaceId: "college",
    collegeCategory: "classes",
    subject: "Mathematics",
    roomOrLocation: "Hall B",
    instructor: "Dr. Cho",
    dueTime: "Friday • 10:00 AM",
    status: "todo",
    priority: "medium",
    isCompleted: false,
    tags: ["math", "discrete", "college"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: "Pre-reading textbook chapter 5.",
    subtasks: [],
    activity: [],
  },
  {
    id: "task-college-assign-1",
    title: "Complete Assignment",
    description: "Solve weekly problem set exercises and format assignment submission.",
    workspaceId: "college",
    collegeCategory: "assignments",
    subject: "Computer Science",
    status: "in_progress",
    priority: "high",
    dueDate: new Date().toISOString().split("T")[0],
    dueTime: "17:00",
    estimatedDurationMin: 120,
    actualDurationMin: 60,
    progressPercent: 85,
    tags: ["assignment", "college", "coursework"],
    isCompleted: false,
    notes: "Due today 5:00 PM. Format and submit final PDF.",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [
      { id: "sub-ca-1", taskId: "task-college-assign-1", title: "Review problem set requirements", completed: true },
      { id: "sub-ca-2", taskId: "task-college-assign-1", title: "Complete calculations and proofs", completed: true },
      { id: "sub-ca-3", taskId: "task-college-assign-1", title: "Format and submit final PDF", completed: false },
    ],
    activity: [],
  },
  {
    id: "task-college-assign-2",
    title: "Review Lecture Notes",
    description: "Synthesize key insights and review class slides from today's morning lectures.",
    workspaceId: "college",
    collegeCategory: "notes",
    subject: "Computer Science",
    status: "todo",
    priority: "medium",
    dueDate: new Date().toISOString().split("T")[0],
    dueTime: "19:00",
    estimatedDurationMin: 45,
    progressPercent: 0,
    tags: ["notes", "review", "college"],
    isCompleted: false,
    notes: "Synthesize diagrams and core takeaway points.",
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [],
    activity: [],
  },
  {
    id: "task-college-assign-3",
    title: "Prepare Class Work",
    description: "Read syllabus material and prepare exercises ahead of tomorrow's college class.",
    workspaceId: "college",
    collegeCategory: "classes",
    subject: "Computer Science",
    status: "todo",
    priority: "medium",
    dueDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    dueTime: "14:00",
    estimatedDurationMin: 60,
    progressPercent: 20,
    tags: ["classwork", "preparation", "college"],
    isCompleted: false,
    notes: "Focus on practice exercises and workbook questions.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [],
    activity: [],
  },
  {
    id: "task-college-assign-4",
    title: "Review Midterm Study Guide",
    description: "Comprehensive review of core exam questions, formulas, and study guide topics.",
    workspaceId: "college",
    collegeCategory: "exams",
    subject: "Computer Science",
    status: "in_progress",
    priority: "high",
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
    dueTime: "18:00",
    estimatedDurationMin: 120,
    progressPercent: 60,
    tags: ["study", "midterm", "college"],
    isCompleted: false,
    notes: "Review past test papers and summarize key formulas.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [],
    activity: [],
  },
  {
    id: "task-college-proj-1",
    title: "Submit College Lab Report",
    description: "Finalize laboratory measurements, analysis diagrams, and submit lab report.",
    workspaceId: "college",
    collegeCategory: "assignments",
    subject: "Computer Science",
    status: "in_progress",
    priority: "medium",
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    progressPercent: 75,
    focusHours: 12.0,
    tags: ["lab", "report", "college"],
    isCompleted: false,
    notes: "Review benchmark charts and format citations.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [
      { id: "sub-cp-1", taskId: "task-college-proj-1", title: "Compile experimental measurements", completed: true },
      { id: "sub-cp-2", taskId: "task-college-proj-1", title: "Plot latency and performance graphs", completed: true },
      { id: "sub-cp-3", taskId: "task-college-proj-1", title: "Write conclusion and submit report", completed: false },
    ],
    activity: [],
  },
  {
    id: "task-college-proj-2",
    title: "Course Project Milestone",
    description: "Implement core system architecture requirements for semester course project.",
    workspaceId: "college",
    collegeCategory: "projects",
    subject: "Computer Science",
    status: "ready",
    priority: "high",
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0],
    progressPercent: 80,
    focusHours: 18.5,
    tags: ["project", "coursework", "college"],
    isCompleted: false,
    notes: "Code review and module tests passed.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [],
    activity: [],
  },
  {
    id: "task-college-exam-1",
    title: "Prepare Presentation Slides",
    description: "Design slide deck for seminar presentation on system architecture.",
    workspaceId: "college",
    collegeCategory: "classes",
    subject: "Computer Science",
    status: "todo",
    priority: "medium",
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split("T")[0],
    progressPercent: 40,
    tags: ["presentation", "slides", "college"],
    isCompleted: false,
    notes: "Prepare outline and speaker speaking notes.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [],
    activity: [],
  },
  {
    id: "task-college-exam-2",
    title: "Finalize Semester Project Documentation",
    description: "Complete documentation, user guide, and architecture diagrams.",
    workspaceId: "college",
    collegeCategory: "projects",
    subject: "Computer Science",
    status: "todo",
    priority: "low",
    dueDate: new Date(Date.now() + 86400000 * 6).toISOString().split("T")[0],
    progressPercent: 20,
    tags: ["docs", "project", "college"],
    isCompleted: false,
    notes: "Verify README and API endpoint examples.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [],
    activity: [],
  },
  {
    id: "task-college-note-1",
    title: "Graph Traversal & Dijkstra's Shortest Path Algorithm",
    description: "Detailed LaTeX notes covering priority queue implementations and time complexity proofs.",
    workspaceId: "college",
    collegeCategory: "notes",
    subject: "Computer Science",
    status: "completed",
    priority: "low",
    isCompleted: true,
    tags: ["notes", "algorithms", "dijkstra"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: "Verified with Prof. Vance during office hours.",
    subtasks: [],
    activity: [],
  },
  {
    id: "task-college-note-2",
    title: "PostgreSQL Indexing B-Trees & Execution Plans",
    description: "Comprehensive notes on index selectivity, bitmap heap scans, and query optimization.",
    workspaceId: "college",
    collegeCategory: "notes",
    subject: "Database Systems",
    status: "completed",
    priority: "low",
    isCompleted: true,
    tags: ["notes", "databases", "indexes"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: "Docker reproduction scripts attached.",
    subtasks: [],
    activity: [],
  },
  {
    id: "task-7",
    title: "Prepare Ismail Shahid Fans Post",
    description: "Prepare comedy scene clip, hashtags, and schedule for Ismail Shahid Fans page.",
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
    title: "Synthesize Morning Lecture Notes",
    description: "Summarize key points, theory insights, and diagrams from morning lecture session.",
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
    title: "Upload Shooting Page Reel",
    description: "Upload 4K reel to Shooting Page and verify sound sync and copyright clearance.",
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
    title: "Create Inaya Kailash Visual",
    description: "Design high-contrast visual artwork and aesthetic calligraphy overlay in Figma.",
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
    title: "Prepare Political Affairs Post",
    description: "Quick 60-second summary and legislative digest carousel for Political Affairs page.",
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
    title: "Upload Nazia Iqbal Fanz Content",
    description: "Upload vintage concert throwback clip and Pashto music hashtags to Nazia Iqbal Fanz.",
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
    title: "Create Suno Music Visual",
    description: "8-second seamless fluid motion graphics and visual art for Suno Music release.",
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

// User-partitioned local storage state for fallback/offline multi-tenant operations
let currentLoadedUserId: string | null = null;
let localTasks: Task[] = [];
let isLocalTasksLoaded = false;

export async function ensureLocalTasksLoaded(): Promise<{ userId: string; isAfaq: boolean; tasks: Task[] }> {
  const user = await authService.getUser();
  const userId = user?.id || "anonymous";
  const isAfaq = user?.email?.toLowerCase() === "afaq@taskflow.dev" ||
                 user?.email?.toLowerCase() === "afaqahmadcs@gmail.com" ||
                 userId === "demo-creator-afaq";

  if (!isLocalTasksLoaded || currentLoadedUserId !== userId) {
    currentLoadedUserId = userId;
    isLocalTasksLoaded = true;

    const storageKey = `afaq_taskflow_tasks_${userId}`;
    let loaded: Task[] | null = null;
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          loaded = JSON.parse(stored);
        }
      } catch {}
    }

    if (loaded) {
      localTasks = loaded;
    } else if (isAfaq) {
      localTasks = INITIAL_TASKS.map((t) => ({ ...t, userId }));
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(storageKey, JSON.stringify(localTasks));
        } catch {}
      }
    } else {
      // Clean slate for new / other users: 0 tasks!
      localTasks = [];
    }
  }

  return { userId, isAfaq, tasks: localTasks };
}

export function persistLocalTasks(): void {
  if (currentLoadedUserId && typeof window !== "undefined") {
    try {
      localStorage.setItem(`afaq_taskflow_tasks_${currentLoadedUserId}`, JSON.stringify(localTasks));
    } catch {}
  }
}

if (typeof window !== "undefined") {
  authService.onProfileChange((profile) => {
    if (profile && profile.id !== currentLoadedUserId) {
      isLocalTasksLoaded = false;
    }
  });
}

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

    // Local Fallback Processing (User-Scoped)
    await ensureLocalTasksLoaded();
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

    await ensureLocalTasksLoaded();
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

    // Local Fallback Creation (User-Scoped)
    await ensureLocalTasksLoaded();
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
      userId: currentLoadedUserId || undefined,
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
    persistLocalTasks();
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
    await ensureLocalTasksLoaded();
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
    persistLocalTasks();
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

    await ensureLocalTasksLoaded();
    const prevLen = localTasks.length;
    localTasks = localTasks.filter((t) => t.id !== id);
    persistLocalTasks();
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

  /**
   * Phase 6: Recurring Class Engine
   * Generates dynamic weekly events for Monday 4 PM - 6 PM & Tuesday 4 PM - 6 PM
   * without duplicating static records manually for every week.
   */
  getRecurringClasses: () => {
    return RECURRING_CLASSES;
  },

  /**
   * Phase 6: Get all Personal Vlog entries
   */
  getVlogs: async (): Promise<Task[]> => {
    const allTasks = await taskService.getTasks();
    return allTasks.filter((t) => t.workspaceId === "personal");
  },

  /**
   * Phase 6: Web Development Journey ➔ Personal Vlog Cross-Link Query
   * Relational database lookup: fetches all tasks linked to a vlog entry ID
   */
  getTasksLinkedToVlog: async (vlogId: string): Promise<Task[]> => {
    const allTasks = await taskService.getTasks();
    return allTasks.filter((t) => t.linkedVlogId === vlogId);
  },

  /**
   * Phase 6: Get the vlog task referenced by a dev task's linkedVlogId
   */
  getLinkedVlog: async (devTaskId: string): Promise<Task | null> => {
    const devTask = await taskService.getTaskById(devTaskId);
    if (!devTask || !devTask.linkedVlogId) return null;
    return taskService.getTaskById(devTask.linkedVlogId);
  },

  /**
   * Phase 6: Relational linking of Web Dev Task ➔ Vlog Entry
   */
  linkTaskToVlog: async (devTaskId: string, vlogId: string | null): Promise<Task | null> => {
    const updated = await taskService.updateTask(devTaskId, {
      linkedVlogId: vlogId,
    } as UpdateTaskInput);
    return updated;
  },

  /**
   * Phase 6: Vlog Checklist Toggle (recording / editing)
   */
  updateTaskChecklist: async (
    taskId: string,
    type: "recording" | "editing",
    checklistItemId: string,
    completed: boolean
  ): Promise<Task | null> => {
    const task = localTasks.find((t) => t.id === taskId);
    if (!task) return null;

    if (type === "recording" && task.recordingChecklist) {
      task.recordingChecklist = task.recordingChecklist.map((item) =>
        item.id === checklistItemId ? { ...item, completed } : item
      );
    } else if (type === "editing" && task.editingChecklist) {
      task.editingChecklist = task.editingChecklist.map((item) =>
        item.id === checklistItemId ? { ...item, completed } : item
      );
    }

    task.updatedAt = new Date().toISOString();
    return { ...task };
  },

  /**
   * Phase 6: Vlog Platform Distribution Toggle
   */
  updateVlogPlatform: async (
    taskId: string,
    platform: SocialPlatform,
    enabled: boolean
  ): Promise<Task | null> => {
    const task = localTasks.find((t) => t.id === taskId);
    if (!task) return null;

    const currentPlatforms = task.platforms || [];
    if (enabled && !currentPlatforms.includes(platform)) {
      task.platforms = [...currentPlatforms, platform];
    } else if (!enabled) {
      task.platforms = currentPlatforms.filter((p) => p !== platform);
    }

    task.updatedAt = new Date().toISOString();
    return { ...task };
  },

  /**
   * Phase 6: Vlog Thumbnail Status Update
   */
  updateThumbnailStatus: async (
    taskId: string,
    status: ThumbnailStatus
  ): Promise<Task | null> => {
    const task = localTasks.find((t) => t.id === taskId);
    if (!task) return null;

    task.thumbnailStatus = status;
    task.updatedAt = new Date().toISOString();
    return { ...task };
  },

  /**
   * Phase 7: Batch add tasks (used by recurring task generator)
   */
  batchAddTasks: async (tasksToAdd: Task[]): Promise<Task[]> => {
    const added: Task[] = [];
    for (const t of tasksToAdd) {
      const exists = localTasks.some((existing) => existing.id === t.id);
      if (!exists) {
        localTasks.unshift(t);
        added.push(t);
      }
    }
    return added;
  },

  /**
   * Phase 7: Delete tasks generated by a specific recurring rule
   */
  deleteTasksByRecurringRuleId: async (ruleId: string): Promise<number> => {
    const initialCount = localTasks.length;
    localTasks = localTasks.filter((t) => t.recurringRuleId !== ruleId);
    return initialCount - localTasks.length;
  },
};

export interface RecurringClassEvent {
  id: string;
  title: string;
  dayOfWeek: "Monday" | "Tuesday";
  dayIndex: 1 | 2; // 1 = Mon, 2 = Tue
  time: string; // "4:00 PM – 6:00 PM"
  startTime: "16:00";
  endTime: "18:00";
  lab: string;
  topics: string;
  tags: string[];
  discordLink?: string;
  notesLink?: string;
}

export const RECURRING_CLASSES: RecurringClassEvent[] = [
  {
    id: "rec-class-mon",
    title: "Advanced Fullstack Web Development",
    dayOfWeek: "Monday",
    dayIndex: 1,
    time: "4:00 PM – 6:00 PM",
    startTime: "16:00",
    endTime: "18:00",
    lab: "Virtual Lab #1",
    topics: "Deep dive into Next.js 15 App Router, Server Actions, optimistic cache mutations, and production GraphQL integrations.",
    tags: ["Next.js 15", "Server Actions", "GraphQL"],
    discordLink: "https://discord.gg/virtual-lab-1",
  },
  {
    id: "rec-class-tue",
    title: "Backend Architecture & Distributed Systems",
    dayOfWeek: "Tuesday",
    dayIndex: 2,
    time: "4:00 PM – 6:00 PM",
    startTime: "16:00",
    endTime: "18:00",
    lab: "Virtual Lab #2",
    topics: "PostgreSQL relational indexing strategies, Redis distributed locking, asynchronous workers, and event microservices.",
    tags: ["PostgreSQL", "Redis Pub/Sub", "Microservices"],
    notesLink: "/college",
  },
];
