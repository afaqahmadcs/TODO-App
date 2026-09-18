export type NoteCategory = "Web Development" | "Office" | "Personal" | "College";

export interface NoteItem {
  id: string;
  userId?: string;
  title: string;
  category: NoteCategory;
  snippet: string;
  content?: string;
  updated: string;
  color: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteInput {
  title: string;
  category: NoteCategory;
  snippet: string;
  content?: string;
  tags?: string[];
}
