"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { RegionSelect } from "./region-select";
import type { RegionBox } from "./region-box";

// 底图用内联 SVG data URI 造一张「扫描试卷页」：文档站门禁禁远程资源，示例也不该依赖外网。
const PAGE_W = 900;
const PAGE_H = 1200;
const line = (x: number, y: number, w: number, o = 0.75) =>
  `<rect x='${x}' y='${y}' width='${w}' height='9' rx='4' fill='%23334155' opacity='${o}'/>`;
const pageSvg =
  `<svg xmlns='http://www.w3.org/2000/svg' width='${PAGE_W}' height='${PAGE_H}'>` +
  `<rect width='100%25' height='100%25' fill='%23fdfdfb'/>` +
  `<rect x='0' y='0' width='100%25' height='70' fill='%23e2e8f0'/>` +
  line(60, 28, 240, 0.9) +
  [0, 1, 2, 3].map((i) => line(60, 120 + i * 34, 780 - i * 40)).join("") +
  `<rect x='60' y='290' width='420' height='260' rx='6' fill='%23dbeafe' stroke='%2393c5fd' stroke-width='3'/>` +
  `<path d='M100 500 L200 360 L300 470 L420 330' fill='none' stroke='%232563eb' stroke-width='6'/>` +
  `<circle cx='300' cy='470' r='9' fill='%232563eb'/>` +
  [0, 1, 2, 3, 4].map((i) => line(60, 600 + i * 34, 760 - (i % 3) * 90)).join("") +
  `<rect x='520' y='860' width='320' height='200' rx='6' fill='%23fef3c7' stroke='%23fbbf24' stroke-width='3'/>` +
  [0, 1, 2].map((i) => line(60, 880 + i * 34, 400 - i * 60)).join("") +
  `</svg>`;
const PAGE_SRC = `data:image/svg+xml;utf8,${pageSvg}`;
const NATURAL = { width: PAGE_W, height: PAGE_H };

const fmt = (b: RegionBox | null) =>
  b ? `[${b.map((n) => Math.round(n)).join(", ")}]` : "（未框选）";

function Basic({ aspect }: { aspect?: number }) {
  const [box, setBox] = useState<RegionBox | null>([60, 290, 480, 550]);
  return (
    <div className="flex w-full max-w-xl flex-col gap-2">
      <RegionSelect
        src={PAGE_SRC}
        naturalSize={NATURAL}
        value={box}
        onChange={setBox}
        aspect={aspect}
        maxHeight="22rem"
        alt="试卷扫描页"
      />
      <p className="font-mono text-xs text-muted">
        box（原图像素）：<span className="text-foreground">{fmt(box)}</span>
      </p>
    </div>
  );
}

function WithOthers() {
  const [box, setBox] = useState<RegionBox | null>(null);
  return (
    <div className="flex w-full max-w-xl flex-col gap-2">
      <RegionSelect
        src={PAGE_SRC}
        naturalSize={NATURAL}
        value={box}
        onChange={setBox}
        maxHeight="22rem"
        boxes={[
          { id: "q1", box: [60, 100, 840, 250], label: "题 1", color: "chart-2" },
          { id: "q3", box: [520, 860, 840, 1060], label: "题 3 配图", color: "chart-4" },
        ]}
      />
      <p className="text-xs text-muted">
        虚线是同页已有的框（只读），实线是当前拖出来的：{fmt(box)}
      </p>
    </div>
  );
}

export const regionSelectShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "在图上拖一个框，拿回**原图像素**坐标 [x1,y1,x2,y2]；反向拖也给规范化结果。",
      code: `const [box, setBox] = useState<RegionBox | null>(null)

<RegionSelect
  src={pageUrl}
  value={box}
  onChange={setBox}      // 拖完给一个规范化的框
  minSide={8}            // 短边小于此视为误点
  maxHeight="60vh"       // 超高图内部滚动
/>`,
      render: () => <Basic />,
    },
    {
      title: "同页其它框",
      description: "boxes 传只读的其它框（虚线 + 标注），当前编辑的那个仍是实线主框。",
      code: `<RegionSelect
  src={pageUrl}
  value={box}
  onChange={setBox}
  boxes={[
    { id: "q1", box: [60, 100, 840, 250], label: "题 1", color: "chart-2" },
    { id: "q3", box: [520, 860, 840, 1060], label: "题 3 配图", color: "chart-4" },
  ]}
/>`,
      render: () => <WithOthers />,
    },
    {
      title: "固定比例 · 只读",
      description: "aspect 固定宽高比（撞边界时整体缩，不会被单轴钳位破坏比例）；readOnly 只看不改。",
      code: `<RegionSelect src={pageUrl} value={box} onChange={setBox} aspect={16 / 9} />
<RegionSelect src={pageUrl} value={box} readOnly />`,
      render: () => (
        <div className="flex flex-col gap-4">
          <Basic aspect={16 / 9} />
          <RegionSelect
            src={PAGE_SRC}
            naturalSize={NATURAL}
            value={[60, 290, 480, 550]}
            readOnly
            maxHeight="14rem"
            className="max-w-xl"
          />
        </div>
      ),
    },
  ],
  controls: [
    { prop: "aspect", type: "select", options: ["自由", "1:1", "16:9", "5:7"], defaultValue: "自由" },
    { prop: "minSide", type: "number", defaultValue: 8 },
    { prop: "readOnly", type: "boolean", defaultValue: false },
  ],
  states: [
    { name: "自由框选", render: () => <Basic /> },
    { name: "同页其它框（只读）", render: () => <WithOthers /> },
    { name: "固定 16:9", render: () => <Basic aspect={16 / 9} /> },
    {
      name: "只读",
      render: () => (
        <RegionSelect
          src={PAGE_SRC}
          naturalSize={NATURAL}
          value={[60, 290, 480, 550]}
          readOnly
          maxHeight="18rem"
          className="max-w-xl"
        />
      ),
    },
  ],
  renderWithProps: (p) => {
    const aspect =
      p.aspect === "1:1" ? 1 : p.aspect === "16:9" ? 16 / 9 : p.aspect === "5:7" ? 5 / 7 : undefined;
    return (
      <PlaygroundBox aspect={aspect} minSide={Number(p.minSide ?? 8)} readOnly={p.readOnly === true} />
    );
  },
  toCode: (p) =>
    `<RegionSelect\n  src={pageUrl}\n  value={box}\n  onChange={setBox}${
      p.aspect && p.aspect !== "自由"
        ? `\n  aspect={${p.aspect === "1:1" ? "1" : p.aspect === "16:9" ? "16 / 9" : "5 / 7"}}`
        : ""
    }${p.minSide && Number(p.minSide) !== 8 ? `\n  minSide={${p.minSide}}` : ""}${
      p.readOnly === true ? "\n  readOnly" : ""
    }\n/>`,
};

function PlaygroundBox({
  aspect,
  minSide,
  readOnly,
}: {
  aspect?: number;
  minSide: number;
  readOnly: boolean;
}) {
  const [box, setBox] = useState<RegionBox | null>([60, 290, 480, 550]);
  return (
    <div className="flex w-full max-w-lg flex-col gap-2">
      <RegionSelect
        src={PAGE_SRC}
        naturalSize={NATURAL}
        value={box}
        onChange={setBox}
        aspect={aspect}
        minSide={minSide}
        readOnly={readOnly}
        maxHeight="18rem"
      />
      <p className="font-mono text-xs text-muted">{fmt(box)}</p>
    </div>
  );
}
