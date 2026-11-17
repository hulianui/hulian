export type ReferenceKind = "article" | "inproceedings" | "book" | "techreport" | "thesis" | "online" | "commit";

export type ReferenceTopic = "history" | "hashing" | "diff" | "storage" | "workflow";

export interface Reference {
  /** Cite key; also the DOM id of the bibliography entry. */
  id: string;
  authors: string;
  title: string;
  /** Venue line: journal, proceedings, publisher or archive. */
  venue: string;
  year: number;
  kind: ReferenceKind;
  doi?: string;
  url?: string;
  topics: ReferenceTopic[];
  /** Paper ids that cite this entry. */
  citedBy: string[];
  addedDaysAgo: number;
}

export type PaperStage = "topic" | "survey" | "drafting" | "figures" | "review" | "submission" | "published";

export interface PaperSummary {
  id: string;
  title: string;
  /** Short label for compact places such as the pipeline figure. */
  short: string;
  venue: string;
  stage: PaperStage;
  /** 0..100 */
  progress: number;
  deadlineDays: number | null;
  words: number;
  figures: number;
  references: number;
  authors: string[];
  updatedMinutesAgo: number;
  /** Only papers with a manuscript body can be opened in the editor. */
  hasManuscript: boolean;
}

export type ReviewSeverity = "major" | "minor" | "typo";
export type ReviewStatus = "open" | "resolved";

export interface ReviewComment {
  id: string;
  reviewer: string;
  role: string;
  /** Where in the paper: a section id or a figure id with an optional step. */
  anchor: { kind: "section" | "figure"; id: string; state?: string };
  severity: ReviewSeverity;
  status: ReviewStatus;
  body: string;
  reply?: string;
  createdHoursAgo: number;
}
