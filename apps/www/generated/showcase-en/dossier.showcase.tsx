"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Dossier } from "../../../../packages/ui/src/dossier/dossier";
const sections = [
    { key: "basic", label: "Basic information", status: "done" as const, summary: "Lin Wanqing \u00B7 138-0000-0000" },
    { key: "intent", label: "Job intention", status: "done" as const, summary: "Yunqi Technology \u00B7 President's Personal Secretary" },
    { key: "education", label: "Educational background", status: "partial" as const, active: true, summary: "Already recorded school, professional reasons to be supplemented" },
    { key: "experience", label: "Work experience", status: "empty" as const },
    { key: "knowledge", label: "Employer Awareness", status: "empty" as const },
    { key: "extras", label: "Optional supplement", status: "empty" as const, optional: true },
];
const Demo = () => (<div className="w-full max-w-sm">
    <Dossier sections={sections}/>
  </div>);
export const dossierShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Three-state field (archived/partial/empty) + the current collection field is highlighted, and the head automatically calculates the progress.",
            code: `<Dossier
  sections={[
    { key: "basic", label: "Basic information", status: "done", summary: "Lin Wanqing \u00B7 138-0000-0000" },
    { key: "intent", label: "Job Intention", status: "done", summary: "Yunqi Technology\u00B7President's Personal Secretary" },
    { key: "education", label: "Education Background", status: "partial", active: true, summary: "School has been recorded, professional reasons to be filled" },
    { key: "experience", label: "Work experience", status: "empty" },
    { key: "extras", label: "Optional supplement", status: "empty", optional: true },
  ]}
/>`,
            render: () => (<div className="w-full max-w-sm">
          <Dossier sections={sections}/>
        </div>),
        },
        {
            title: "Archive All",
            description: "When all domains are done, the progress is full and customized title.",
            code: `<Dossier
  title="Case file \u00B7 Complete arguments"
  sections={sections.map((s) => ({ ...s, status: "done", active: false }))}
/>`,
            render: () => (<div className="w-full max-w-sm">
          <Dossier title="Case file · Complete arguments" sections={sections.map((s) => ({
                    ...s,
                    status: "done" as const,
                    active: false,
                    summary: s.summary ?? "Archived",
                }))}/>
        </div>),
        },
        {
            title: "Embedded (bare)",
            description: "bare Remove the container border background and embed other panels.",
            code: `<Dossier sections={sections.slice(0, 4)} bare />`,
            render: () => (<div className="w-full max-w-sm rounded-[var(--radius)] bg-surface-hover p-4">
          <Dossier sections={sections.slice(0, 4)} bare/>
        </div>),
        },
    ],
    controls: [],
    states: [
        { name: "Interview in progress (mixed three-state + current domain highlighting)", render: () => <Demo /> },
        {
            name: "Archive All",
            render: () => (<div className="w-full max-w-sm">
          <Dossier title="Case file · Complete arguments" sections={sections.map((s) => ({
                    ...s,
                    status: "done" as const,
                    active: false,
                    summary: s.summary ?? "Archived",
                }))}/>
        </div>),
        },
        {
            name: "bare embedded state",
            render: () => (<div className="w-full max-w-sm rounded-[var(--radius)] bg-surface-hover p-4">
          <Dossier sections={sections.slice(0, 4)} bare/>
        </div>),
        },
    ],
    renderWithProps: () => <Demo />,
    toCode: () => `<Dossier sections={[{ key, label, status: "done", summary }, \u2026]} />`,
};
