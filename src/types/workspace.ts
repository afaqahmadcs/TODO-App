export type WorkspaceType = "office" | "personal" | "college" | "web-development" | "web_development";

export interface WorkspaceConfig {
  id: WorkspaceType;
  title: string;
  subtitle: string;
  color: string;
  dotColor: string;
  route: string;
  metaBadge: string;
}

export type OfficePageId =
  | "shooting-page"
  | "ismail-shahid-fans"
  | "zk-production"
  | "jahangir-khan"
  | "inaya-kailash"
  | "political-affairs"
  | "nazia-iqbal-fanz"
  | "suno-music";

export interface OfficePage {
  id: OfficePageId;
  title: string;
  shortTitle: string;
  statusSummary: string;
  isCompletedToday: boolean;
  platformTags?: string[];
}

export type OfficeWorkflowStage =
  | "IDEAS"
  | "TODO"
  | "IN_PROGRESS"
  | "REVIEW"
  | "READY"
  | "PUBLISHED";

export type SunoWorkflowStage =
  | "BRIEF"
  | "ASSETS"
  | "DESIGN"
  | "REVIEW"
  | "EXPORT"
  | "DELIVERED";

export type PersonalVlogWorkflowStage =
  | "IDEA"
  | "PLANNED"
  | "RECORDING"
  | "FOOTAGE_READY"
  | "EDITING"
  | "THUMBNAIL"
  | "CAPTION"
  | "READY_TO_POST"
  | "PUBLISHED";
