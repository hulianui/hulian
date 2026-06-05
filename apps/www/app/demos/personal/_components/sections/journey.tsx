"use client";

import { Timeline, type TimelineItemProps } from "@hulian/ui";
import { Section } from "./section";
import { journey } from "../../_data/profile";

// journey.tone（primary | success | default）即合法 TimelineDotColor，零映射直传。
const items: TimelineItemProps[] = journey.map((j) => ({
  color: j.tone,
  children: (
    <div className="flex flex-col gap-1 pb-2">
      <span className="font-mono text-xs font-semibold tracking-wider text-primary">{j.year}</span>
      <span className="text-base font-semibold text-foreground">{j.title}</span>
      <span className="text-sm leading-relaxed text-muted">{j.desc}</span>
    </div>
  ),
}));

export function Journey() {
  return (
    <Section
      id="journey"
      eyebrow="时间线"
      title="从写下第一行代码到全职独立"
      description="不是一条规划好的路，而是一连串「想自己用」的念头串起来的轨迹。"
      width="4xl"
      className="bg-surface/30"
    >
      <div className="max-w-2xl">
        <Timeline items={items} pending="还有更多正在路上 …" />
      </div>
    </Section>
  );
}
