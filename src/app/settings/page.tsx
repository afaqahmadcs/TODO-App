"use client";

import React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export default function SettingsPage() {
  const shortcuts = [
    { key: "⌘K", desc: "Open global command palette & search" },
    { key: "N", desc: "Open universal quick task creation modal" },
    { key: "F", desc: "Toggle Focus Mode / Pomodoro timer" },
    { key: "ESC", desc: "Dismiss open modals, drawers, or dialogs" },
  ];

  return (
    <PageContainer maxWidth="narrow">
      <PageHeader
        badge="System Configuration"
        title="Settings & Preferences"
        description="Manage your creator profile, workspace telemetry, keyboard shortcuts, and database connections."
      />

      {/* Profile Card */}
      <Card variant="low" className="p-6 space-y-4">
        <h3 className="text-base font-bold text-on-surface font-headline border-b border-outline-variant/15 pb-3">
          Creator Profile
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Avatar size="lg" src="/assets/avatar.png" statusDot="online" />
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-on-surface">Afaq Ahmad</h4>
            <p className="text-xs text-on-surface-variant">
              Pro Creator • Multi-Workspace Producer & Fullstack Developer
            </p>
            <span className="inline-block font-mono text-xs text-secondary bg-secondary/10 px-2 py-0.5 rounded">
              afaq@taskflow.dev
            </span>
          </div>
        </div>
      </Card>

      {/* Keyboard Shortcuts Table */}
      <Card variant="low" className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
          <h3 className="text-base font-bold text-on-surface font-headline">
            Keyboard Shortcuts
          </h3>
          <span className="text-xs text-outline font-mono">Frictionless Controls</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-surface-container border border-outline-variant/15 flex items-center justify-between"
            >
              <span className="text-xs text-on-surface-variant font-medium">{sc.desc}</span>
              <kbd className="px-2 py-1 rounded bg-surface-container-highest font-mono text-xs font-bold text-on-surface border border-outline-variant/20">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </Card>

      {/* Database & Supabase Integration Status */}
      <Card variant="low" className="p-6 space-y-4 border-l-4 border-l-emerald-500">
        <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
          <div className="flex items-center gap-2">
            <Icon name="database" size={20} className="text-emerald-400" />
            <h3 className="text-base font-bold text-on-surface font-headline">
              Supabase Backend Status
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono text-xs font-semibold">
            Ready for Phase 3
          </span>
        </div>

        <p className="text-xs text-on-surface-variant leading-relaxed">
          The application is currently running in decoupled frontend mode with typed service abstractions and PostgreSQL schema migrations prepared in <code className="text-secondary font-mono">src/database/schema.sql</code>.
        </p>

        <div className="flex items-center gap-2 pt-2">
          <Button variant="secondary" size="sm" icon="sync">
            Verify Schema Integrity
          </Button>
        </div>
      </Card>
    </PageContainer>
  );
}
