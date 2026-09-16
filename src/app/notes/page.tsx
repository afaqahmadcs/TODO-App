"use client";

import React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function NotesPage() {
  const notes = [
    {
      title: "Next.js 15 Server Actions & Optimistic Cache Notes",
      category: "Web Development",
      snippet: "Key findings on revalidateTag vs revalidatePath. Optimistic updates in React 19...",
      updated: "2 hours ago",
      color: "border-l-cyan-500",
    },
    {
      title: "Suno Music Album Launch Visual Concept Brief",
      category: "Office",
      snippet: "Cyberpunk retro-wave palette: #6BD8CB cyan, #4F46E5 indigo, #F43F5E crimson...",
      updated: "Yesterday",
      color: "border-l-blue-500",
    },
    {
      title: "Vlog EP #42 Episode Script Outline",
      category: "Personal",
      snippet: "Hook: 3 mistakes I made setting up fullstack authentication. B-roll cut points...",
      updated: "3 days ago",
      color: "border-l-purple-500",
    },
    {
      title: "Algorithm Complexity: Big-O Cheat Sheet (CS-401)",
      category: "College",
      snippet: "Master theorem derivations, divide and conquer recurrence relations...",
      updated: "5 days ago",
      color: "border-l-emerald-500",
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        badge="Documentation Hub"
        metaText="Markdown-ready technical & creative knowledge base"
        title="Notes & Docs"
        description="Whiteboard algorithm notes, video scripting outlines, lecture summaries, and design specs."
        actions={
          <Button variant="primary" icon="post_add">
            + Create Note
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notes.map((note, idx) => (
          <Card
            key={idx}
            variant="low"
            hoverEffect
            className={`p-5 border-l-4 ${note.color} space-y-2.5 cursor-pointer`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase text-secondary">
                {note.category}
              </span>
              <span className="text-[11px] font-mono text-outline">{note.updated}</span>
            </div>
            <h4 className="text-base font-bold text-on-surface">{note.title}</h4>
            <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
              {note.snippet}
            </p>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
