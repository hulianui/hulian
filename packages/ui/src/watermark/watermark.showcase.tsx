"use client";
import type { ReactNode } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Watermark } from "./watermark";

// 内容区演示卡：含可点击按钮，验证 pointer-events:none 不挡交互
function Sheet({ children }: { children?: ReactNode }) {
  return (
    <div className="h-56 w-full overflow-hidden rounded-[var(--radius)] border border-border bg-surface p-6">
      <h4 className="text-base font-semibold text-foreground">2026 Q2 财务简报（受限）</h4>
      <p className="mt-2 max-w-md text-sm text-muted">
        本页含商业机密，禁止截图外传。水印覆盖全区且随主题自适应，删除水印层会被自动还原。
      </p>
      <button
        type="button"
        className="mt-4 rounded-[var(--radius)] border border-border px-3 py-1.5 text-sm text-foreground hover:bg-surface-hover"
      >
        可点击按钮
      </button>
      {children}
    </div>
  );
}

// 纯几何 SVG logo（data URI），演示图片水印（零外部资源）
const logo =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="84" height="24"><rect x="1" y="5" width="14" height="14" rx="4" fill="none" stroke="%23888" stroke-width="2"/><text x="22" y="18" font-family="sans-serif" font-size="16" fill="%23888">HULIAN</text></svg>`,
  );

export const watermarkShowcase: ShowcaseSpec = {
  controls: [
    { prop: "content", type: "text", defaultValue: "瑚琏 · 机密", label: "水印文字" },
    { prop: "rotate", type: "number", defaultValue: -22, label: "旋转角度" },
    { prop: "fontSize", type: "number", defaultValue: 16, label: "字号" },
    { prop: "opacity", type: "number", defaultValue: 0.15, label: "不透明度" },
  ],
  states: [
    {
      name: "单行文字",
      render: () => (
        <Watermark content="瑚琏 · 机密" className="w-full max-w-xl">
          <Sheet />
        </Watermark>
      ),
    },
    {
      name: "多行文字",
      render: () => (
        <Watermark content={["瑚琏机密", "zhangzhiwei"]} className="w-full max-w-xl">
          <Sheet />
        </Watermark>
      ),
    },
    {
      name: "密集 + 自定义颜色",
      render: () => (
        <Watermark
          content="DO NOT SHARE"
          gap={48}
          rotate={-30}
          color="var(--color-danger)"
          opacity={0.18}
          className="w-full max-w-xl"
        >
          <Sheet />
        </Watermark>
      ),
    },
    {
      name: "图片水印",
      render: () => (
        <Watermark image={logo} width={84} className="w-full max-w-xl">
          <Sheet />
        </Watermark>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Watermark
      content={String(p.content)}
      rotate={Number(p.rotate)}
      fontSize={Number(p.fontSize)}
      opacity={Number(p.opacity)}
      className="w-full max-w-xl"
    >
      <Sheet />
    </Watermark>
  ),
  toCode: (p) =>
    `<Watermark content="${p.content}" rotate={${p.rotate}} fontSize={${p.fontSize}} opacity={${p.opacity}}>\n  <YourContent />\n</Watermark>`,
};
