"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Reveal, Stagger, StaggerItem } from "./reveal";

// 演示用色块（无业务含义，仅看进场编排）
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-5 py-4 text-foreground">{children}</div>
  );
}

export const revealShowcase: ShowcaseSpec = {
  controls: [
    { prop: "y", type: "number", defaultValue: 24, label: "起始下移 px" },
    { prop: "blur", type: "number", defaultValue: 8, label: "起始模糊 px" },
    { prop: "scale", type: "number", defaultValue: 1, label: "起始缩放" },
    {
      prop: "trigger",
      type: "select",
      options: ["mount", "in-view"],
      defaultValue: "mount",
      label: "触发时机",
    },
  ],
  states: [
    {
      name: "Reveal（单块·挂载浮起 + 焦点拉入）",
      render: () => (
        <Reveal trigger="mount">
          <Card>一块内容自下浮起、由糊到清。</Card>
        </Reveal>
      ),
    },
    {
      name: "Stagger（逐级编排·挂载触发）",
      render: () => (
        <Stagger trigger="mount" gap={0.1}>
          <div className="flex flex-col gap-3">
            <StaggerItem>
              <Card>第一行</Card>
            </StaggerItem>
            <StaggerItem>
              <Card>第二行</Card>
            </StaggerItem>
            <StaggerItem>
              <Card>第三行</Card>
            </StaggerItem>
            <StaggerItem y={22} scale={0.94} blur={12}>
              <Card>压轴项：更重的 blur + scale，像「放上书架」</Card>
            </StaggerItem>
          </div>
        </Stagger>
      ),
    },
    {
      name: "Reveal（滚动进入视口触发）",
      render: () => (
        <div className="max-h-72 w-full max-w-md overflow-auto rounded-xl border border-border bg-bg p-4">
          <div className="h-64" />
          <Reveal>
            <Card>滚动到此处时浮现（一次性）。</Card>
          </Reveal>
          <div className="h-40" />
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Reveal
      trigger={p.trigger as "mount" | "in-view"}
      y={p.y as number}
      blur={p.blur as number}
      scale={p.scale as number}
    >
      <Card>一块内容按所选参数浮起、由糊到清。</Card>
    </Reveal>
  ),
  toCode: (p) =>
    `<Reveal trigger="${p.trigger}" y={${p.y}} blur={${p.blur}} scale={${p.scale}}>\n  <div className="card">浮起的内容</div>\n</Reveal>`,
};
