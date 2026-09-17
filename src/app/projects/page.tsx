"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/SkeletonLoader";
import { ErrorState } from "@/components/ui/ErrorState";
import { Project, ProjectStatus } from "@/types/project";
import { WorkspaceType } from "@/types/workspace";
import { projectService } from "@/services/projectService";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceType | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New Project Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectWorkspace, setProjectWorkspace] = useState<WorkspaceType>("web-development");
  const [projectDeadline, setProjectDeadline] = useState("");
  const [projectTechStack, setProjectTechStack] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refreshProjects = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const list = await projectService.getProjects(selectedWorkspace);
      setProjects(list);
    } catch (e) {
      console.error("Failed to load projects:", e);
      setErrorMessage("Unable to sync projects from database. Please retry.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedWorkspace]);

  useEffect(() => {
    let isMounted = true;
    projectService
      .getProjects(selectedWorkspace)
      .then((list) => {
        if (isMounted) {
          setProjects(list);
          setIsLoading(false);
        }
      })
      .catch((e) => {
        console.error("Failed to load projects:", e);
        if (isMounted) {
          setErrorMessage("Unable to sync projects from database. Please retry.");
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedWorkspace]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    setIsSubmitting(true);
    try {
      const stack = projectTechStack
        ? projectTechStack.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      await projectService.createProject({
        name: projectName.trim(),
        workspaceId: projectWorkspace,
        description: projectDesc.trim(),
        deadline: projectDeadline.trim() || undefined,
        techStack: stack,
        status: "in_progress" as ProjectStatus,
        progress: 10,
        tasksTotal: 1,
        tasksCompleted: 0,
        focusHours: 0,
      });

      setProjectName("");
      setProjectDesc("");
      setProjectDeadline("");
      setProjectTechStack("");
      setIsModalOpen(false);
      refreshProjects();
    } catch (err) {
      console.error("Failed to create project:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <Button variant="primary" icon="add" onClick={() => setIsModalOpen(true)}>
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

      {/* Error State if fetch fails */}
      {errorMessage && (
        <ErrorState
          title="Project Synchronization Issue"
          message={errorMessage}
          onRetry={refreshProjects}
          retryLabel="Retry Sync"
        />
      )}

      {/* Projects Grid / Skeleton / Empty State */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <CardSkeleton count={6} />
        ) : projects.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon="folder_special"
              variant="cyan"
              title="No Projects in this Workspace"
              description={`There are currently no active projects under ${
                selectedWorkspace === "all" ? "any workspace" : selectedWorkspace
              }. Launch a new sprint roadmap or switch workspace.`}
              primaryActionLabel="+ Create Project"
              onPrimaryAction={() => setIsModalOpen(true)}
              secondaryActionLabel={selectedWorkspace !== "all" ? "View All Workspaces" : undefined}
              onSecondaryAction={
                selectedWorkspace !== "all" ? () => setSelectedWorkspace("all") : undefined
              }
            />
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

              {/* Progress & Meta Footer */}
              <div className="space-y-3 pt-3 border-t border-outline-variant/10">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-on-surface-variant">Progress</span>
                    <span className="text-primary font-bold">{proj.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-outline">
                  <span className="flex items-center gap-1">
                    <Icon name="timer" size={14} />
                    {proj.focusHours || 0}h logged
                  </span>
                  <span>{proj.deadline || "No deadline"}</span>
                </div>

                {/* Tech Stack Chips */}
                {proj.techStack && proj.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {proj.techStack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-surface-container-high text-[10px] font-mono text-on-surface-variant"
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

      {/* CREATE PROJECT MODAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-label="Create New Project"
        >
          <div className="w-full max-w-lg bg-surface-container-low border border-outline-variant/25 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/15">
              <h3 className="font-headline text-base font-bold text-on-surface">
                Create New Project / Initiative
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-outline hover:text-on-surface rounded-lg"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-on-surface-variant font-medium mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Portfolio Redesign"
                  className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant font-medium mb-1">
                  Target Workspace *
                </label>
                <select
                  value={projectWorkspace}
                  onChange={(e) => setProjectWorkspace(e.target.value as WorkspaceType)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="web-development">Web Development</option>
                  <option value="office">Office</option>
                  <option value="personal">Personal</option>
                  <option value="college">College</option>
                </select>
              </div>

              <div>
                <label className="block text-on-surface-variant font-medium mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  placeholder="Goals, deliverables, and scope..."
                  className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-on-surface-variant font-medium mb-1">
                    Deadline (e.g. Due Nov 15)
                  </label>
                  <input
                    type="text"
                    value={projectDeadline}
                    onChange={(e) => setProjectDeadline(e.target.value)}
                    placeholder="Due Date"
                    className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-on-surface-variant font-medium mb-1">
                    Tech Stack (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={projectTechStack}
                    onChange={(e) => setProjectTechStack(e.target.value)}
                    placeholder="Next.js, TypeScript, Tailwind"
                    className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-outline-variant/15 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting || !projectName.trim()}
                >
                  {isSubmitting ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
