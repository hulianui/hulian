"use client";
import type { ReactNode } from "react";
import { Code2, Folder, File, Gauge, Search, Calendar, Wrench, Link } from "../_icons";
import type { ShowcaseSpec } from "../showcase/types";
import { Marquee } from "./marquee";

// chip：只消费已确认的语义 token（border-border / bg-surface / text-foreground），不依赖 Badge API。
function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="whitespace-nowrap rounded-full border border-border bg-surface px-3 py-1 text-sm text-foreground">
      {children}
    </span>
  );
}

// logo 墙圆形图标位：中性容器 + 语义色图标，配合 fade 渐隐成「图标墙」观感。
function LogoTile({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-12 items-center justify-center rounded-2xl border border-border bg-surface text-muted-foreground shadow-sm">
      {children}
    </span>
  );
}

const items = ["React", "Vue", "Svelte", "Solid", "Angular", "Qwik"];
const logos = [Code2, Folder, File, Gauge, Search, Calendar, Wrench, Link];

export const marqueeShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "子项无缝循环向左滚动，pauseOnHover 悬停时暂停。",
      code: `<Marquee pauseOnHover>
  {items.map((c) => (
    <Chip key={c}>{c}</Chip>
  ))}
</Marquee>`,
      render: () => (
        <Marquee className="w-80" pauseOnHover>
          {items.map((c) => (
            <Chip key={c}>{c}</Chip>
          ))}
        </Marquee>
      ),
    },
    {
      title: "图标墙（fade 渐隐）",
      description: "fade 在两端加 mask 渐隐，配 icon 子项做 logo / 图标墙观感。",
      code: `<Marquee fade pauseOnHover gap="1.25rem">
  {logos.map((Icon, i) => (
    <LogoTile key={i}>
      <Icon className="size-6" />
    </LogoTile>
  ))}
</Marquee>`,
      render: () => (
        <Marquee className="w-80" fade pauseOnHover gap="1.25rem">
          {logos.map((Icon, i) => (
            <LogoTile key={i}>
              <Icon className="size-6" />
            </LogoTile>
          ))}
        </Marquee>
      ),
    },
    {
      title: "方向与速度",
      description: "direction 控制方向，duration 越大越慢。",
      code: `<Marquee direction="right" duration={30} fade>
  {items.map((c) => (
    <Chip key={c}>{c}</Chip>
  ))}
</Marquee>`,
      render: () => (
        <Marquee className="w-80" direction="right" duration={30} fade>
          {items.map((c) => (
            <Chip key={c}>{c}</Chip>
          ))}
        </Marquee>
      ),
    },
    {
      title: "竖向滚动（vertical）",
      description: "vertical 沿 Y 轴滚动，需给容器固定高度。",
      code: `<Marquee className="h-56" vertical fade pauseOnHover>
  {items.map((c) => (
    <Chip key={c}>{c}</Chip>
  ))}
</Marquee>`,
      render: () => (
        <Marquee className="h-56" vertical fade pauseOnHover>
          {items.map((c) => (
            <Chip key={c}>{c}</Chip>
          ))}
        </Marquee>
      ),
    },
  ],
  controls: [
    { prop: "direction", type: "select", options: ["left", "right"], defaultValue: "left" },
    { prop: "duration", type: "number", defaultValue: 20 },
    { prop: "pauseOnHover", type: "boolean", defaultValue: true },
    { prop: "fade", type: "boolean", defaultValue: true },
  ],
  states: [
    {
      name: "default（向左 · hover 暂停）",
      render: () => (
        <Marquee className="w-80" pauseOnHover>
          {items.map((c) => (
            <Chip key={c}>{c}</Chip>
          ))}
        </Marquee>
      ),
    },
    {
      name: "图标墙（fade 渐隐 · icon 子项）",
      render: () => (
        <Marquee className="w-80" fade pauseOnHover gap="1.25rem">
          {logos.map((Icon, i) => (
            <LogoTile key={i}>
              <Icon className="size-6" />
            </LogoTile>
          ))}
        </Marquee>
      ),
    },
    {
      name: "向右 · 慢速 · fade",
      render: () => (
        <Marquee className="w-80" direction="right" duration={30} fade>
          {items.map((c) => (
            <Chip key={c}>{c}</Chip>
          ))}
        </Marquee>
      ),
    },
    {
      name: "竖向（vertical · fade）",
      render: () => (
        <Marquee className="h-56" vertical fade pauseOnHover>
          {items.map((c) => (
            <Chip key={c}>{c}</Chip>
          ))}
        </Marquee>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Marquee
      className="w-80"
      direction={p.direction as "left" | "right"}
      duration={p.duration as number}
      pauseOnHover={p.pauseOnHover as boolean}
      fade={p.fade as boolean}
    >
      {items.map((c) => (
        <Chip key={c}>{c}</Chip>
      ))}
    </Marquee>
  ),
  toCode: (p) =>
    `<Marquee direction="${p.direction}" duration={${p.duration}} pauseOnHover={${p.pauseOnHover}} fade={${p.fade}}>\n  {items}\n</Marquee>`,
};
