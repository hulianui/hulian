"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { GithubMark } from "../_icons";
import { ShieldBadge, ShieldBadgeGroup, compactCount } from "./shield-badge";

// GitHub mark 现在是库内的品牌图标（_icons 的品牌组，IssueReporter 运行时也在用），直接引；
// npm mark 只在这个示例里出现，仍留在 showcase 内联 —— 品牌图标进库的门槛是「组件运行时需要
// 它来标识目的地」，纯演示用的不搬（#119）。
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
      description:
        "solid 贴纸感（默认）/ soft 柔和（嵌进正文不抢戏）/ outline 描边；shape 换圆角。",
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
  <ShieldBadge value="sponsor" color="chart-5" href="#" />
  <ShieldBadge label="node" value=">=22" size="sm" tone="neutral" />
</>`,
      render: () => (
        <ShieldBadgeGroup gap="md">
          <ShieldBadge
            label="stars"
            value={compactCount(1500)}
            icon={<GithubMark />}
            href="#"
          />
          <ShieldBadge value="sponsor" color="chart-5" href="#" />
          <ShieldBadge label="node" value=">=22" size="sm" tone="neutral" />
        </ShieldBadgeGroup>
      ),
    },
  ],
  controls: [
    {
      prop: "variant",
      type: "select",
      options: ["solid", "soft", "outline"],
      defaultValue: "solid",
    },
    {
      prop: "tone",
      type: "select",
      options: ["neutral", "brand", "success", "warning", "danger"],
      defaultValue: "brand",
    },
    {
      prop: "shape",
      type: "select",
      options: ["rounded", "square", "pill"],
      defaultValue: "rounded",
    },
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
          <ShieldBadge
            label="stars"
            value={compactCount(1500)}
            icon={<GithubMark />}
            href="#"
          />
          <ShieldBadge value="sponsor" color="chart-5" href="#" />
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
