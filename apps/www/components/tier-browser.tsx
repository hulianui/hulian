"use client";
import { useState } from "react";
import Link from "next/link";
import { Segmented, Tag, Text } from "@hulianui/ui";
import {
  ArrowRight,
  LayoutGrid,
  Type,
  TextCursorInput,
  BarChart3,
  Compass,
  Megaphone,
  Bot,
  Sparkles,
  Smartphone,
  AppWindow,
  type LucideIcon,
} from "lucide-react";
import { CATEGORIES, manifest, type CategoryKey } from "../lib/manifest";
import { blocks } from "../app/blocks/_meta";
import { pages } from "../app/pages/_meta";
import { demos } from "../app/demos/lib/demos";

const CATEGORY_ICON: Record<CategoryKey, LucideIcon> = {
  layout: LayoutGrid,
  typography: Type,
  forms: TextCursorInput,
  "data-display": BarChart3,
  navigation: Compass,
  feedback: Megaphone,
  ai: Bot,
  decoration: Sparkles,
  mockups: AppWindow,
  mobile: Smartphone,
};

interface Row {
  key: string;
  /** 仅「组件」档每行图标各异(有语义)才给；区块/页面/示例图标全一样,省略不显示。 */
  icon?: LucideIcon;
  label: string;
  blurb: string;
  trailing?: string;
  href: string;
}

const TIERS = [
  { value: "components", label: "组件" },
  { value: "blocks", label: "区块" },
  { value: "pages", label: "页面" },
  { value: "demos", label: "模版" },
];

// 各档的发丝线行数据。组件按分类聚合(数量多),区块/页面/示例按条目列出(数量少)。
function rowsFor(tier: string): Row[] {
  if (tier === "blocks") {
    return blocks.map((b) => ({
      key: b.slug,
      label: b.name,
      blurb: b.description,
      trailing: b.tags[0],
      href: `/blocks/${b.slug}`,
    }));
  }
  if (tier === "pages") {
    return pages.map((p) => ({
      key: p.slug,
      label: p.name,
      blurb: p.description,
      trailing: p.tags[0],
      href: `/pages/${p.slug}`,
    }));
  }
  if (tier === "demos") {
    return demos.map((d) => ({
      key: d.slug,
      label: d.title,
      blurb: d.description,
      trailing: d.category,
      href: d.href,
    }));
  }
  // components：按分类聚合
  return CATEGORIES.map((cat) => ({
    key: cat.key,
    icon: CATEGORY_ICON[cat.key],
    label: cat.label,
    blurb: cat.groups.map((g) => g.label).join(" · "),
    trailing: String(manifest.filter((m) => m.category === cat.key).length),
    href: `/components#${cat.key}`,
  }));
}

// 首页浏览区 —— 按「组件 / 区块 / 页面 / 示例」四档切换的发丝线列表(dogfood Segmented)。
export function TierBrowser() {
  const [tier, setTier] = useState("components");
  const rows = rowsFor(tier);

  return (
    <div>
      <Segmented
        aria-label="浏览分类"
        items={TIERS}
        value={tier}
        onValueChange={setTier}
        className="mb-2"
      />
      <nav className="border-t border-border" aria-label="浏览列表">
        {rows.map(({ key, icon: Icon, label, blurb, trailing, href }) => (
          <Link
            key={key}
            href={href}
            className="group flex items-center gap-4 border-b border-border py-4 transition-colors hover:bg-surface-hover"
          >
            {Icon && (
              <Icon
                className="size-5 shrink-0 text-muted transition-colors group-hover:text-primary"
                aria-hidden
              />
            )}
            <Text as="span" weight="medium" className="shrink-0 whitespace-nowrap">
              {label}
            </Text>
            <Text
              as="span"
              size="sm"
              tone="muted"
              truncate
              className="hidden min-w-0 flex-1 sm:block"
            >
              {blurb}
            </Text>
            {trailing &&
              (tier === "components" ? (
                // 组件档尾列是数量计数 —— 纯数字,保持等宽弱化文本
                <Text as="span" size="sm" tone="muted" className="ml-auto shrink-0 tabular-nums">
                  {trailing}
                </Text>
              ) : (
                // 区块/页面/示例档尾列是分类标签 —— Tag 化
                <Tag variant="soft" tone="neutral" size="sm" className="ml-auto shrink-0">
                  {trailing}
                </Tag>
              ))}
            <ArrowRight
              className="size-4 shrink-0 text-muted/50 transition-all group-hover:translate-x-0.5 group-hover:text-foreground"
              aria-hidden
            />
          </Link>
        ))}
      </nav>
    </div>
  );
}
