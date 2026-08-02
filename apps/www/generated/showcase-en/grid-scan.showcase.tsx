"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { GridScan } from "../../../../packages/ui/src/grid-scan/grid-scan";
import type { GridScanDirection, GridScanLineStyle } from "../../../../packages/ui/src/grid-scan/grid-scan.types";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.13 0.02 265)" }}>
      {children}
    </div>);
}
export const gridScanShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Default round-trip scan; children layered on top of perspective grid via relative z-10.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl bg-neutral-950">
  <GridScan>
    <div className="flex h-full items-center justify-center text-white/80">
      Content layer
    </div>
  </GridScan>
</div>`,
            render: () => (<Stage>
          <GridScan>
            <div className="flex h-full items-center justify-center text-sm font-medium text-white/80">
              Content layer
            </div>
          </GridScan>
        </Stage>),
        },
        {
            title: "Dashed grid \u00B7 Scan forward",
            description: "lineStyle switches among solid, dashed, and dotted lines; scanDirection controls the scan direction.",
            code: `<GridScan lineStyle="dashed" scanDirection="forward" scanOpacity={0.6} />`,
            render: () => (<Stage>
          <GridScan lineStyle="dashed" scanDirection="forward" scanOpacity={0.6}/>
        </Stage>),
        },
        {
            title: "Dotted line grid + custom scan color",
            description: "gridScale The smaller the grid, the denser it is. scanColor changes the scanning pulse luminous color.",
            code: `<GridScan lineStyle="dotted" gridScale={0.07} scanColor="var(--color-chart-4)" />`,
            render: () => (<Stage>
          <GridScan lineStyle="dotted" gridScale={0.07} scanColor="var(--color-chart-4)"/>
        </Stage>),
        },
        {
            title: "Sparse slow scan (wallpaper level)",
            description: "Large gridScale + long scanDuration + high scanSoftness to get a leisurely wide light band.",
            code: `<GridScan
  gridScale={0.18}
  scanDuration={4}
  scanDelay={1}
  scanSoftness={3}
  scanColor="var(--color-chart-1)"
/>`,
            render: () => (<Stage>
          <GridScan gridScale={0.18} scanDuration={4} scanDelay={1} scanSoftness={3} scanColor="var(--color-chart-1)"/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "gridScale", type: "number", defaultValue: 0.1, label: "Grid density" },
        {
            prop: "lineThickness",
            type: "number",
            defaultValue: 1,
            label: "Line thickness px",
        },
        {
            prop: "lineStyle",
            type: "select",
            defaultValue: "solid",
            options: ["solid", "dashed", "dotted"],
            label: "Line style",
        },
        {
            prop: "scanDirection",
            type: "select",
            defaultValue: "pingpong",
            options: ["forward", "backward", "pingpong"],
            label: "Scan direction",
        },
        {
            prop: "scanOpacity",
            type: "number",
            defaultValue: 0.45,
            label: "Scanning brightness",
        },
        {
            prop: "scanDuration",
            type: "number",
            defaultValue: 2,
            label: "Scanning seconds",
        },
    ],
    states: [
        {
            name: "default (round trip scan\u00B7default parameters)",
            render: () => (<Stage>
          <GridScan />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            GridScan
          </div>
        </Stage>),
        },
        {
            name: "Dashed grid \u00B7 Scan forward",
            render: () => (<Stage>
          <GridScan lineStyle="dashed" scanDirection="forward" scanOpacity={0.6}/>
        </Stage>),
        },
        {
            name: "Dotted Line Grid \u00B7 High Density",
            render: () => (<Stage>
          <GridScan lineStyle="dotted" gridScale={0.07} scanColor="var(--color-chart-4)"/>
        </Stage>),
        },
        {
            name: "Sparse slow scan \u00B7 Wallpaper level",
            render: () => (<Stage>
          <GridScan gridScale={0.18} scanDuration={4} scanDelay={1} scanSoftness={3} scanColor="var(--color-chart-1)">
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <p className="text-lg font-semibold text-white">Hulian component library</p>
              <p className="text-xs text-white/60">Perspective Scan Grid · ogl · Zero-heavy dependencies</p>
            </div>
          </GridScan>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <GridScan gridScale={p.gridScale as number} lineThickness={p.lineThickness as number} lineStyle={p.lineStyle as GridScanLineStyle} scanDirection={p.scanDirection as GridScanDirection} scanOpacity={p.scanOpacity as number} scanDuration={p.scanDuration as number}/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-64 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.13 0.02 265)" }}>`,
        `  <GridScan`,
        `    gridScale={${p.gridScale}}`,
        `    lineThickness={${p.lineThickness}}`,
        `    lineStyle="${p.lineStyle}"`,
        `    scanDirection="${p.scanDirection}"`,
        `    scanOpacity={${p.scanOpacity}}`,
        `    scanDuration={${p.scanDuration}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
