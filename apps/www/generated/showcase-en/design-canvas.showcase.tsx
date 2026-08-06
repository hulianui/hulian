"use client";
import { useState, type ReactNode } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { DesignCanvas } from "../../../../packages/ui/src/design-canvas/design-canvas";
import type { DesignCanvasItem } from "../../../../packages/ui/src/design-canvas/design-canvas.types";
const initial: DesignCanvasItem[] = [
    { id: "hero", x: 40, y: 32, width: 260, height: 120, label: "Hero banner" },
    { id: "card", x: 40, y: 176, width: 120, height: 96, label: "Feature card" },
    { id: "cta", x: 180, y: 176, width: 120, height: 96, label: "Call to action" },
];
const swatch = ["bg-primary/15", "bg-success/15", "bg-warning/15"];
function Block({ item, index, selected, }: {
    item: DesignCanvasItem;
    index: number;
    selected: boolean;
}) {
    return (<div className={`grid h-full w-full place-items-center rounded-[var(--radius)] border ${selected ? "border-primary" : "border-hairline"} ${swatch[index % swatch.length]} text-xs text-fg`}>
      {item.label ?? item.id}
    </div>);
}
function Shell({ children }: {
    children: ReactNode;
}) {
    return (<div className="h-[360px] w-full overflow-hidden rounded-[var(--radius)] border border-border">
      {children}
    </div>);
}
function BasicDemo() {
    const [items, setItems] = useState(initial);
    const [selected, setSelected] = useState<string | null>("hero");
    return (<Shell>
      <DesignCanvas items={items} onItemsChange={setItems} selectedElement={selected} onSelect={setSelected} onItemDelete={(id) => setItems((p) => p.filter((i) => i.id !== id))} renderItem={(item, s) => (<Block item={item} index={initial.findIndex((i) => i.id === item.id)} selected={s.selected}/>)}/>
    </Shell>);
}
function SnapDemo() {
    const [items, setItems] = useState(initial);
    return (<Shell>
      <DesignCanvas items={items} onItemsChange={setItems} grid={20} snap={20} renderItem={(item, s) => (<Block item={item} index={initial.findIndex((i) => i.id === item.id)} selected={s.selected}/>)}/>
    </Shell>);
}
function LockedDemo() {
    const [items, setItems] = useState<DesignCanvasItem[]>([
        { ...initial[0], locked: true, label: "Locked board" },
        initial[1],
        initial[2],
    ]);
    return (<Shell>
      <DesignCanvas items={items} onItemsChange={setItems} renderItem={(item, s) => (<Block item={item} index={initial.findIndex((i) => i.id === item.id)} selected={s.selected}/>)}/>
    </Shell>);
}
function ViewportDemo() {
    const [zoom, setZoom] = useState(0.8);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [items, setItems] = useState(initial);
    return (<div className="w-full space-y-2">
      <div className="flex items-center gap-3 text-xs text-muted">
        <span>Zoom {Math.round(zoom * 100)}%</span>
        <span>
          Pan {Math.round(pan.x)} / {Math.round(pan.y)}
        </span>
      </div>
      <Shell>
        <DesignCanvas items={items} onItemsChange={setItems} zoom={zoom} onZoomChange={setZoom} pan={pan} onPanChange={setPan} renderItem={(item, s) => (<Block item={item} index={initial.findIndex((i) => i.id === item.id)} selected={s.selected}/>)}>

          <div className="pointer-events-none absolute left-[40px] top-[8px] text-[10px] text-muted">
            Board A · 320×280
          </div>
        </DesignCanvas>
      </Shell>
    </div>);
}
export const designCanvasShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Controlled items: drag to move, drag any of the eight handles to resize, click empty space to deselect; Tab walks between elements, arrow keys nudge, Delete removes.",
            code: `const [items, setItems] = useState(initial);
const [selected, setSelected] = useState<string | null>("hero");

<div className="h-[360px] w-full overflow-hidden rounded border border-border">
  <DesignCanvas
    items={items}
    onItemsChange={setItems}
    selectedElement={selected}
    onSelect={setSelected}
    onItemDelete={(id) => setItems((p) => p.filter((i) => i.id !== id))}
    renderItem={(item) => <div className="h-full w-full \u2026">{item.label}</div>}
  />
</div>`,
            render: () => <BasicDemo />,
        },
        {
            title: "Grid snapping",
            description: "grid draws the backdrop and snap sets the step; they are independent, so you can draw without snapping, or snap to a step finer than the backdrop.",
            code: `<DesignCanvas items={items} onItemsChange={setItems} grid={20} snap={20} \u2026 />`,
            render: () => <SnapDemo />,
        },
        {
            title: "Locked element",
            description: "A locked element can still be selected and reached with Tab, but it cannot be dragged and shows no resize handles.",
            code: `<DesignCanvas
  items={[{ id: "hero", x: 40, y: 32, width: 260, height: 120, locked: true }, \u2026]}
  onItemsChange={setItems}
/>`,
            render: () => <LockedDemo />,
        },
        {
            title: "Controlled viewport + custom layer",
            description: "Controlling zoom / pan lets an external toolbar drive the canvas; children mount straight into the world layer, following pan and zoom while owning their own geometry.",
            code: `const [zoom, setZoom] = useState(0.8);
const [pan, setPan] = useState({ x: 0, y: 0 });

<DesignCanvas
  items={items}
  onItemsChange={setItems}
  zoom={zoom}
  onZoomChange={setZoom}
  pan={pan}
  onPanChange={setPan}
>
  <div className="pointer-events-none absolute left-[40px] top-[8px] text-[10px] text-muted">
    Board A \u00B7 320\u00D7280
  </div>
</DesignCanvas>`,
            render: () => <ViewportDemo />,
        },
    ],
    controls: [],
    states: [
        { name: "Free arrangement (default)", render: () => <BasicDemo /> },
        { name: "Grid snapping", render: () => <SnapDemo /> },
        { name: "With a locked element", render: () => <LockedDemo /> },
        { name: "Controlled viewport", render: () => <ViewportDemo /> },
    ],
    renderWithProps: () => <BasicDemo />,
    toCode: () => `<DesignCanvas items={items} onItemsChange={setItems} selectedElement={selected} onSelect={setSelected} />`,
};
