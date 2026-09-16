import React from "react";
import { cn } from "@/lib/utils";
import { TaskPriority } from "@/types/task";
import { WorkspaceType } from "@/types/workspace";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "priority" | "workspace" | "stage";
  priority?: TaskPriority;
  workspace?: WorkspaceType;
  showPulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = "default",
  priority,
  workspace,
  showPulse = false,
  ...props
}) => {
  if (variant === "priority" && priority) {
    const priorityConfigMap = {
      urgent: {
        wrapper: "bg-red-600/20 text-red-300 border-red-500/40",
        dot: "bg-red-500",
        label: "Urgent",
      },
      high: {
        wrapper: "bg-rose-500/15 text-rose-300 border-rose-500/30",
        dot: "bg-rose-500",
        label: "High",
      },
      medium: {
        wrapper: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        dot: "bg-amber-500",
        label: "Medium",
      },
      low: {
        wrapper: "bg-slate-500/15 text-slate-400 border-slate-500/30",
        dot: "bg-slate-400",
        label: "Low",
      },
    };
    const priorityConfig = priorityConfigMap[priority] || priorityConfigMap.medium;

    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
          priorityConfig.wrapper,
          className
        )}
        {...props}
      >
        <span className="relative flex h-1.5 w-1.5">
          {showPulse && priority === "high" && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          )}
          <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", priorityConfig.dot)} />
        </span>
        <span>{children || priorityConfig.label}</span>
      </span>
    );
  }

  if (variant === "workspace" && workspace) {
    const workspaceConfig = {
      office: "bg-blue-500/15 text-blue-300 border-blue-500/30",
      personal: "bg-purple-500/15 text-purple-300 border-purple-500/30",
      college: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      "web-development": "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
      web_development: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    }[workspace];

    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border font-mono",
          workspaceConfig,
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-surface-container-highest text-on-surface-variant",
        variant === "outline" && "bg-transparent border border-outline-variant/40 text-outline",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
