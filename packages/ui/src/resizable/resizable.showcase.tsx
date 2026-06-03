"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "./resizable";

function Pane({ label }: { label: string }) {
  return <div className="flex h-full items-center justify-center p-4 text-sm text-muted">{label}</div>;
}

function Demo({ direction }: { direction: "horizontal" | "vertical" }) {
  return (
    <div className="h-48 w-80 overflow-hidden rounded-[var(--radius)] border border-border bg-surface">
      <ResizablePanelGroup direction={direction} defaultSizes={[40, 60]}>
        <ResizablePanel min={20}>
          <Pane label="侧栏" />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
          <Pane label="拖动中间手柄调整" />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export const resizableShowcase: ShowcaseSpec = {
  controls: [
    {
      prop: "direction",
      type: "select",
      options: ["horizontal", "vertical"],
      defaultValue: "horizontal",
      label: "方向",
    },
  ],
  states: [
    { name: "horizontal", render: () => <Demo direction="horizontal" /> },
    { name: "vertical", render: () => <Demo direction="vertical" /> },
    {
      name: "三栏",
      render: () => (
        <div className="h-48 w-80 overflow-hidden rounded-[var(--radius)] border border-border bg-surface">
          <ResizablePanelGroup direction="horizontal" defaultSizes={[25, 50, 25]}>
            <ResizablePanel min={15}>
              <Pane label="左" />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel min={20}>
              <Pane label="中" />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel min={15}>
              <Pane label="右" />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      ),
    },
  ],
  renderWithProps: (p) => <Demo direction={(p.direction as "horizontal" | "vertical") ?? "horizontal"} />,
  toCode: (p) =>
    `<ResizablePanelGroup direction="${p.direction ?? "horizontal"}" defaultSizes={[40, 60]}>\n  <ResizablePanel min={20}>侧栏</ResizablePanel>\n  <ResizableHandle />\n  <ResizablePanel>主区</ResizablePanel>\n</ResizablePanelGroup>`,
};
