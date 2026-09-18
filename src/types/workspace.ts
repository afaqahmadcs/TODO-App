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
  | "shooting-film-video"
  | "shooting-page"
  | "ismail-shahid-fans"
  | "zk-production"
  | "jahangir-khan"
  | "new-client-page"
  | "political-affairs"
  | "nazia-fanz"
  | "nazia-iqbal-fanz"
  | "inaya-kailashi"
  | "inaya-kailash"
  | "suno-music"
  | string;

export interface OfficePage {
  id: OfficePageId;
  title: string;
  shortTitle: string;
  statusSummary: string;
  isCompletedToday: boolean;
  platformTags?: string[];
  priority?: "high" | "medium";
  pageGroup?: "client_reels" | "facebook" | "music";
  isEditable?: boolean;
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
