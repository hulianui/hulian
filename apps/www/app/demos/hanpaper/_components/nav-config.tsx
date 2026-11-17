import { copy } from "./nav-config.content";
import { BookMarked, FileText, LayoutDashboard, MessageSquareText, Send, Settings, Workflow } from "lucide-react";
import type { ReactNode } from "react";
import type { NavMenuNode } from "@hulianui/ui";

export const ROOT = "/demos/hanpaper";

/** The manuscript entry opens the Git paper, the only paper with a body in this demo. */
export const MANUSCRIPT_HREF = `${ROOT}/papers/git`;

export const NAV_LABEL: Record<string, string> = {
  overview: copy("workbench"),
  papers: copy("manuscript"),
  figures: copy("figureStudio"),
  library: copy("library"),
  review: copy("review"),
  submit: copy("submission"),
  settings: copy("settings"),
};

const icon = (Comp: typeof FileText): ReactNode => <Comp className="size-4" />;

export const MENU: NavMenuNode[] = [
  { key: "overview", label: NAV_LABEL.overview, icon: icon(LayoutDashboard) },
  {
    type: "group",
    key: "g-writing",
    label: copy("groupWriting"),
    children: [
      { key: "papers", label: NAV_LABEL.papers, icon: icon(FileText) },
      { key: "figures", label: NAV_LABEL.figures, icon: icon(Workflow) },
      { key: "library", label: NAV_LABEL.library, icon: icon(BookMarked) },
    ],
  },
  {
    type: "group",
    key: "g-publishing",
    label: copy("groupPublishing"),
    children: [
      { key: "review", label: NAV_LABEL.review, icon: icon(MessageSquareText) },
      { key: "submit", label: NAV_LABEL.submit, icon: icon(Send) },
    ],
  },
  { key: "settings", label: NAV_LABEL.settings, icon: icon(Settings) },
];

/** Route to menu key; /papers/<id> highlights the manuscript entry. */
export function keyFromPath(pathname: string): string {
  const seg = pathname.replace(ROOT, "").replace(/^\//, "").split("/")[0];
  return seg === "" ? "overview" : seg;
}

export function hrefFromKey(key: string): string {
  if (key === "overview") return ROOT;
  if (key === "papers") return MANUSCRIPT_HREF;
  return `${ROOT}/${key}`;
}
