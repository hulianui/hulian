"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { RegionSelect } from "../../../../packages/ui/src/region-select/region-select";
import type { RegionBox } from "../../../../packages/ui/src/region-select/region-box";
const PAGE_W = 900;
const PAGE_H = 1200;
const line = (x: number, y: number, w: number, o = 0.75) => `<rect x='${x}' y='${y}' width='${w}' height='9' rx='4' fill='%23334155' opacity='${o}'/>`;
const pageSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='${PAGE_W}' height='${PAGE_H}'>` + `<rect width='100%25' height='100%25' fill='%23fdfdfb'/>` + `<rect x='0' y='0' width='100%25' height='70' fill='%23e2e8f0'/>` +
    line(60, 28, 240, 0.9) +
    [0, 1, 2, 3].map((i) => line(60, 120 + i * 34, 780 - i * 40)).join("") + `<rect x='60' y='290' width='420' height='260' rx='6' fill='%23dbeafe' stroke='%2393c5fd' stroke-width='3'/>` + `<path d='M100 500 L200 360 L300 470 L420 330' fill='none' stroke='%232563eb' stroke-width='6'/>` + `<circle cx='300' cy='470' r='9' fill='%232563eb'/>` +
    [0, 1, 2, 3, 4].map((i) => line(60, 600 + i * 34, 760 - (i % 3) * 90)).join("") + `<rect x='520' y='860' width='320' height='200' rx='6' fill='%23fef3c7' stroke='%23fbbf24' stroke-width='3'/>` +
    [0, 1, 2].map((i) => line(60, 880 + i * 34, 400 - i * 60)).join("") + `</svg>`;
const PAGE_SRC = `data:image/svg+xml;utf8,${pageSvg}`;
const NATURAL = { width: PAGE_W, height: PAGE_H };
const fmt = (b: RegionBox | null) => b ? `[${b.map((n) => Math.round(n)).join(", ")}]` : "(not selected)";
function Basic({ aspect }: {
    aspect?: number;
}) {
    const [box, setBox] = useState<RegionBox | null>([60, 290, 480, 550]);
    return (<div className="flex w-full max-w-xl flex-col gap-2">
      <RegionSelect src={PAGE_SRC} naturalSize={NATURAL} value={box} onChange={setBox} aspect={aspect} maxHeight="22rem" alt="Test paper scan page"/>
      <p className="font-mono text-xs text-muted-foreground">
        box (original image pixels):<span className="text-foreground">{fmt(box)}</span>
      </p>
    </div>);
}
function WithOthers() {
    const [box, setBox] = useState<RegionBox | null>(null);
    return (<div className="flex w-full max-w-xl flex-col gap-2">
      <RegionSelect src={PAGE_SRC} naturalSize={NATURAL} value={box} onChange={setBox} maxHeight="22rem" boxes={[
            { id: "q1", box: [60, 100, 840, 250], label: "Question 1", color: "chart-2" },
            { id: "q3", box: [520, 860, 840, 1060], label: "Question 3 with pictures", color: "chart-4" },
        ]}/>
      <p className="text-xs text-muted-foreground">
        The dotted line is the existing box on the same page (read-only), and the solid line is the one currently dragged out:{fmt(box)}
      </p>
    </div>);
}
export const regionSelectShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Drag a box on the picture to get back the **original image pixel** coordinates [x1, y1, x2, y2]; dragging in the reverse direction also gives normalized results.",
            code: `const [box, setBox] = useState<RegionBox | null>(null)

<RegionSelect
  src={pageUrl}
  value={box}
  onChange={setBox} // After dragging, give a standardized box
  minSide={8} // If the short side is smaller than this, it will be regarded as an error.
  maxHeight="60vh" // Super high image internal scrolling
/>`,
            render: () => <Basic />,
        },
        {
            title: "Other boxes on the same page",
            description: "boxes transfers read-only other boxes (dashed line + label), and the currently edited one is still the solid line main box.",
            code: `<RegionSelect
  src={pageUrl}
  value={box}
  onChange={setBox}
  boxes={[
    { id: "q1", box: [60, 100, 840, 250], label: "Question 1", color: "chart-2" },
    { id: "q3", box: [520, 860, 840, 1060], label: "Question 3 with pictures", color: "chart-4" },
  ]}
/>`,
            render: () => <WithOthers />,
        },
        {
            title: "Fixed ratio \u00B7 Read only",
            description: "aspect has a fixed aspect ratio (the entire aspect ratio will be reduced when hitting the boundary, and the proportion will not be destroyed by single-axis clamping); readOnly only cannot be changed.",
            code: `<RegionSelect src={pageUrl} value={box} onChange={setBox} aspect={16 / 9} />
<RegionSelect src={pageUrl} value={box} readOnly />`,
            render: () => (<div className="flex flex-col gap-4">
          <Basic aspect={16 / 9}/>
          <RegionSelect src={PAGE_SRC} naturalSize={NATURAL} value={[60, 290, 480, 550]} readOnly maxHeight="14rem" className="max-w-xl"/>
        </div>),
        },
    ],
    controls: [
        { prop: "aspect", type: "select", options: ["Free", "1:1", "16:9", "5:7"], defaultValue: "Free" },
        { prop: "minSide", type: "number", defaultValue: 8 },
        { prop: "readOnly", type: "boolean", defaultValue: false },
    ],
    states: [
        { name: "Free frame selection", render: () => <Basic /> },
        { name: "Other boxes on the same page (read only)", render: () => <WithOthers /> },
        { name: "Fixed 16:9", render: () => <Basic aspect={16 / 9}/> },
        {
            name: "Read only",
            render: () => (<RegionSelect src={PAGE_SRC} naturalSize={NATURAL} value={[60, 290, 480, 550]} readOnly maxHeight="18rem" className="max-w-xl"/>),
        },
    ],
    renderWithProps: (p) => {
        const aspect = p.aspect === "1:1" ? 1 : p.aspect === "16:9" ? 16 / 9 : p.aspect === "5:7" ? 5 / 7 : undefined;
        return (<PlaygroundBox aspect={aspect} minSide={Number(p.minSide ?? 8)} readOnly={p.readOnly === true}/>);
    },
    toCode: (p) => `<RegionSelect
  src={pageUrl}
  value={box}
  onChange={setBox}${p.aspect && p.aspect !== "Free"
        ? `
  aspect={${p.aspect === "1:1" ? "1" : p.aspect === "16:9" ? "16 / 9" : "5 / 7"}}`
        : ""}${p.minSide && Number(p.minSide) !== 8 ? `
  minSide={${p.minSide}}` : ""}${p.readOnly === true ? "\n  readOnly" : ""}
/>`,
};
function PlaygroundBox({ aspect, minSide, readOnly, }: {
    aspect?: number;
    minSide: number;
    readOnly: boolean;
}) {
    const [box, setBox] = useState<RegionBox | null>([60, 290, 480, 550]);
    return (<div className="flex w-full max-w-lg flex-col gap-2">
      <RegionSelect src={PAGE_SRC} naturalSize={NATURAL} value={box} onChange={setBox} aspect={aspect} minSide={minSide} readOnly={readOnly} maxHeight="18rem"/>
      <p className="font-mono text-xs text-muted-foreground">{fmt(box)}</p>
    </div>);
}
