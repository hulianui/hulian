"use client";
import { useState, type ReactNode } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { DesignCanvas } from "./design-canvas";
import type { DesignCanvasItem } from "./design-canvas.types";

const initial: DesignCanvasItem[] = [
  { id: "hero", x: 40, y: 32, width: 260, height: 120, label: "首屏横幅" },
  { id: "card", x: 40, y: 176, width: 120, height: 96, label: "特性卡片" },
  { id: "cta", x: 180, y: 176, width: 120, height: 96, label: "行动按钮" },
];

const swatch = ["bg-primary/15", "bg-success/15", "bg-warning/15"];

function Block({
  item,
  index,
  selected,
}: {
  item: DesignCanvasItem;
  index: number;
  selected: boolean;
}) {
  return (
    <div
      className={`grid h-full w-full place-items-center rounded-[var(--radius)] border ${
        selected ? "border-primary" : "border-hairline"
      } ${swatch[index % swatch.length]} text-xs text-fg`}
    >
      {item.label ?? item.id}
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="h-[360px] w-full overflow-hidden rounded-[var(--radius)] border border-border">
      {children}
    </div>
  );
}

function BasicDemo() {
  const [items, setItems] = useState(initial);
  const [selected, setSelected] = useState<string | null>("hero");
  return (
    <Shell>
      <DesignCanvas
        items={items}
        onItemsChange={setItems}
        selectedElement={selected}
        onSelect={setSelected}
        onItemDelete={(id) => setItems((p) => p.filter((i) => i.id !== id))}
        renderItem={(item, s) => (
          <Block item={item} index={initial.findIndex((i) => i.id === item.id)} selected={s.selected} />
        )}
      />
    </Shell>
  );
}

function SnapDemo() {
  const [items, setItems] = useState(initial);
  return (
    <Shell>
      <DesignCanvas
        items={items}
        onItemsChange={setItems}
        grid={20}
        snap={20}
        renderItem={(item, s) => (
          <Block item={item} index={initial.findIndex((i) => i.id === item.id)} selected={s.selected} />
        )}
      />
    </Shell>
  );
}

function LockedDemo() {
  const [items, setItems] = useState<DesignCanvasItem[]>([
    { ...initial[0], locked: true, label: "锁定的画板" },
    initial[1],
    initial[2],
  ]);
  return (
    <Shell>
      <DesignCanvas
        items={items}
        onItemsChange={setItems}
        renderItem={(item, s) => (
          <Block item={item} index={initial.findIndex((i) => i.id === item.id)} selected={s.selected} />
        )}
      />
    </Shell>
  );
}

function ViewportDemo() {
  const [zoom, setZoom] = useState(0.8);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [items, setItems] = useState(initial);
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center gap-3 text-xs text-muted">
        <span>缩放 {Math.round(zoom * 100)}%</span>
        <span>
          平移 {Math.round(pan.x)} / {Math.round(pan.y)}
        </span>
      </div>
      <Shell>
        <DesignCanvas
          items={items}
          onItemsChange={setItems}
          zoom={zoom}
          onZoomChange={setZoom}
          pan={pan}
          onPanChange={setPan}
          renderItem={(item, s) => (
            <Block
              item={item}
              index={initial.findIndex((i) => i.id === item.id)}
              selected={s.selected}
            />
          )}
        >
          {/* children：自绘图层，跟随平移缩放但几何自持 */}
          <div className="pointer-events-none absolute left-[40px] top-[8px] text-[10px] text-muted">
            画板 A · 320×280
          </div>
        </DesignCanvas>
      </Shell>
    </div>
  );
}

export const designCanvasShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "受控 items：拖元素移动、拖八向手柄改尺寸、点空白取消选中；Tab 在元素间走、方向键微调、Delete 删除。",
      code: `const [items, setItems] = useState(initial);
const [selected, setSelected] = useState<string | null>("hero");

<div className="h-[360px] w-full overflow-hidden rounded border border-border">
  <DesignCanvas
    items={items}
    onItemsChange={setItems}
    selectedElement={selected}
    onSelect={setSelected}
    onItemDelete={(id) => setItems((p) => p.filter((i) => i.id !== id))}
    renderItem={(item) => <div className="h-full w-full …">{item.label}</div>}
  />
</div>`,
      render: () => <BasicDemo />,
    },
    {
      title: "网格吸附",
      description: "grid 画底纹、snap 定步长；两者独立，可以只画不吸附，也可以吸附到比底纹更细的步长。",
      code: `<DesignCanvas items={items} onItemsChange={setItems} grid={20} snap={20} … />`,
      render: () => <SnapDemo />,
    },
    {
      title: "锁定元素",
      description: "locked 的元素仍可选中、仍能 Tab 到，但拖不动也不出 resize 手柄。",
      code: `<DesignCanvas
  items={[{ id: "hero", x: 40, y: 32, width: 260, height: 120, locked: true }, …]}
  onItemsChange={setItems}
/>`,
      render: () => <LockedDemo />,
    },
    {
      title: "受控视口 + 自绘图层",
      description:
        "zoom / pan 受控后可与外部工具条联动；children 直接挂进世界坐标层，跟随平移缩放但几何自持。",
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
    画板 A · 320×280
  </div>
</DesignCanvas>`,
      render: () => <ViewportDemo />,
    },
  ],
  controls: [],
  states: [
    { name: "自由排列（默认）", render: () => <BasicDemo /> },
    { name: "网格吸附", render: () => <SnapDemo /> },
    { name: "含锁定元素", render: () => <LockedDemo /> },
    { name: "受控视口", render: () => <ViewportDemo /> },
  ],
  renderWithProps: () => <BasicDemo />,
  toCode: () =>
    `<DesignCanvas items={items} onItemsChange={setItems} selectedElement={selected} onSelect={setSelected} />`,
};
