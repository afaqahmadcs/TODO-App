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
import { NoteItem, NoteCategory } from "@/types/note";
import { noteService } from "@/services/noteService";

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Create Note Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<NoteCategory>("Web Development");
  const [newSnippet, setNewSnippet] = useState("");
  const [newContent, setNewContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refreshNotes = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const list = await noteService.getNotes(selectedCategory);
      setNotes(list);
    } catch (err) {
      console.error("[NotesPage] Error fetching notes:", err);
      setErrorMessage("Could not load knowledge notes. Please retry.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    let isMounted = true;
    noteService
      .getNotes(selectedCategory)
      .then((list) => {
        if (isMounted) {
          setNotes(list);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("[NotesPage] Error fetching notes:", err);
        if (isMounted) {
          setErrorMessage("Could not load knowledge notes. Please retry.");
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCategory]);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await noteService.createNote({
        title: newTitle.trim(),
        category: newCategory,
        snippet: newSnippet.trim(),
        content: newContent.trim(),
      });
      setNewTitle("");
      setNewSnippet("");
      setNewContent("");
      setIsCreateOpen(false);
      refreshNotes();
    } catch (err) {
      console.error("Failed to create note:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = ["All", "Web Development", "Office", "Personal", "College"];

  return (
    <PageContainer>
      <PageHeader
        badge="Documentation Hub"
        badgeColor="text-secondary bg-secondary/15"
        metaText="Markdown-ready technical & creative knowledge base"
        title="Notes & Docs"
        description="Whiteboard algorithm notes, video scripting outlines, lecture summaries, and design specs."
        actions={
          <Button variant="primary" icon="post_add" onClick={() => setIsCreateOpen(true)}>
            + Create Note
          </Button>
        }
      />

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                isActive
                  ? "bg-surface-container-high text-secondary shadow-sm"
                  : "bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Error State */}
      {errorMessage && (
        <ErrorState
          title="Notes Sync Error"
          message={errorMessage}
          onRetry={refreshNotes}
          retryLabel="Retry"
        />
      )}

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <CardSkeleton count={4} />
        ) : notes.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon="article"
              variant="emerald"
              title="No Notes in this Category"
              description={`Zero technical notes found under ${selectedCategory}. Capture a new snippet, algorithm derivation, or video script.`}
              primaryActionLabel="+ Create Note"
              onPrimaryAction={() => setIsCreateOpen(true)}
              secondaryActionLabel={selectedCategory !== "All" ? "View All Categories" : undefined}
              onSecondaryAction={selectedCategory !== "All" ? () => setSelectedCategory("All") : undefined}
            />
          </div>
        ) : (
          notes.map((note) => (
            <Card
              key={note.id}
              variant="low"
              hoverEffect
              className={`p-5 border-l-4 ${note.color} space-y-2.5 cursor-pointer flex flex-col justify-between`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold uppercase text-secondary">
                    {note.category}
                  </span>
                  <span className="text-[11px] font-mono text-outline">{note.updated}</span>
                </div>
                <h4 className="font-headline text-base font-bold text-on-surface">{note.title}</h4>
                <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed">
                  {note.snippet}
                </p>
              </div>

              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2 border-t border-outline-variant/10">
                  {note.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-surface-container text-[10px] font-mono text-outline"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* CREATE NOTE MODAL */}
      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-label="Create New Note"
        >
          <div className="w-full max-w-lg bg-surface-container-low border border-outline-variant/25 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/15">
              <h3 className="font-headline text-base font-bold text-on-surface">
                Create Knowledge Note
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1 text-outline hover:text-on-surface rounded-lg"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-on-surface-variant font-medium mb-1">
                  Note Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Distributed Consensus Notes"
                  className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant font-medium mb-1">Category *</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as NoteCategory)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="Web Development">Web Development</option>
                  <option value="Office">Office</option>
                  <option value="Personal">Personal</option>
                  <option value="College">College</option>
                </select>
              </div>

              <div>
                <label className="block text-on-surface-variant font-medium mb-1">
                  Quick Summary / Snippet *
                </label>
                <input
                  type="text"
                  required
                  value={newSnippet}
                  onChange={(e) => setNewSnippet(e.target.value)}
                  placeholder="Brief 1-2 sentence core takeaway..."
                  className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant font-medium mb-1">
                  Markdown Content
                </label>
                <textarea
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="# Key Concepts..."
                  className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary resize-none font-mono"
                />
              </div>

              <div className="pt-3 border-t border-outline-variant/15 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting || !newTitle.trim()}
                >
                  {isSubmitting ? "Saving..." : "Save Note"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
