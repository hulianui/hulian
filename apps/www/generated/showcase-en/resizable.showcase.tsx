"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "../../../../packages/ui/src/resizable/resizable";
const fileTree = [
    "src/",
    "  app/",
    "    page.tsx",
    "    layout.tsx",
    "  components/",
    "    nav.tsx",
    "    card.tsx",
    "  lib/",
    "    utils.ts",
    "package.json",
    "tsconfig.json",
];
const codeLines = [
    "export function Card({ title, children }) {",
    "  return (",
    "    <section className=\"rounded-lg border p-4\">",
    "      <h3 className=\"font-semibold\">{title}</h3>",
    "      <div className=\"mt-2 text-sm\">{children}</div>",
    "    </section>",
    "  );",
    "}",
];
function FileTree() {
    return (<div className="h-full bg-surface p-3">
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Resource Manager</div>
      <ul className="space-y-0.5 font-mono text-xs text-foreground">
        {fileTree.map((f, i) => (<li key={i} className={f.includes(".") ? "" : "text-muted"} style={{ whiteSpace: "pre" }}>
            {f}
          </li>))}
      </ul>
    </div>);
}
function Editor() {
    return (<div className="h-full bg-bg p-3">
      <div className="mb-2 text-xs text-muted">components/card.tsx</div>
      <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-foreground">
        {codeLines.map((l, i) => (<div key={i}>
            <span className="mr-3 select-none text-muted">{String(i + 1).padStart(2, " ")}</span>
            {l}
          </div>))}
      </pre>
    </div>);
}
function Preview() {
    return (<div className="h-full space-y-3 bg-surface p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-muted">Live preview</div>
      <section className="rounded-[var(--radius)] border border-border p-3">
        <h3 className="text-sm font-semibold text-foreground">Monthly Overview</h3>
        <p className="mt-1 text-xs text-muted">There were 1,284 new orders this month, a month-on-month increase of 12%.</p>
      </section>
    </div>);
}
function ChatLog() {
    return (<div className="h-full overflow-auto bg-surface p-3">
      <div className="mb-2 text-xs font-medium text-muted">Session</div>
      <ul className="space-y-1 text-sm text-foreground">
        <li>Customer · Ms. Wang: Has it been shipped?</li>
        <li>Customer Service · Xiaolian: It has been arranged to be sent out today 📦</li>
        <li>Customer · Ms. Wang: OK, thank you!</li>
      </ul>
    </div>);
}
function LogPanel() {
    return (<div className="h-full overflow-auto bg-bg p-3 font-mono text-xs leading-relaxed text-muted">
      <div>[12:01:08] INFO session has been connected to agent#7</div>
      <div>[12:01:24] INFO Push logistics order number SF1024...</div>
      <div className="text-foreground">[12:01:31] WARN Customer Satisfaction Questionnaire is not filled in</div>
      <div>[12:01:40] INFO session marked as resolved</div>
    </div>);
}
export const resizableShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Horizontal two columns",
            description: "direction=horizontal, drag the vertical handle to increase or decrease, and min constrains the minimum width.",
            code: `<ResizablePanelGroup direction="horizontal" defaultSizes={[35, 65]}>
  <ResizablePanel min={20}><FileTree /></ResizablePanel>
  <ResizableHandle />
  <ResizablePanel><Editor /></ResizablePanel>
</ResizablePanelGroup>`,
            render: () => (<div className="h-48 w-80 max-w-full overflow-hidden rounded-[var(--radius)] border border-border">
          <ResizablePanelGroup direction="horizontal" defaultSizes={[35, 65]}>
            <ResizablePanel min={20}>
              <FileTree />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel>
              <Editor />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>),
        },
        {
            title: "Vertical up and down columns",
            description: "direction=vertical, the handle becomes horizontal, drag the upper and lower panels to increase the height.",
            code: `<ResizablePanelGroup direction="vertical" defaultSizes={[55, 45]}>
  <ResizablePanel min={20}><ChatLog /></ResizablePanel>
  <ResizableHandle />
  <ResizablePanel min={20}><LogPanel /></ResizablePanel>
</ResizablePanelGroup>`,
            render: () => (<div className="h-64 w-[34rem] max-w-full overflow-hidden rounded-[var(--radius)] border border-border">
          <ResizablePanelGroup direction="vertical" defaultSizes={[55, 45]}>
            <ResizablePanel min={20}>
              <ChatLog />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel min={20}>
              <LogPanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>),
        },
        {
            title: "Three-column editor layout",
            description: "Multi-panel + multi-handle; defaultSizes gives the initial scale, and the keyboard \u2190/\u2192 can also be fine-tuned.",
            code: `<ResizablePanelGroup direction="horizontal" defaultSizes={[24, 46, 30]}>
  <ResizablePanel min={15}><FileTree /></ResizablePanel>
  <ResizableHandle />
  <ResizablePanel min={25}><Editor /></ResizablePanel>
  <ResizableHandle />
  <ResizablePanel min={18}><Preview /></ResizablePanel>
</ResizablePanelGroup>`,
            render: () => (<div className="h-64 w-[34rem] max-w-full overflow-hidden rounded-[var(--radius)] border border-border">
          <ResizablePanelGroup direction="horizontal" defaultSizes={[24, 46, 30]}>
            <ResizablePanel min={15}>
              <FileTree />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel min={25}>
              <Editor />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel min={18}>
              <Preview />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>),
        },
    ],
    controls: [
        {
            prop: "direction",
            type: "select",
            options: ["horizontal", "vertical"],
            defaultValue: "horizontal",
            label: "Direction",
        },
    ],
    states: [
        {
            name: "Editor three columns (drag the handle to adjust: File Tree/Editor/Preview)",
            render: () => (<div className="h-64 w-[34rem] max-w-full overflow-hidden rounded-[var(--radius)] border border-border">
          <ResizablePanelGroup direction="horizontal" defaultSizes={[24, 46, 30]}>
            <ResizablePanel min={15}>
              <FileTree />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel min={25}>
              <Editor />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel min={18}>
              <Preview />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>),
        },
        {
            name: "Upper and lower columns (vertical: session/log, drag the horizontal handle)",
            render: () => (<div className="h-64 w-[34rem] max-w-full overflow-hidden rounded-[var(--radius)] border border-border">
          <ResizablePanelGroup direction="vertical" defaultSizes={[55, 45]}>
            <ResizablePanel min={20}>
              <ChatLog />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel min={20}>
              <LogPanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>),
        },
        {
            name: "Two columns + minimum width constraint (side column min=20%, keyboard \u2190/\u2192 can also be fine-tuned)",
            render: () => (<div className="h-48 w-80 max-w-full overflow-hidden rounded-[var(--radius)] border border-border">
          <ResizablePanelGroup direction="horizontal" defaultSizes={[35, 65]}>
            <ResizablePanel min={20}>
              <FileTree />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel>
              <Editor />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>),
        },
    ],
    renderWithProps: (p) => {
        const direction = (p.direction as "horizontal" | "vertical") ?? "horizontal";
        return (<div className="h-64 w-[34rem] max-w-full overflow-hidden rounded-[var(--radius)] border border-border">
        <ResizablePanelGroup direction={direction} defaultSizes={[40, 60]}>
          <ResizablePanel min={20}>
            {direction === "horizontal" ? <FileTree /> : <ChatLog />}
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>{direction === "horizontal" ? <Editor /> : <LogPanel />}</ResizablePanel>
        </ResizablePanelGroup>
      </div>);
    },
    toCode: (p) => `<ResizablePanelGroup direction="${p.direction ?? "horizontal"}" defaultSizes={[40, 60]}>
  <ResizablePanel min={20}><FileTree /></ResizablePanel>
  <ResizableHandle />
  <ResizablePanel><Editor /></ResizablePanel>
</ResizablePanelGroup>`,
};
