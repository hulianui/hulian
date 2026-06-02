"use client";
import type { ReactNode } from "react";
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

const items = ["React", "Vue", "Svelte", "Solid", "Angular", "Qwik"];

export const marqueeShowcase: ShowcaseSpec = {
  controls: [
    { prop: "direction", type: "select", options: ["left", "right"], defaultValue: "left" },
    { prop: "duration", type: "number", defaultValue: 20 },
    { prop: "pauseOnHover", type: "boolean", defaultValue: true },
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
      name: "向右 · 慢速",
      render: () => (
        <Marquee className="w-80" direction="right" duration={30}>
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
    >
      {items.map((c) => (
        <Chip key={c}>{c}</Chip>
      ))}
    </Marquee>
  ),
  toCode: (p) =>
    `<Marquee direction="${p.direction}" duration={${p.duration}} pauseOnHover={${p.pauseOnHover}}>\n  {items}\n</Marquee>`,
};
