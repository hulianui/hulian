import { copy } from "./reviews.content";
import { AUTHORS } from "./papers";
import type { ReviewComment } from "./types";

// Internal review round 2 of the Git paper. Anchors point at sections or at a figure step,
// so the review page can render them as SecRef / FigRef inside the same Paper.

export const reviews: ReviewComment[] = [
  {
    id: "rv-1",
    reviewer: AUTHORS.he,
    role: copy("roleAdvisor"),
    anchor: { kind: "figure", id: "fig-branch", state: "merge" },
    severity: "major",
    status: "resolved",
    body: copy("mergeParentsBody"),
    reply: copy("mergeParentsReply"),
    createdHoursAgo: 52,
  },
  {
    id: "rv-2",
    reviewer: copy("externalReviewer"),
    role: copy("roleExternal"),
    anchor: { kind: "section", id: "sec-integrity" },
    severity: "major",
    status: "open",
    body: copy("shaImpactBody"),
    createdHoursAgo: 30,
  },
  {
    id: "rv-3",
    reviewer: AUTHORS.he,
    role: copy("roleAdvisor"),
    anchor: { kind: "figure", id: "fig-pack", state: "heavy" },
    severity: "minor",
    status: "resolved",
    body: copy("packSourceBody"),
    reply: copy("packSourceReply"),
    createdHoursAgo: 28,
  },
  {
    id: "rv-4",
    reviewer: AUTHORS.chen,
    role: copy("roleCoauthor"),
    anchor: { kind: "section", id: "sec-rebase" },
    severity: "minor",
    status: "open",
    body: copy("rebaseOntoBody"),
    createdHoursAgo: 20,
  },
  {
    id: "rv-5",
    reviewer: AUTHORS.chen,
    role: copy("roleCoauthor"),
    anchor: { kind: "section", id: "sec-trees" },
    severity: "typo",
    status: "open",
    body: copy("termBody"),
    createdHoursAgo: 19,
  },
  {
    id: "rv-6",
    reviewer: copy("externalReviewer"),
    role: copy("roleExternal"),
    anchor: { kind: "figure", id: "fig-trees", state: "restore" },
    severity: "minor",
    status: "open",
    body: copy("restoreBody"),
    createdHoursAgo: 6,
  },
];
