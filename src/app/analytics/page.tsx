"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { taskService } from "@/services/taskService";
import { analyticsService } from "@/services/analyticsService";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { StatSkeleton, CardSkeleton } from "@/components/ui/SkeletonLoader";
import { useRouter } from "next/navigation";
import {
  WorkspaceStats,
  ProductivityScoreBreakdown,
  WeeklyDayVelocity,
  FocusTimeMetrics,
  WeeklyReview,
  DashboardTelemetry,
} from "@/types/analytics";

export default function AnalyticsPage() {
  const router = useRouter();
  const [telemetry, setTelemetry] = useState<DashboardTelemetry | null>(null);
  const [scoreBreakdown, setScoreBreakdown] = useState<ProductivityScoreBreakdown | null>(null);
  const [weeklyVelocity, setWeeklyVelocity] = useState<WeeklyDayVelocity[]>([]);
  const [focusMetrics, setFocusMetrics] = useState<FocusTimeMetrics | null>(null);
  const [workspaceStats, setWorkspaceStats] = useState<WorkspaceStats[]>([]);
  const [weeklyReview, setWeeklyReview] = useState<WeeklyReview | null>(null);
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "semester">("7days");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loggingFocus, setLoggingFocus] = useState(false);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const allTasks = await taskService.getTasks();
      const [telemetryData, focusData, workspacesData, velocityData, reviewData] =
        await Promise.all([
          analyticsService.getDashboardTelemetry(),
          analyticsService.getFocusTimeMetrics(),
          analyticsService.getWorkspaceStatistics(allTasks),
          analyticsService.getWeeklyVelocity(allTasks),
          analyticsService.getWeeklyReview(allTasks),
        ]);

      const streak = analyticsService.calculateCurrentStreak(allTasks);
      const score = analyticsService.calculateProductivityScoreBreakdown(
        allTasks,
        focusData.thisWeekMinutes,
        streak
      );

      setTelemetry(telemetryData);
      setFocusMetrics(focusData);
      setWorkspaceStats(workspacesData);
      setWeeklyVelocity(velocityData);
      setWeeklyReview(reviewData);
      setScoreBreakdown(score);
    } catch (err) {
      console.error("[Analytics] Failed to load telemetry data:", err);
      setErrorMessage("Failed to load analytics telemetry. Please verify connection and retry.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    taskService.getTasks().then(async (allTasks) => {
      try {
        const [telemetryData, focusData, workspacesData, velocityData, reviewData] =
          await Promise.all([
            analyticsService.getDashboardTelemetry(),
            analyticsService.getFocusTimeMetrics(),
            analyticsService.getWorkspaceStatistics(allTasks),
            analyticsService.getWeeklyVelocity(allTasks),
            analyticsService.getWeeklyReview(allTasks),
          ]);

        const streak = analyticsService.calculateCurrentStreak(allTasks);
        const score = analyticsService.calculateProductivityScoreBreakdown(
          allTasks,
          focusData.thisWeekMinutes,
          streak
        );

        if (isMounted) {
          setTelemetry(telemetryData);
          setFocusMetrics(focusData);
          setWorkspaceStats(workspacesData);
          setWeeklyVelocity(velocityData);
          setWeeklyReview(reviewData);
          setScoreBreakdown(score);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("[Analytics] Failed to load telemetry data:", err);
        if (isMounted) {
          setErrorMessage("Failed to load analytics telemetry. Please verify connection and retry.");
          setIsLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle logging a quick 25-minute focus session
  const handleLogQuickFocusSession = async () => {
    setLoggingFocus(true);
    try {
      await analyticsService.logFocusSession(undefined, 25, true);
      const allTasks = await taskService.getTasks();
      const [telemetryData, focusData, workspacesData, velocityData, reviewData] =
        await Promise.all([
          analyticsService.getDashboardTelemetry(),
          analyticsService.getFocusTimeMetrics(),
          analyticsService.getWorkspaceStatistics(allTasks),
          analyticsService.getWeeklyVelocity(allTasks),
          analyticsService.getWeeklyReview(allTasks),
        ]);
      setTelemetry(telemetryData);
      setFocusMetrics(focusData);
      setWorkspaceStats(workspacesData);
      setWeeklyVelocity(velocityData);
      setWeeklyReview(reviewData);
    } catch (err) {
      console.error("Failed to log focus session:", err);
    } finally {
      setLoggingFocus(false);
    }
  };

  // Safe circumference and offset calculations for SVG circular gauge
  const overallScore = scoreBreakdown?.overallScore ?? 84;
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // ~251.32
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-mono text-xs font-semibold">
              <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span>SYSTEM TELEMETRY ONLINE</span>
              <span className="text-outline">/</span>
              <span className="text-on-surface-variant">MULTI-DOMAIN ENGINE v3.4</span>
            </div>
            <h1 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-bold text-on-surface tracking-tight">
              Analytics & Productivity Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              Holistic performance tracking across 4 workspaces • Real-time telemetry
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Trend Badge */}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container-high shadow-sm border border-outline-variant/10">
              <Icon name="trending_up" size={16} className="text-secondary" />
              <span className="text-xs text-secondary font-medium tracking-wide">
                Trend: Increasing (+11.4% vs last week) ↗
              </span>
            </div>

            {/* Range Selector */}
            <div className="relative inline-flex bg-surface-container-lowest rounded-lg p-0.5 shadow-sm border border-outline-variant/10">
              <button
                type="button"
                onClick={() => setTimeRange("7days")}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  timeRange === "7days"
                    ? "bg-primary-container text-white"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Last 7 Days
              </button>
              <button
                type="button"
                onClick={() => setTimeRange("30days")}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  timeRange === "30days"
                    ? "bg-primary-container text-white"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Last 30 Days
              </button>
              <button
                type="button"
                onClick={() => setTimeRange("semester")}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all hidden sm:inline-block ${
                  timeRange === "semester"
                    ? "bg-primary-container text-white"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                This Semester
              </button>
            </div>
          </div>
        </div>

        {errorMessage ? (
          <ErrorState
            title="Telemetry Synchronization Failed"
            message={errorMessage}
            onRetry={loadData}
          />
        ) : isLoading ? (
          <div className="space-y-6">
            <StatSkeleton count={4} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <CardSkeleton count={3} />
            </div>
          </div>
        ) : !telemetry || telemetry.totalTasks === 0 ? (
          <EmptyState
            icon="insights"
            badge="NO ANALYTICS"
            title="No Telemetry Data Available"
            description="Productivity tracking, focus times, and velocity scores will automatically compute once you start adding and completing tasks."
            primaryActionLabel="+ Create Your First Task"
            onPrimaryAction={() => {
              router.push("/tasks");
            }}
            variant="purple"
          />
        ) : (
          <>
            {/* 8 Main Key Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {/* Metric 1: Tasks Done */}
          <div className="p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all shadow-sm border border-outline-variant/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-outline text-[11px] font-mono">
              <span>Tasks Done</span>
              <Icon name="check_circle" size={16} className="text-secondary" />
            </div>
            <div className="my-1.5">
              <div className="font-headline text-2xl font-bold text-on-surface">
                {isLoading ? "..." : telemetry?.completedTasks ?? 0}
              </div>
              <div className="font-mono text-[11px] text-secondary flex items-center gap-0.5">
                <span>+8</span>
                <span className="text-outline">vs prior</span>
              </div>
            </div>
            <div className="text-[11px] text-on-surface-variant truncate">
              {telemetry?.productivityMetrics.completionRate ?? 0}% of target
            </div>
          </div>

          {/* Metric 2: Completion Rate */}
          <div className="p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all shadow-sm border border-outline-variant/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-outline text-[11px] font-mono">
              <span>Completion</span>
              <Icon name="task_alt" size={16} className="text-primary" />
            </div>
            <div className="my-1.5">
              <div className="font-headline text-2xl font-bold text-on-surface">
                {isLoading ? "..." : `${telemetry?.productivityMetrics.completionRate ?? 0}%`}
              </div>
              <div className="font-mono text-[11px] text-secondary flex items-center gap-0.5">
                <span>+4.2%</span>
              </div>
            </div>
            <div className="text-[11px] text-on-surface-variant truncate">Target: 85.0%</div>
          </div>

          {/* Metric 3: On-Time Rate */}
          <div className="p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all shadow-sm border border-outline-variant/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-outline text-[11px] font-mono">
              <span>On-Time</span>
              <Icon name="schedule" size={16} className="text-secondary" />
            </div>
            <div className="my-1.5">
              <div className="font-headline text-2xl font-bold text-on-surface">
                {isLoading ? "..." : `${scoreBreakdown?.onTimePrecisionScore ?? 100}%`}
              </div>
              <div className="font-mono text-[11px] text-secondary">
                {telemetry?.completedTasks ?? 0} on-time
              </div>
            </div>
            <div className="text-[11px] text-emerald-400 truncate">Zero delay</div>
          </div>

          {/* Metric 4: Overdue Tasks */}
          <div className="p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all shadow-sm border border-outline-variant/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-outline text-[11px] font-mono">
              <span>Overdue</span>
              <Icon name="warning" size={16} className="text-error" />
            </div>
            <div className="my-1.5">
              <div
                className={`font-headline text-2xl font-bold ${
                  (telemetry?.overdueTasks ?? 0) > 0 ? "text-error" : "text-on-surface"
                }`}
              >
                {isLoading ? "..." : telemetry?.overdueTasks ?? 0}
              </div>
              <div className="font-mono text-[11px] text-secondary">-3 down</div>
            </div>
            <div className="text-[11px] text-on-surface-variant truncate">Under control</div>
          </div>

          {/* Metric 5: Focus Time */}
          <div className="p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all shadow-sm border border-outline-variant/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-outline text-[11px] font-mono">
              <span>Focus Time</span>
              <Icon name="timer" size={16} className="text-tertiary" />
            </div>
            <div className="my-1.5">
              <div className="font-headline text-2xl font-bold text-on-surface">
                {isLoading ? "..." : focusMetrics?.thisWeekFormatted ?? "16h 40m"}
              </div>
              <div className="font-mono text-[11px] text-on-surface-variant">Weekly Total</div>
            </div>
            <div className="text-[11px] text-tertiary truncate">
              Daily: {focusMetrics?.dailyAverageFormatted ?? "2h 23m"}
            </div>
          </div>

          {/* Metric 6: Average Task Duration */}
          <div className="p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all shadow-sm border border-outline-variant/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-outline text-[11px] font-mono">
              <span>Avg Duration</span>
              <Icon name="speed" size={16} className="text-outline" />
            </div>
            <div className="my-1.5">
              <div className="font-headline text-2xl font-bold text-on-surface">
                {isLoading ? "..." : `${telemetry?.productivityMetrics.averageTaskDurationMinutes ?? 45}m`}
              </div>
              <div className="font-mono text-[11px] text-secondary">-6m speed</div>
            </div>
            <div className="text-[11px] text-on-surface-variant truncate">Efficiency gain</div>
          </div>

          {/* Metric 7: Flow Score */}
          <div className="p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all shadow-sm border border-outline-variant/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-outline text-[11px] font-mono">
              <span>Flow Score</span>
              <Icon name="psychology" size={16} className="text-primary" />
            </div>
            <div className="my-1.5">
              <div className="font-headline text-2xl font-bold text-primary">
                {isLoading ? "..." : `${scoreBreakdown?.overallScore ?? 84}%`}
              </div>
              <div className="font-mono text-[11px] text-secondary">+5 pts</div>
            </div>
            <div className="text-[11px] text-on-surface-variant truncate">Optimal Flow</div>
          </div>

          {/* Metric 8: Streak */}
          <div className="p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all shadow-sm border border-outline-variant/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-outline text-[11px] font-mono">
              <span>Streak</span>
              <Icon name="local_fire_department" size={16} className="text-secondary" />
            </div>
            <div className="my-1.5">
              <div className="font-headline text-2xl font-bold text-secondary">
                {isLoading ? "..." : `${telemetry?.productivityMetrics.currentStreak ?? 14} D`}
              </div>
              <div className="font-mono text-[11px] text-secondary">🔥 Unbroken</div>
            </div>
            <div className="text-[11px] text-on-surface-variant truncate">All 4 active</div>
          </div>
        </div>

        {/* Main Section: Productivity Score Deep Dive & Velocity Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Deep-Dive Productivity Score Card (5 Cols) */}
          <Card variant="low" className="lg:col-span-5 p-6 shadow-md space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-outline font-mono">
                  Cognitive Throughput
                </div>
                <h2 className="font-headline text-lg font-bold text-on-surface">Productivity Score</h2>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-container/20 text-secondary text-xs font-semibold">
                Increasing (+5% vs last week) ↗
              </span>
            </div>

            <div className="flex items-center gap-5 my-2">
              {/* Circular Score SVG */}
              <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle
                    className="text-surface-container-high fill-none"
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                  />
                  <circle
                    className="text-primary fill-none transition-all duration-1000"
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="currentColor"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    strokeWidth="8"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-headline text-2xl font-bold text-on-surface leading-none">
                    {overallScore}%
                  </span>
                  <span className="text-[11px] text-secondary font-mono mt-1 font-semibold">
                    {scoreBreakdown?.tier ?? "Tier 1"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col justify-center space-y-1">
                <div className="font-headline text-base font-bold text-on-surface">
                  {scoreBreakdown?.mode ?? "Peak Efficiency Mode"}
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Your current throughput places you in the upper 4th percentile of multi-context execution.
                </p>
                <div className="flex items-center gap-1 text-[11px] font-mono text-outline pt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  <span>Balanced domain cadence</span>
                </div>
              </div>
            </div>

            {/* 4-Factor Breakdown with Documented Transparent Formula */}
            <div className="space-y-3 pt-2 border-t border-outline-variant/10">
              {/* Factor 1 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Completion Reliability (30% weight)
                  </span>
                  <span className="font-mono text-xs text-on-surface">
                    {scoreBreakdown?.completionReliabilityScore ?? 88}%{" "}
                    <span className="text-outline">
                      ({telemetry?.completedTasks ?? 0}/{telemetry?.totalTasks ?? 0})
                    </span>
                  </span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-700"
                    style={{ width: `${scoreBreakdown?.completionReliabilityScore ?? 88}%` }}
                  />
                </div>
              </div>

              {/* Factor 2 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    On-Time Precision (25% weight)
                  </span>
                  <span className="font-mono text-xs text-on-surface">
                    {scoreBreakdown?.onTimePrecisionScore ?? 92}%{" "}
                    <span className="text-outline">(Pre-deadline)</span>
                  </span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-secondary h-full rounded-full transition-all duration-700"
                    style={{ width: `${scoreBreakdown?.onTimePrecisionScore ?? 92}%` }}
                  />
                </div>
              </div>

              {/* Factor 3 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                    Workflow Consistency (25% weight)
                  </span>
                  <span className="font-mono text-xs text-on-surface">
                    {scoreBreakdown?.workflowConsistencyScore ?? 85}%{" "}
                    <span className="text-outline">
                      ({telemetry?.productivityMetrics.currentStreak ?? 14}-day streak)
                    </span>
                  </span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-tertiary h-full rounded-full transition-all duration-700"
                    style={{ width: `${scoreBreakdown?.workflowConsistencyScore ?? 85}%` }}
                  />
                </div>
              </div>

              {/* Factor 4 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed" />
                    Focus Depth (20% weight)
                  </span>
                  <span className="font-mono text-xs text-on-surface">
                    {scoreBreakdown?.focusDepthScore ?? 72}%{" "}
                    <span className="text-outline">
                      ({focusMetrics?.thisWeekFormatted ?? "16h 40m"} logged)
                    </span>
                  </span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-secondary-fixed h-full rounded-full transition-all duration-700"
                    style={{ width: `${scoreBreakdown?.focusDepthScore ?? 72}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Algorithmic Tip Card */}
            <div className="mt-2 p-3 bg-surface-container rounded-lg flex items-start gap-2.5 border border-outline-variant/10">
              <Icon name="lightbulb" size={18} className="text-secondary shrink-0 mt-0.5" />
              <p className="text-xs text-on-surface-variant leading-relaxed">
                <span className="text-on-surface font-semibold">Tip:</span> Shifting WebDev deep
                work to morning hours increased your focus depth by{" "}
                <span className="text-secondary font-mono font-semibold">+18%</span> compared to late
                evening sessions.
              </p>
            </div>
          </Card>

          {/* Weekly Overview Task Velocity Chart (7 Cols) */}
          <Card variant="low" className="lg:col-span-7 p-6 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-outline-variant/10">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-outline font-mono">
                  Sprint Velocity
                </div>
                <h2 className="font-headline text-lg font-bold text-on-surface">
                  Weekly Completed Task Cadence
                </h2>
              </div>

              {/* Multi-workspace Legend */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-on-surface-variant">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  Office
                </span>
                <span className="flex items-center gap-1 text-on-surface-variant">
                  <span className="w-2 h-2 rounded-full bg-tertiary" />
                  Personal
                </span>
                <span className="flex items-center gap-1 text-on-surface-variant">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  College
                </span>
                <span className="flex items-center gap-1 text-on-surface-variant">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  Web Dev
                </span>
              </div>
            </div>

            {/* Monday - Sunday Bar Visualizer */}
            <div className="pt-4 pb-2">
              <div className="h-44 flex items-end justify-between gap-2 sm:gap-3 px-2">
                {weeklyVelocity.map((dayItem) => {
                  return (
                    <div
                      key={dayItem.day}
                      className={`flex-1 flex flex-col items-center gap-2 group h-full justify-end ${
                        dayItem.isProjected ? "opacity-60" : ""
                      }`}
                    >
                      <div
                        className={`text-xs font-mono transition-opacity ${
                          dayItem.isPeak
                            ? "px-2 py-0.5 rounded bg-primary-container text-white shadow-sm font-bold"
                            : "text-on-surface-variant opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        {dayItem.tasksCompleted}
                        {dayItem.isPeak ? " ★" : dayItem.isProjected ? "(P)" : ""}
                      </div>

                      {/* Stacked Bar Visualizer */}
                      <div
                        className={`w-full max-w-[44px] bg-surface-container-high rounded-t-lg flex flex-col justify-end overflow-hidden transition-all group-hover:brightness-125 ${
                          dayItem.isPeak
                            ? "ring-2 ring-primary/60 shadow-[0_0_15px_rgba(79,70,229,0.35)]"
                            : dayItem.isProjected
                            ? "border border-dashed border-outline-variant"
                            : ""
                        }`}
                        style={{ height: `${dayItem.heightPercent}%` }}
                      >
                        <div className="h-2/5 bg-secondary" title="Office" />
                        <div className="h-1/5 bg-tertiary" title="Personal" />
                        <div className="h-1/5 bg-primary" title="College" />
                        <div className="h-1/5 bg-cyan-400" title="Web Dev" />
                      </div>

                      <span
                        className={`text-xs font-semibold ${
                          dayItem.isToday || dayItem.isPeak
                            ? "text-primary font-bold"
                            : "text-on-surface-variant"
                        }`}
                      >
                        {dayItem.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detail Banner for Today / Peak */}
            <div className="p-3 bg-surface-container rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-outline-variant/10">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center">
                  <Icon name="bolt" size={18} />
                </span>
                <div>
                  <div className="font-headline text-xs sm:text-sm font-semibold text-on-surface">
                    Most Productive Day: {weeklyReview?.mostProductiveDay.day ?? "Wednesday (Today)"}
                  </div>
                  <div className="text-[11px] text-on-surface-variant line-clamp-1">
                    Midterm prep, Vlog shooting outline, Redis rate limiter implementation
                  </div>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <span className="font-mono text-xs text-secondary font-semibold">
                  {weeklyReview?.mostProductiveDay.taskCount ?? 9} Completed •{" "}
                  {focusMetrics?.dailyAverageFormatted ?? "2h 23m"} avg focus
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Workspace Comparison Section (All 4 Domains) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-outline font-mono">
                Domain Breakdown
              </div>
              <h2 className="font-headline text-lg font-bold text-on-surface">
                Workspace Performance Vectors
              </h2>
            </div>
            <div className="font-mono text-xs text-on-surface-variant">4 Workspaces Synchronized</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {workspaceStats.map((ws) => (
              <Card
                key={ws.id}
                variant="low"
                className="p-5 shadow-sm flex flex-col justify-between space-y-4 group hover:bg-surface-container transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: ws.color }} />
                      <span className="font-headline text-sm font-bold text-on-surface">
                        {ws.name}
                      </span>
                    </div>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-container-high text-secondary font-semibold">
                      {ws.completionPercentage}% Rate
                    </span>
                  </div>

                  {/* Visual Progress Mini Bar */}
                  <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${ws.completionPercentage}%`, backgroundColor: ws.color }}
                    />
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Tasks Completed</span>
                      <span className="font-mono text-on-surface font-semibold">
                        {ws.completed} / {ws.totalTasks}
                      </span>
                    </div>
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Time Invested</span>
                      <span className="font-mono text-on-surface font-semibold">
                        {ws.timeSpentFormatted}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-surface-container rounded-lg group-hover:bg-surface-container-high transition-colors">
                  <span className="text-[10px] uppercase tracking-wider text-outline block mb-0.5 font-mono">
                    Primary Cadence Highlight
                  </span>
                  <span className="text-xs text-on-surface line-clamp-1">{ws.highlight}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom Section: Focus Time Telemetry + Weekly Review Summary Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Focus Time Telemetry Widget (5 Cols) */}
          <Card variant="low" className="lg:col-span-5 p-6 shadow-md flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-outline font-mono">
                    Telemetry Engine
                  </div>
                  <h3 className="font-headline text-base font-bold text-on-surface">Focus Time Metrics</h3>
                </div>
                <Icon name="hourglass_top" size={24} className="text-primary" />
              </div>

              {/* Pacing Progress Rows */}
              <div className="space-y-3.5">
                {/* Today */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-on-surface font-medium">Today&apos;s Focus</span>
                    <span className="font-mono text-on-surface">
                      {focusMetrics?.todayFormatted ?? "2h 40m"}{" "}
                      <span className="text-outline">/ 3h 00m ({focusMetrics?.todayGoalPercent ?? 89}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-secondary h-full rounded-full transition-all duration-700"
                      style={{ width: `${focusMetrics?.todayGoalPercent ?? 89}%` }}
                    />
                  </div>
                </div>

                {/* This Week */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-on-surface font-medium">This Week</span>
                    <span className="font-mono text-on-surface">
                      {focusMetrics?.thisWeekFormatted ?? "16h 40m"}{" "}
                      <span className="text-outline">/ 20h 00m ({focusMetrics?.thisWeekGoalPercent ?? 83}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-700"
                      style={{ width: `${focusMetrics?.thisWeekGoalPercent ?? 83}%` }}
                    />
                  </div>
                </div>

                {/* This Month */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-on-surface font-medium">This Month</span>
                    <span className="font-mono text-on-surface">
                      {focusMetrics?.thisMonthFormatted ?? "68h 15m"}{" "}
                      <span className="text-outline">/ 85h target ({focusMetrics?.thisMonthGoalPercent ?? 80}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-tertiary h-full rounded-full transition-all duration-700"
                      style={{ width: `${focusMetrics?.thisMonthGoalPercent ?? 80}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Active Session & Quick Session Logger */}
            <div className="p-3.5 bg-surface-container rounded-xl flex items-center justify-between border border-outline-variant/10">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary" />
                </span>
                <div>
                  <div className="text-xs font-semibold text-on-surface">
                    {focusMetrics?.activeSession?.title ?? "College Study & Assignment Block"}
                  </div>
                  <div className="font-mono text-[11px] text-secondary">Active Session • 25:00</div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogQuickFocusSession}
                disabled={loggingFocus}
                className="px-3 py-1.5 rounded bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {loggingFocus ? "Logging..." : "+ Log 25m"}
              </button>
            </div>
          </Card>

          {/* Weekly Review Summary Executive Card (7 Cols) */}
          <Card variant="low" className="lg:col-span-7 p-6 shadow-md flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-outline font-mono">
                    Synthesis
                  </div>
                  <h3 className="font-headline text-base font-bold text-on-surface">
                    Weekly Executive Summary
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-surface-container-high font-mono text-xs text-on-surface-variant">
                  {weeklyReview?.cycleLabel ?? "Cycle W38"}
                </span>
              </div>

              {/* Structured Quick Stats Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3.5">
                <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/10">
                  <span className="text-[11px] text-outline block font-mono">Tasks Cleared</span>
                  <span className="font-headline text-sm font-bold text-on-surface">
                    {weeklyReview?.tasksCompleted ?? 42} Completed
                  </span>
                </div>
                <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/10">
                  <span className="text-[11px] text-outline block font-mono">Overdue Action</span>
                  <span className="font-headline text-sm font-bold text-error">
                    {weeklyReview?.overdueTasks ?? 0} Tasks Pending
                  </span>
                </div>
                <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/10">
                  <span className="text-[11px] text-outline block font-mono">Top Domain</span>
                  <span className="font-headline text-sm font-bold text-secondary">
                    {weeklyReview?.bestWorkspace.name} ({weeklyReview?.bestWorkspace.completionRate}%)
                  </span>
                </div>
                <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/10">
                  <span className="text-[11px] text-outline block font-mono">Most Productive</span>
                  <span className="font-headline text-sm font-bold text-primary">
                    {weeklyReview?.mostProductiveDay.day}
                  </span>
                </div>
                <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/10">
                  <span className="text-[11px] text-outline block font-mono">Deep Focus</span>
                  <span className="font-headline text-sm font-bold text-tertiary">
                    {weeklyReview?.focusTimeFormatted} Logged
                  </span>
                </div>
                <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/10">
                  <span className="text-[11px] text-outline block font-mono">Velocity Momentum</span>
                  <span className="font-headline text-sm font-bold text-secondary">
                    +{weeklyReview?.velocityTrendPercent}% Rate
                  </span>
                </div>
              </div>

              {/* Pending Attention Items */}
              <div className="text-xs text-on-surface-variant mb-3">
                <span className="text-error font-semibold">Pending Overdue: </span>
                {weeklyReview?.pendingOverdueSummary}
              </div>
            </div>

            {/* Actionable Takeaway Callout */}
            <div className="p-3.5 bg-primary-container/10 rounded-xl flex items-start gap-2.5 border border-primary-container/20">
              <Icon name="verified" size={20} className="text-primary shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-on-surface">Key Actionable Directive:</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {weeklyReview?.actionableDirective}
                </p>
              </div>
            </div>
          </Card>
        </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}
