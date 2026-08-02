"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { AwardBadge } from "../../../../packages/ui/src/award-badge/award-badge";
function TrophyMark() {
    return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-7" aria-hidden>
      <path d="M6 4h12v5a6 6 0 0 1-12 0V4Z" strokeLinejoin="round"/>
      <path d="M6 6H3v1a4 4 0 0 0 3.5 3.97M18 6h3v1a4 4 0 0 1-3.5 3.97" strokeLinecap="round"/>
      <path d="M12 15v3m-3.5 3h7l-.7-2.2a1.2 1.2 0 0 0-1.14-.8h-2.32a1.2 1.2 0 0 0-1.15.8L8.5 21Z" strokeLinejoin="round"/>
    </svg>);
}
export const awardBadgeShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Laurel circle ranking + small prefix + bold main title, affixed to README honor plate at the top / official website homepage.",
            code: `<AwardBadge
  rank={1}
  kicker="GitHub Trending"
  title="#1 Repository Of The Day"
  href="https://github.com/trending"
/>`,
            render: () => (<AwardBadge rank={1} kicker="GitHub Trending" title="#1 Repository Of The Day" href="https://example.com/#trending"/>),
        },
        {
            title: "Skin",
            description: "outline Stroke (default) / solid Solid / soft Soft, select according to floor background.",
            code: `<>
  <AwardBadge rank={1} kicker="Product Hunt" title="#1 Product of the Day" />
  <AwardBadge rank={1} kicker="Product Hunt" title="#1 Product of the Day" variant="solid" />
  <AwardBadge rank={1} kicker="Product Hunt" title="#1 Product of the Day" variant="soft" />
</>`,
            render: () => (<div className="flex flex-col items-start gap-3">
          <AwardBadge rank={1} kicker="Product Hunt" title="#1 Product of the Day"/>
          <AwardBadge rank={1} kicker="Product Hunt" title="#1 Product of the Day" variant="solid"/>
          <AwardBadge rank={1} kicker="Product Hunt" title="#1 Product of the Day" variant="soft"/>
        </div>),
        },
        {
            title: "Tone \u00B7 Size",
            description: "5 tone + color escape cabin (any CSS color / chart-1..6); sm/md/lg third gear.",
            code: `<>
  <AwardBadge size="sm" rank={2} kicker="Weekly List" title="The Fastest Growing Open Source Project of the Year" tone="success" />
  <AwardBadge rank="A+" kicker="Safety Rating" title="Supply Chain Security" tone="neutral" />
  <AwardBadge size="lg" rank={1} kicker="Nuggets" title="The most popular component library of the year" color="chart-5" />
</>`,
            render: () => (<div className="flex flex-col items-start gap-3">
          <AwardBadge size="sm" rank={2} kicker="Weekly List" title="The fastest growing open source project of the year" tone="success"/>
          <AwardBadge rank="A+" kicker="Safety Rating" title="Supply Chain Security" tone="neutral"/>
          <AwardBadge size="lg" rank={1} kicker="Nuggets" title="The most popular component library of the year" color="chart-5"/>
        </div>),
        },
        {
            title: "Custom Emblem \u00B7 No Laurel",
            description: "emblem slot replaces the entire emblem (trophy/platform logo); wreath={false} only retains the ranking.",
            code: `<>
  <AwardBadge emblem={<TrophyMark />} kicker="2026" title="Best Developer Tools" tone="warning" />
  <AwardBadge wreath={false} rank="03" kicker="Awwwards" title="Site of the Day" variant="soft" />
</>`,
            render: () => (<div className="flex flex-col items-start gap-3">
          <AwardBadge emblem={<TrophyMark />} kicker="2026" title="Best Developer Tools" tone="warning"/>
          <AwardBadge wreath={false} rank="03" kicker="Awwwards" title="Site of the Day" variant="soft"/>
        </div>),
        },
    ],
    controls: [
        {
            prop: "variant",
            type: "select",
            options: ["outline", "solid", "soft"],
            defaultValue: "outline",
        },
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
            name: "Default (GitHub Trending Medal)",
            render: () => (<AwardBadge rank={1} kicker="GitHub Trending" title="#1 Repository Of The Day"/>),
        },
        {
            name: "Three skins",
            render: () => (<div className="flex flex-col items-start gap-3">
          <AwardBadge rank={1} kicker="Product Hunt" title="#1 Product of the Day"/>
          <AwardBadge rank={1} kicker="Product Hunt" title="#1 Product of the Day" variant="solid"/>
          <AwardBadge rank={1} kicker="Product Hunt" title="#1 Product of the Day" variant="soft"/>
        </div>),
        },
        {
            name: "Tone \u00B7 Size",
            render: () => (<div className="flex flex-col items-start gap-3">
          <AwardBadge size="sm" rank={2} kicker="Weekly List" title="The fastest growing open source project of the year" tone="success"/>
          <AwardBadge rank="A+" kicker="Safety Rating" title="Supply Chain Security" tone="neutral"/>
          <AwardBadge size="lg" rank={1} kicker="Nuggets" title="The most popular component library of the year" color="chart-5"/>
        </div>),
        },
        {
            name: "Custom emblem \u00B7 No laurel \u00B7 Clickable",
            render: () => (<div className="flex flex-col items-start gap-3">
          <AwardBadge emblem={<TrophyMark />} kicker="2026" title="Best Developer Tools" tone="warning"/>
          <AwardBadge wreath={false} rank="03" kicker="Awwwards" title="Site of the Day" variant="soft"/>
          <AwardBadge rank={1} kicker="GitHub Trending" title="#1 Repository Of The Day" href="https://example.com/#trending"/>
        </div>),
        },
    ],
    renderWithProps: (p) => (<AwardBadge rank={1} kicker={(p.kicker as string) ?? "GitHub Trending"} title={(p.title as string) ?? "#1 Repository Of The Day"} variant={(p.variant as "outline" | "solid" | "soft") ?? "outline"} tone={(p.tone as "brand" | "neutral" | "success" | "warning" | "danger") ?? "brand"} size={(p.size as "sm" | "md" | "lg") ?? "md"} wreath={p.wreath !== false}/>),
    toCode: (p) => `<AwardBadge
  rank={1}
  kicker="${p.kicker ?? "GitHub Trending"}"
  title="${p.title ?? "#1 Repository Of The Day"}"${p.variant && p.variant !== "outline" ? `
  variant="${p.variant}"` : ""}${p.tone && p.tone !== "brand" ? `
  tone="${p.tone}"` : ""}${p.size && p.size !== "md" ? `
  size="${p.size}"` : ""}${p.wreath === false ? "\n  wreath={false}" : ""}
/>`,
};
