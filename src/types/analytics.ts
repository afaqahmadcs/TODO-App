export interface FocusSession {
  id: string;
  userId: string;
  taskId?: string;
  startedAt: string;
  endedAt?: string;
  durationMinutes: number;
  completed: boolean;
  createdAt: string;
}

export interface WorkspaceStats {
  id: "office" | "personal" | "college" | "web-development";
  name: "Office" | "Personal" | "College" | "Web Development";
  color: string;
  totalTasks: number;
  completed: number;
  pending: number;
  completionPercentage: number;
  timeSpentMinutes: number;
  timeSpentFormatted: string;
  highlight?: string;
}

export interface ProductivityScoreBreakdown {
  overallScore: number; // 0 - 100
  tier: "Tier 1" | "Tier 2" | "Tier 3";
  mode: string;
  percentile: string;
  // Transparent 4-factor formula components:
  completionReliabilityScore: number; // 0 - 100 (weight: 30%)
  completionReliabilityDetails: string;
  onTimePrecisionScore: number; // 0 - 100 (weight: 25%)
  onTimePrecisionDetails: string;
  workflowConsistencyScore: number; // 0 - 100 (weight: 25%)
  workflowConsistencyDetails: string;
  focusDepthScore: number; // 0 - 100 (weight: 20%)
  focusDepthDetails: string;
  formulaDescription: string;
}

export interface WeeklyDayVelocity {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  fullDay: string;
  date: string;
  tasksCompleted: number;
  isToday: boolean;
  isPeak: boolean;
  isProjected: boolean;
  heightPercent: number; // CSS height percentage (e.g. 75)
  workspaceBreakdown: {
    office: number;
    personal: number;
    college: number;
    webDevelopment: number;
  };
}

export interface FocusTimeMetrics {
  todayMinutes: number;
  todayFormatted: string;
  todayGoalMinutes: number;
  todayGoalPercent: number;

  thisWeekMinutes: number;
  thisWeekFormatted: string;
  thisWeekGoalMinutes: number;
  thisWeekGoalPercent: number;

  thisMonthMinutes: number;
  thisMonthFormatted: string;
  thisMonthGoalMinutes: number;
  thisMonthGoalPercent: number;

  dailyAverageFormatted: string;
  activeSession?: {
    title: string;
    durationMinutes: number;
    remainingMinutes: number;
  };
}

export interface WeeklyReview {
  cycleLabel: string;
  tasksCompleted: number;
  overdueTasks: number;
  bestWorkspace: {
    id: string;
    name: string;
    completionRate: number;
    completedCount: number;
  };
  mostProductiveDay: {
    day: string;
    taskCount: number;
    focusMinutes: number;
    highlight: string;
  };
  focusTimeFormatted: string;
  currentStreak: number;
  velocityTrendPercent: number;
  pendingOverdueSummary: string;
  actionableDirective: string;
}

export interface ProductivityMetrics {
  completionRate: number;
  onTimeRate: number;
  focusTimeMinutes: number;
  focusTimeFormatted: string;
  averageTaskDurationMinutes: number;
  overdueTasks: number;
  currentStreak: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  productivityScore: number;
}

export interface DashboardTelemetry {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  highPriorityPending: number;
  productivityScore: number;
  todayProgress: {
    totalToday: number;
    completedToday: number;
    percentage: number;
    workspaceBreakdown: {
      office: { completed: number; total: number; color: string };
      personal: { completed: number; total: number; color: string };
      college: { completed: number; total: number; color: string };
      webDevelopment: { completed: number; total: number; color: string };
    };
  };
  workspaces: WorkspaceStats[];
  productivityMetrics: ProductivityMetrics;
}
