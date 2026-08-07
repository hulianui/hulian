"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ElementSelectionOverlay } from "../../../../packages/ui/src/element-selection-overlay/element-selection-overlay";
function HostControl() {
    const [n, setN] = useState(0);
    return (<div className="flex items-center gap-2 text-xs text-muted">
      <button type="button" onClick={() => setN((v) => v + 1)} className="rounded-[min(var(--radius),0.375rem)] border border-border bg-surface px-2.5 py-1 text-foreground transition-colors hover:bg-surface-hover">
        A button on the host page
      </button>
      <span>
        Clicked <span className="tabular-nums text-foreground">{n}</span> times (this must keep counting while selection mode is on)
      </span>
    </div>);
}
function PathBar({ selected, hovered }: {
    selected: string | null;
    hovered: string | null;
}) {
    return (<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
      <span>
        Selected:
        <code className="ml-1 rounded-[min(var(--radius),0.25rem)] bg-surface-hover px-1 py-0.5 text-foreground">
          {selected ?? "\u2014"}
        </code>
      </span>
      <span>
        Hovered:
        <code className="ml-1 rounded-[min(var(--radius),0.25rem)] bg-surface-hover px-1 py-0.5 text-foreground">
          {hovered ?? "\u2014"}
        </code>
      </span>
    </div>);
}
function MarkedDemo({ showLabel = true, enabled = true, highlightSelector = "[data-hulian-component]", }: {
    showLabel?: boolean;
    enabled?: boolean;
    highlightSelector?: string;
}) {
    const [root, setRoot] = useState<HTMLDivElement | null>(null);
    const [selected, setSelected] = useState<string | null>(null);
    const [hovered, setHovered] = useState<string | null>(null);
    return (<div className="w-full space-y-3">
      <div ref={setRoot} className="space-y-3 rounded-[calc(var(--radius)+0.25rem)] border border-border bg-bg p-4">
        <div data-hulian-component="Hero" data-hulian-path="App/Hero" className="rounded-[var(--radius)] bg-surface p-4">
          <p className="text-base font-semibold text-foreground">Point-and-edit preview area</p>
          <p className="mt-1 text-sm text-muted">Move the pointer in and click any block to select it.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div data-hulian-component="StatCard" data-hulian-path="App/Stats/Revenue" className="rounded-[var(--radius)] bg-surface p-3">
            <p className="text-xs text-muted">Revenue this month</p>
            <p className="text-lg font-semibold tabular-nums text-foreground">¥ 128,400</p>
          </div>
          <div data-hulian-component="StatCard" data-hulian-path="App/Stats/Orders" className="rounded-[var(--radius)] bg-surface p-3">
            <p className="text-xs text-muted">Number of orders</p>
            <p className="text-lg font-semibold tabular-nums text-foreground">1,204</p>
          </div>
        </div>
        <div data-hulian-component="CtaBar" data-hulian-path="App/Cta" className="flex items-center justify-between rounded-[var(--radius)] bg-surface p-3">
          <span className="text-sm text-foreground">Upgrade to Pro</span>
          <span className="rounded-[min(var(--radius),0.375rem)] bg-primary px-2.5 py-1 text-xs text-primary-foreground">
            Upgrade now
          </span>
        </div>
      </div>
      <ElementSelectionOverlay target={root} enabled={enabled} showLabel={showLabel} highlightSelector={highlightSelector || undefined} selectedPath={selected} onSelect={(path) => setSelected(path)} onClear={() => setSelected(null)} onHover={(path) => setHovered(path)}/>
      <PathBar selected={selected} hovered={hovered}/>
      <HostControl />
    </div>);
}
function StructuralDemo() {
    const [root, setRoot] = useState<HTMLDivElement | null>(null);
    const [selected, setSelected] = useState<string | null>(null);
    const [hovered, setHovered] = useState<string | null>(null);
    return (<div className="w-full space-y-3">
      <div ref={setRoot} className="space-y-2 rounded-[calc(var(--radius)+0.25rem)] border border-border bg-bg p-4">
        <section className="rounded-[var(--radius)] bg-surface p-3 text-sm text-foreground">
          First section (no markers at all)
        </section>
        <section className="rounded-[var(--radius)] bg-surface p-3">
          <p className="text-sm text-foreground">The second section contains a button:</p>
          <button type="button" className="mt-2 rounded-[min(var(--radius),0.375rem)] border border-border px-2.5 py-1 text-xs text-foreground">
            I am a button
          </button>
        </section>
      </div>
      <ElementSelectionOverlay target={root} selectedPath={selected} onSelect={(path) => setSelected(path)} onClear={() => setSelected(null)} onHover={(path) => setHovered(path)}/>
      <PathBar selected={selected} hovered={hovered}/>
    </div>);
}
const FRAME_DOC = `<!doctype html><html><body style="margin:0;font:14px/1.5 system-ui;background:#fff;color:#111">
<div data-hulian-component="Nav" data-hulian-path="Site/Nav" style="padding:12px 16px;border-bottom:1px solid #e5e7eb">Navigation</div>
<div data-hulian-component="Article" data-hulian-path="Site/Article" style="padding:16px">
  <h1 style="margin:0 0 8px;font-size:18px">Article title inside the iframe</h1>
  <p style="margin:0;color:#6b7280">This content lives in a same-origin iframe, and the overlay can still select it.</p>
</div>
</body></html>`;
function IframeDemo() {
    const [frame, setFrame] = useState<HTMLIFrameElement | null>(null);
    const [selected, setSelected] = useState<string | null>(null);
    const [hovered, setHovered] = useState<string | null>(null);
    return (<div className="w-full space-y-3">
      <iframe ref={setFrame} title="Same-origin preview" srcDoc={FRAME_DOC} className="h-48 w-full rounded-[calc(var(--radius)+0.25rem)] border border-border bg-bg"/>
      <ElementSelectionOverlay target={frame} selectedPath={selected} onSelect={(path) => setSelected(path)} onClear={() => setSelected(null)} onHover={(path) => setHovered(path)}/>
      <PathBar selected={selected} hovered={hovered}/>
    </div>);
}
export const elementSelectionOverlayShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage (marker driven)",
            description: "The preview tree marks itself with data-hulian-path / data-hulian-component, so selecting emits the marked path; highlightSelector narrows selection granularity down to components.",
            code: `const [root, setRoot] = useState<HTMLDivElement | null>(null);
const [selected, setSelected] = useState<string | null>(null);

<div ref={setRoot}>
  <div data-hulian-component="Hero" data-hulian-path="App/Hero">\u2026</div>
  <div data-hulian-component="CtaBar" data-hulian-path="App/Cta">\u2026</div>
</div>

<ElementSelectionOverlay
  target={root}
  highlightSelector="[data-hulian-component]"
  selectedPath={selected}
  onSelect={(path) => setSelected(path)}
  onClear={() => setSelected(null)}
/>`,
            render: () => <MarkedDemo />,
        },
        {
            title: "Structural path fallback without markers",
            description: "When the preview tree carries no markers, the path degrades to a CSS selector that querySelector can resolve back (div > section:nth-of-type(2) > button).",
            code: `<ElementSelectionOverlay
  target={root}
  selectedPath={selected}
  onSelect={(path) => setSelected(path)}
/>`,
            render: () => <StructuralDemo />,
        },
        {
            title: "Same-origin iframe preview",
            description: "Pass an iframe element as target to take over its document; the outline is drawn in the host layer with the iframe offset already applied. A cross-origin iframe is unsupported and reports through onError.",
            code: `const [frame, setFrame] = useState<HTMLIFrameElement | null>(null);

<iframe ref={setFrame} srcDoc={html} title="Preview" />
<ElementSelectionOverlay
  target={frame}
  onSelect={(path) => setSelected(path)}
  onError={(e) => console.warn(e.code, e.message)}
/>`,
            render: () => <IframeDemo />,
        },
        {
            title: "Hide the label / leave selection mode",
            description: "showLabel=false keeps the outline only; enabled=false stops picking and click interception while the existing selection outline stays.",
            code: `<ElementSelectionOverlay target={root} showLabel={false} enabled={false} />`,
            render: () => <MarkedDemo showLabel={false} enabled={false}/>,
        },
    ],
    controls: [
        { prop: "enabled", type: "boolean", defaultValue: true, label: "Selection mode" },
        { prop: "showLabel", type: "boolean", defaultValue: true, label: "Show tags" },
        {
            prop: "highlightSelector",
            type: "text",
            defaultValue: "[data-hulian-component]",
            label: "Selectable scope",
        },
    ],
    states: [
        { name: "Component-level selection (marker driven)", render: () => <MarkedDemo /> },
        { name: "Any element (structural path)", render: () => <StructuralDemo /> },
        { name: "Same-origin iframe", render: () => <IframeDemo /> },
    ],
    renderWithProps: (p) => (<MarkedDemo enabled={p.enabled as boolean} showLabel={p.showLabel as boolean} highlightSelector={p.highlightSelector as string}/>),
    toCode: () => `<ElementSelectionOverlay
  target={previewRoot}
  highlightSelector="[data-hulian-component]"
  selectedPath={selected}
  onSelect={(path, detail) => setSelected(path)}
/>`,
};
