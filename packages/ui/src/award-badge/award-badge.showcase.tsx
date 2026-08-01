"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { AwardBadge } from "./award-badge";

function TrophyMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-7" aria-hidden>
      <path d="M6 4h12v5a6 6 0 0 1-12 0V4Z" strokeLinejoin="round" />
      <path d="M6 6H3v1a4 4 0 0 0 3.5 3.97M18 6h3v1a4 4 0 0 1-3.5 3.97" strokeLinecap="round" />
      <path d="M12 15v3m-3.5 3h7l-.7-2.2a1.2 1.2 0 0 0-1.14-.8h-2.32a1.2 1.2 0 0 0-1.15.8L8.5 21Z" strokeLinejoin="round" />
    </svg>
  );
}

export const awardBadgeShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "桂冠圈名次 + 前缀小字 + 粗体主标题，贴 README 顶部 / 官网首页的荣誉牌。",
      code: `<AwardBadge
  rank={1}
  kicker="GitHub Trending"
  title="#1 Repository Of The Day"
  href="https://github.com/trending"
/>`,
      render: () => (
        <AwardBadge rank={1} kicker="GitHub Trending" title="#1 Repository Of The Day" href="#trending" />
      ),
    },
    {
      title: "皮肤",
      description: "outline 描边（默认）/ solid 实底 / soft 柔和，按落地背景选。",
      code: `<>
  <AwardBadge rank={1} kicker="Product Hunt" title="#1 Product of the Day" />
  <AwardBadge rank={1} kicker="Product Hunt" title="#1 Product of the Day" variant="solid" />
  <AwardBadge rank={1} kicker="Product Hunt" title="#1 Product of the Day" variant="soft" />
</>`,
      render: () => (
        <div className="flex flex-col items-start gap-3">
          <AwardBadge rank={1} kicker="Product Hunt" title="#1 Product of the Day" />
          <AwardBadge rank={1} kicker="Product Hunt" title="#1 Product of the Day" variant="solid" />
          <AwardBadge rank={1} kicker="Product Hunt" title="#1 Product of the Day" variant="soft" />
        </div>
      ),
    },
    {
      title: "语气 · 尺寸",
      description: "5 语气 + color 逃生舱（任意 CSS 色 / chart-1..6）；sm/md/lg 三档。",
      code: `<>
  <AwardBadge size="sm" rank={2} kicker="周榜" title="年度增长最快开源项目" tone="success" />
  <AwardBadge rank="A+" kicker="安全评级" title="Supply Chain Security" tone="neutral" />
  <AwardBadge size="lg" rank={1} kicker="掘金" title="年度最受欢迎组件库" color="chart-5" />
</>`,
      render: () => (
        <div className="flex flex-col items-start gap-3">
          <AwardBadge size="sm" rank={2} kicker="周榜" title="年度增长最快开源项目" tone="success" />
          <AwardBadge rank="A+" kicker="安全评级" title="Supply Chain Security" tone="neutral" />
          <AwardBadge size="lg" rank={1} kicker="掘金" title="年度最受欢迎组件库" color="chart-5" />
        </div>
      ),
    },
    {
      title: "自定义徽记 · 无桂冠",
      description: "emblem 槽替换整枚徽记（奖杯 / 平台 logo）；wreath={false} 只留名次。",
      code: `<>
  <AwardBadge emblem={<TrophyMark />} kicker="2026 年度" title="最佳开发者工具" tone="warning" />
  <AwardBadge wreath={false} rank="03" kicker="Awwwards" title="Site of the Day" variant="soft" />
</>`,
      render: () => (
        <div className="flex flex-col items-start gap-3">
          <AwardBadge emblem={<TrophyMark />} kicker="2026 年度" title="最佳开发者工具" tone="warning" />
          <AwardBadge wreath={false} rank="03" kicker="Awwwards" title="Site of the Day" variant="soft" />
        </div>
      ),
    },
  ],
  controls: [
    { prop: "variant", type: "select", options: ["outline", "solid", "soft"], defaultValue: "outline" },
    {
      prop: "tone",
      type: "select",
      options: ["brand", "neutral", "success", "warning", "danger"],
      defaultValue: "brand",
    },
    { prop: "size", type: "select", options: ["md", "sm", "lg"], defaultValue: "md" },
    { prop: "wreath", type: "boolean", defaultValue: true },
    { prop: "kicker", type: "text", defaultValue: "GitHub Trending" },
    { prop: "title", type: "text", defaultValue: "#1 Repository Of The Day" },
  ],
  states: [
    {
      name: "默认（GitHub Trending 奖章）",
      render: () => <AwardBadge rank={1} kicker="GitHub Trending" title="#1 Repository Of The Day" />,
    },
    {
      name: "三皮肤",
      render: () => (
        <div className="flex flex-col items-start gap-3">
          <AwardBadge rank={1} kicker="Product Hunt" title="#1 Product of the Day" />
          <AwardBadge rank={1} kicker="Product Hunt" title="#1 Product of the Day" variant="solid" />
          <AwardBadge rank={1} kicker="Product Hunt" title="#1 Product of the Day" variant="soft" />
        </div>
      ),
    },
    {
      name: "语气 · 尺寸",
      render: () => (
        <div className="flex flex-col items-start gap-3">
          <AwardBadge size="sm" rank={2} kicker="周榜" title="年度增长最快开源项目" tone="success" />
          <AwardBadge rank="A+" kicker="安全评级" title="Supply Chain Security" tone="neutral" />
          <AwardBadge size="lg" rank={1} kicker="掘金" title="年度最受欢迎组件库" color="chart-5" />
        </div>
      ),
    },
    {
      name: "自定义徽记 · 无桂冠 · 可点击",
      render: () => (
        <div className="flex flex-col items-start gap-3">
          <AwardBadge emblem={<TrophyMark />} kicker="2026 年度" title="最佳开发者工具" tone="warning" />
          <AwardBadge wreath={false} rank="03" kicker="Awwwards" title="Site of the Day" variant="soft" />
          <AwardBadge rank={1} kicker="GitHub Trending" title="#1 Repository Of The Day" href="#trending" />
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <AwardBadge
      rank={1}
      kicker={(p.kicker as string) ?? "GitHub Trending"}
      title={(p.title as string) ?? "#1 Repository Of The Day"}
      variant={(p.variant as "outline" | "solid" | "soft") ?? "outline"}
      tone={(p.tone as "brand" | "neutral" | "success" | "warning" | "danger") ?? "brand"}
      size={(p.size as "sm" | "md" | "lg") ?? "md"}
      wreath={p.wreath !== false}
    />
  ),
  toCode: (p) =>
    `<AwardBadge\n  rank={1}\n  kicker="${p.kicker ?? "GitHub Trending"}"\n  title="${
      p.title ?? "#1 Repository Of The Day"
    }"${p.variant && p.variant !== "outline" ? `\n  variant="${p.variant}"` : ""}${
      p.tone && p.tone !== "brand" ? `\n  tone="${p.tone}"` : ""
    }${p.size && p.size !== "md" ? `\n  size="${p.size}"` : ""}${
      p.wreath === false ? "\n  wreath={false}" : ""
    }\n/>`,
};
