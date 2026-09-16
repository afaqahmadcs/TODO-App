"use client";

import React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ProjectsPage() {
  const projects = [
    {
      title: "Afaq TaskFlow Web Application",
      workspace: "Web Development",
      color: "border-l-cyan-500",
      status: "In Progress",
      progress: 60,
      tasksRemaining: "4 of 10 completed",
    },
    {
      title: "Suno Music Visual Identity Package",
      workspace: "Office",
      color: "border-l-blue-500",
      status: "Active",
      progress: 75,
      tasksRemaining: "3 of 4 delivered",
    },
    {
      title: "YouTube Creator Season 2 Documentary",
      workspace: "Personal",
      color: "border-l-purple-500",
      status: "Active",
      progress: 45,
      tasksRemaining: "6 of 12 episodes",
    },
    {
      title: "Data Structures & Algorithms Final Lab",
      workspace: "College",
      color: "border-l-emerald-500",
      status: "Planned",
      progress: 30,
      tasksRemaining: "1 of 3 milestones",
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        badge="Multi-Track Management"
        metaText="4 active project milestones in flight"
        title="Projects & Milestones"
        description="High-level initiative tracking, sprint roadmaps, and cross-workspace deliverables."
        actions={
          <Button variant="primary" icon="add">
            + New Project
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((proj, idx) => (
          <Card
            key={idx}
            variant="low"
            className={`p-5 border-l-4 ${proj.color} space-y-3`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase text-secondary">
                {proj.workspace}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container font-mono text-[11px] text-on-surface">
                {proj.status}
              </span>
            </div>
            <div>
              <h4 className="text-base font-bold text-on-surface">{proj.title}</h4>
              <p className="text-xs text-on-surface-variant mt-1 font-mono">
                {proj.tasksRemaining}
              </p>
            </div>
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] text-outline font-mono">
                <span>Progress</span>
                <span>{proj.progress}%</span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary-container h-1.5 rounded-full"
                  style={{ width: `${proj.progress}%` }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
