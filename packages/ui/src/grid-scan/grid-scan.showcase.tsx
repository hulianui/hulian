"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { GridScan } from "./grid-scan";
import type { GridScanDirection, GridScanLineStyle } from "./grid-scan.types";

/** 展示用深色底容器，让透视网格 + 扫描带清晰可见 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.13 0.02 265)" }}
    >
      {children}
    </div>
  );
}

export const gridScanShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "默认往返扫描；children 通过 relative z-10 层叠在透视网格之上。",
      code: `<div className="relative h-64 overflow-hidden rounded-xl bg-neutral-950">
  <GridScan>
    <div className="flex h-full items-center justify-center text-white/80">
      内容层
    </div>
  </GridScan>
</div>`,
      render: () => (
        <Stage>
          <GridScan>
            <div className="flex h-full items-center justify-center text-sm font-medium text-white/80">
              内容层
            </div>
          </GridScan>
        </Stage>
      ),
    },
    {
      title: "虚线网格 · 向前扫描",
      description: "lineStyle 切换实/虚/点线，scanDirection 控制扫描带运动方向。",
      code: `<GridScan lineStyle="dashed" scanDirection="forward" scanOpacity={0.6} />`,
      render: () => (
        <Stage>
          <GridScan lineStyle="dashed" scanDirection="forward" scanOpacity={0.6} />
        </Stage>
      ),
    },
    {
      title: "点线网格 + 自定义扫描色",
      description: "gridScale 越小格子越密，scanColor 改扫描脉冲发光色。",
      code: `<GridScan lineStyle="dotted" gridScale={0.07} scanColor="var(--color-chart-4)" />`,
      render: () => (
        <Stage>
          <GridScan lineStyle="dotted" gridScale={0.07} scanColor="var(--color-chart-4)" />
        </Stage>
      ),
    },
    {
      title: "稀疏慢扫（壁纸级）",
      description: "大 gridScale + 长 scanDuration + 高 scanSoftness 得到从容的宽光带。",
      code: `<GridScan
  gridScale={0.18}
  scanDuration={4}
  scanDelay={1}
  scanSoftness={3}
  scanColor="var(--color-chart-1)"
/>`,
      render: () => (
        <Stage>
          <GridScan
            gridScale={0.18}
            scanDuration={4}
            scanDelay={1}
            scanSoftness={3}
            scanColor="var(--color-chart-1)"
          />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "gridScale", type: "number", defaultValue: 0.1, label: "网格密度" },
    {
      prop: "lineThickness",
      type: "number",
      defaultValue: 1,
      label: "线粗 px",
    },
    {
      prop: "lineStyle",
      type: "select",
      defaultValue: "solid",
      options: ["solid", "dashed", "dotted"],
      label: "线条样式",
    },
    {
      prop: "scanDirection",
      type: "select",
      defaultValue: "pingpong",
      options: ["forward", "backward", "pingpong"],
      label: "扫描方向",
    },
    {
      prop: "scanOpacity",
      type: "number",
      defaultValue: 0.45,
      label: "扫描亮度",
    },
    {
      prop: "scanDuration",
      type: "number",
      defaultValue: 2,
      label: "扫描秒数",
    },
  ],

  states: [
    {
      name: "default（往返扫描·默认参数）",
      render: () => (
        <Stage>
          <GridScan />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            GridScan
          </div>
        </Stage>
      ),
    },
    {
      name: "虚线网格 · 向前扫描",
      render: () => (
        <Stage>
          <GridScan lineStyle="dashed" scanDirection="forward" scanOpacity={0.6} />
        </Stage>
      ),
    },
    {
      name: "点线网格 · 高密度",
      render: () => (
        <Stage>
          <GridScan lineStyle="dotted" gridScale={0.07} scanColor="var(--color-chart-4)" />
        </Stage>
      ),
    },
    {
      name: "稀疏慢扫 · 壁纸级",
      render: () => (
        <Stage>
          <GridScan
            gridScale={0.18}
            scanDuration={4}
            scanDelay={1}
            scanSoftness={3}
            scanColor="var(--color-chart-1)"
          >
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <p className="text-lg font-semibold text-white">瑚琏组件库</p>
              <p className="text-xs text-white/60">透视扫描网格 · ogl · 零重依赖</p>
            </div>
          </GridScan>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <GridScan
        gridScale={p.gridScale as number}
        lineThickness={p.lineThickness as number}
        lineStyle={p.lineStyle as GridScanLineStyle}
        scanDirection={p.scanDirection as GridScanDirection}
        scanOpacity={p.scanOpacity as number}
        scanDuration={p.scanDuration as number}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
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
