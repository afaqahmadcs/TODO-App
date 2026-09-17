"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Project } from "@/types/project";
import { WorkspaceType } from "@/types/workspace";
import { projectService } from "@/services/projectService";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceType | "all">("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadProjects() {
      try {
        const list = await projectService.getProjects(selectedWorkspace);
        if (mounted) {
          setProjects(list);
          setIsLoading(false);
        }
      } catch (e) {
        console.error("Failed to load projects:", e);
        if (mounted) setIsLoading(false);
      }
    }
    loadProjects();
    return () => {
      mounted = false;
    };
  }, [selectedWorkspace]);

  const workspaces: { id: WorkspaceType | "all"; label: string }[] = [
    { id: "all", label: "All Workspaces" },
    { id: "web-development", label: "Web Development" },
    { id: "office", label: "Office" },
    { id: "personal", label: "Personal" },
    { id: "college", label: "College" },
  ];

  return (
    <PageContainer>
      <PageHeader
        badge="Multi-Track Management"
        badgeColor="text-secondary bg-secondary/15"
        metaText={`${projects.length} active initiatives connected to Supabase`}
        title="Projects & Milestones"
        description="High-level initiative tracking, sprint roadmaps, progress telemetry, and cross-workspace deliverables."
        actions={
          <Button variant="primary" icon="add">
            + New Project
          </Button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {workspaces.map((ws) => {
          const isActive = selectedWorkspace === ws.id;
          return (
            <button
              key={ws.id}
              type="button"
              onClick={() => setSelectedWorkspace(ws.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                isActive
                  ? "bg-surface-container-high text-secondary shadow-sm"
                  : "bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
              }`}
            >
              {ws.label}
            </button>
          );
        })}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-xs font-mono text-outline">
            Loading initiatives from Supabase...
          </div>
        ) : projects.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs font-mono text-outline">
            No projects found in this workspace.
          </div>
        ) : (
          projects.map((proj) => (
            <Card
              key={proj.id}
              variant="low"
              hoverEffect
              className={`p-5 border-l-4 ${proj.color || "border-l-secondary"} flex flex-col justify-between space-y-4`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold uppercase text-secondary">
                    {proj.workspaceId}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container font-mono text-[11px] text-on-surface">
                    {proj.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-headline text-base font-bold text-on-surface">
                    {proj.name}
                  </h4>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    {proj.description || "Project milestones and focus tracks."}
                  </p>
                </div>
              </div>

              {/* Progress, Tasks, Deadline, Coding/Focus Hours */}
              <div className="space-y-3 pt-2 border-t border-outline-variant/10">
                <div className="flex items-center justify-between text-xs font-mono text-outline">
                  <span>Tasks</span>
                  <span className="text-on-surface font-medium">
                    {proj.tasksCompleted || Math.round((proj.progress / 100) * 15)} /{" "}
                    {proj.tasksTotal || 15} completed
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-outline">
                  <span>Deadline</span>
                  <span className="text-secondary font-medium">{proj.deadline || "Ongoing"}</span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-outline">
                  <span>Focus Hours</span>
                  <span className="text-purple-300 font-medium">
                    {proj.focusHours || 24.0} hrs logged
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-outline font-mono">
                    <span>Progress</span>
                    <span className="text-on-surface font-bold">{proj.progress}%</span>
                  </div>
                  <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-secondary h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>

                {proj.techStack && proj.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {proj.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-1.5 py-0.5 rounded bg-surface-container-highest text-[10px] font-mono text-outline"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </PageContainer>
  );
}
