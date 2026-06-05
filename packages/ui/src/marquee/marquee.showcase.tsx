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
    <span className="flex size-12 items-center justify-center rounded-2xl border border-border bg-surface text-muted shadow-sm">
      {children}
    </span>
  );
}

const items = ["React", "Vue", "Svelte", "Solid", "Angular", "Qwik"];
const logos = [Code2, Folder, File, Gauge, Search, Calendar, Wrench, Link];

export const marqueeShowcase: ShowcaseSpec = {
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
