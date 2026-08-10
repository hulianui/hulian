"use client";
import { copy } from "./journey.content";

import { Timeline, type TimelineItemProps } from "@hulianui/ui";
import { Section } from "./section";
import { journey } from "../../_data/profile";

// journey.tone（primary | success | default）即合法 TimelineDotColor，零映射直传。
const items: TimelineItemProps[] = journey.map((j) => ({
  color: j.tone,
  children: (
    <div className="flex flex-col gap-1 pb-2">
      <span className="font-mono text-xs font-semibold tracking-wider text-primary">{j.year}</span>
      <span className="text-base font-semibold text-foreground">{j.title}</span>
      <span className="text-sm leading-relaxed text-muted-foreground">{j.desc}</span>
    </div>
  ),
}));

export function Journey() {
  return (
    <Section
      id="journey"
      eyebrow={copy("timeline")}
      title={copy("fromTheFirstLineOfCodeToFullTimeIndependence")}
      description={copy("notACarefullyPlannedPathButATrailOfIdeasIWantedToUseMyself")}
      width="4xl"
      className="bg-surface/30"
    >
      <div className="max-w-2xl">
        <Timeline items={items} pending={copy("moreIsOnTheWay")} />
      </div>
    </Section>
  );
}
