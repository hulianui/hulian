"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { FitScreen } from "./fit-screen";

// 演示用「设计稿」：固定 1920×1080 的一块内容，被 FitScreen 等比缩放进小视口框里。
function DesignBoard({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[var(--color-surface-hover)] text-center">
      <div className="text-[120px] font-bold leading-none text-[var(--color-primary)]">1920×1080</div>
      <div className="text-[40px] text-muted">{label}</div>
    </div>
  );
}

function Viewport({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-56 w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-[var(--color-surface)]">
      {children}
    </div>
  );
}

export const fitScreenShowcase: ShowcaseSpec = {
  controls: [{ prop: "mode", type: "select", options: ["fit", "cover", "stretch"], defaultValue: "fit" }],
  states: [
    {
      name: "fit(等比不裁切)",
      render: () => (
        <Viewport>
          <FitScreen mode="fit">
            <DesignBoard label="mode = fit" />
          </FitScreen>
        </Viewport>
      ),
    },
    {
      name: "cover(铺满可裁切)",
      render: () => (
        <Viewport>
          <FitScreen mode="cover">
            <DesignBoard label="mode = cover" />
          </FitScreen>
        </Viewport>
      ),
    },
    {
      name: "stretch(非等比拉满)",
      render: () => (
        <Viewport>
          <FitScreen mode="stretch">
            <DesignBoard label="mode = stretch" />
          </FitScreen>
        </Viewport>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Viewport>
      <FitScreen mode={(p.mode as "fit" | "cover" | "stretch") ?? "fit"}>
        <DesignBoard label={`mode = ${p.mode ?? "fit"}`} />
      </FitScreen>
    </Viewport>
  ),
  toCode: (p) =>
    `<FitScreen designWidth={1920} designHeight={1080} mode="${p.mode ?? "fit"}">\n  {/* 你的 1920×1080 大屏内容 */}\n</FitScreen>`,
};
