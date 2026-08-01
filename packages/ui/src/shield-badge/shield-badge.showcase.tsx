"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { ShieldBadge, ShieldBadgeGroup, compactCount } from "./shield-badge";

// 品牌 logo 不进库（lucide v1 起已移除品牌图标，且品牌 mark 属调用方资产），
// 这里在 showcase 内联两枚 mark 演示 icon 槽的用法。
function GithubMark() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function NpmMark() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M0 2v12h16V2H0Zm13 10h-2V5H8v7H3V4h10v8Z" />
    </svg>
  );
}

const readmeRow = (
  <ShieldBadgeGroup>
    <ShieldBadge label="@hulianui/ui" value="v0.17.0" icon={<NpmMark />} />
    <ShieldBadge label="downloads" value={`${compactCount(1500)}/month`} />
    <ShieldBadge label="license" value="MIT" />
    <ShieldBadge label="CI" value="failing" tone="danger" icon={<GithubMark />} />
    <ShieldBadge label="stars" value={compactCount(4)} />
  </ShieldBadgeGroup>
);

export const shieldBadgeShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "README 徽章行",
      description: "ShieldBadgeGroup 排一行项目元信息，窄屏自动换行；icon 槽放品牌 mark。",
      code: `<ShieldBadgeGroup>
  <ShieldBadge label="@hulianui/ui" value="v0.17.0" icon={<NpmMark />} />
  <ShieldBadge label="downloads" value={\`\${compactCount(1500)}/month\`} />
  <ShieldBadge label="license" value="MIT" />
  <ShieldBadge label="CI" value="failing" tone="danger" icon={<GithubMark />} />
  <ShieldBadge label="stars" value={compactCount(4)} />
</ShieldBadgeGroup>`,
      render: () => readmeRow,
    },
    {
      title: "语气",
      description: "右段 5 语气覆盖状态光谱；color 逃生舱接任意 CSS 色 / chart-1..6。",
      code: `<>
  <ShieldBadge label="license" value="MIT" tone="neutral" />
  <ShieldBadge label="version" value="v0.17.0" tone="brand" />
  <ShieldBadge label="build" value="passing" tone="success" />
  <ShieldBadge label="coverage" value="72%" tone="warning" />
  <ShieldBadge label="CI" value="failing" tone="danger" />
  <ShieldBadge label="chat" value="discord" color="chart-4" />
</>`,
      render: () => (
        <ShieldBadgeGroup>
          <ShieldBadge label="license" value="MIT" tone="neutral" />
          <ShieldBadge label="version" value="v0.17.0" tone="brand" />
          <ShieldBadge label="build" value="passing" tone="success" />
          <ShieldBadge label="coverage" value="72%" tone="warning" />
          <ShieldBadge label="CI" value="failing" tone="danger" />
          <ShieldBadge label="chat" value="discord" color="chart-4" />
        </ShieldBadgeGroup>
      ),
    },
    {
      title: "皮肤 · 外形",
      description: "solid 贴纸感（默认）/ soft 柔和（嵌进正文不抢戏）/ outline 描边；shape 换圆角。",
      code: `<>
  <ShieldBadge label="build" value="passing" tone="success" variant="soft" />
  <ShieldBadge label="build" value="passing" tone="success" variant="outline" />
  <ShieldBadge label="build" value="passing" tone="success" shape="pill" />
  <ShieldBadge label="build" value="passing" tone="success" shape="square" />
</>`,
      render: () => (
        <div className="flex flex-col gap-3">
          <ShieldBadgeGroup>
            <ShieldBadge label="build" value="passing" tone="success" />
            <ShieldBadge label="build" value="passing" tone="success" variant="soft" />
            <ShieldBadge label="build" value="passing" tone="success" variant="outline" />
          </ShieldBadgeGroup>
          <ShieldBadgeGroup>
            <ShieldBadge label="build" value="passing" tone="success" shape="rounded" />
            <ShieldBadge label="build" value="passing" tone="success" shape="pill" />
            <ShieldBadge label="build" value="passing" tone="success" shape="square" />
          </ShieldBadgeGroup>
        </div>
      ),
    },
    {
      title: "可点击 · 单段 · 小尺寸",
      description: "href 让整枚成链接（带按压/焦点环）；省略 label 退化为单段贴纸。",
      code: `<>
  <ShieldBadge label="stars" value="1.5k" icon={<GithubMark />} href="https://github.com/hulianui/hulian" target="_blank" />
  <ShieldBadge value="sponsor" color="chart-5" href="#sponsor" />
  <ShieldBadge label="node" value=">=22" size="sm" tone="neutral" />
</>`,
      render: () => (
        <ShieldBadgeGroup gap="md">
          <ShieldBadge label="stars" value={compactCount(1500)} icon={<GithubMark />} href="#stars" />
          <ShieldBadge value="sponsor" color="chart-5" href="#sponsor" />
          <ShieldBadge label="node" value=">=22" size="sm" tone="neutral" />
        </ShieldBadgeGroup>
      ),
    },
  ],
  controls: [
    { prop: "variant", type: "select", options: ["solid", "soft", "outline"], defaultValue: "solid" },
    {
      prop: "tone",
      type: "select",
      options: ["neutral", "brand", "success", "warning", "danger"],
      defaultValue: "brand",
    },
    { prop: "shape", type: "select", options: ["rounded", "square", "pill"], defaultValue: "rounded" },
    { prop: "size", type: "select", options: ["md", "sm"], defaultValue: "md" },
    { prop: "label", type: "text", defaultValue: "license" },
    { prop: "value", type: "text", defaultValue: "MIT" },
  ],
  states: [
    { name: "README 徽章行", render: () => readmeRow },
    {
      name: "五语气 + 自定义色",
      render: () => (
        <ShieldBadgeGroup>
          <ShieldBadge label="license" value="MIT" tone="neutral" />
          <ShieldBadge label="version" value="v0.17.0" tone="brand" />
          <ShieldBadge label="build" value="passing" tone="success" />
          <ShieldBadge label="coverage" value="72%" tone="warning" />
          <ShieldBadge label="CI" value="failing" tone="danger" />
          <ShieldBadge label="chat" value="discord" color="chart-4" />
        </ShieldBadgeGroup>
      ),
    },
    {
      name: "三皮肤 × 三外形",
      render: () => (
        <div className="flex flex-col gap-3">
          <ShieldBadgeGroup>
            <ShieldBadge label="build" value="passing" tone="success" />
            <ShieldBadge label="build" value="passing" tone="success" variant="soft" />
            <ShieldBadge label="build" value="passing" tone="success" variant="outline" />
          </ShieldBadgeGroup>
          <ShieldBadgeGroup>
            <ShieldBadge label="build" value="passing" tone="success" shape="rounded" />
            <ShieldBadge label="build" value="passing" tone="success" shape="pill" />
            <ShieldBadge label="build" value="passing" tone="success" shape="square" />
          </ShieldBadgeGroup>
        </div>
      ),
    },
    {
      name: "可点击 · 单段 · 小尺寸",
      render: () => (
        <ShieldBadgeGroup gap="md">
          <ShieldBadge label="stars" value={compactCount(1500)} icon={<GithubMark />} href="#stars" />
          <ShieldBadge value="sponsor" color="chart-5" href="#sponsor" />
          <ShieldBadge label="node" value=">=22" size="sm" tone="neutral" />
        </ShieldBadgeGroup>
      ),
    },
  ],
  renderWithProps: (p) => (
    <ShieldBadge
      label={(p.label as string) ?? "license"}
      value={(p.value as string) ?? "MIT"}
      variant={(p.variant as "solid" | "soft" | "outline") ?? "solid"}
      tone={(p.tone as "neutral" | "brand" | "success" | "warning" | "danger") ?? "brand"}
      shape={(p.shape as "rounded" | "square" | "pill") ?? "rounded"}
      size={(p.size as "md" | "sm") ?? "md"}
    />
  ),
  toCode: (p) =>
    `<ShieldBadge\n  label="${p.label ?? "license"}"\n  value="${p.value ?? "MIT"}"${
      p.tone && p.tone !== "brand" ? `\n  tone="${p.tone}"` : ""
    }${p.variant && p.variant !== "solid" ? `\n  variant="${p.variant}"` : ""}${
      p.shape && p.shape !== "rounded" ? `\n  shape="${p.shape}"` : ""
    }${p.size === "sm" ? '\n  size="sm"' : ""}\n/>`,
};
