import { Heading, Text, Tag } from "@hulianui/ui";
import { StatsBlock } from "../../blocks/_blocks/stats.en";
import { MilestoneTimelineBlock } from "../../blocks/_blocks/milestone-timeline.en";
import { TeamGridBlock } from "../../blocks/_blocks/team-grid.en";
import { TestimonialsBlock } from "../../blocks/_blocks/testimonials.en";
import { CtaBlock } from "../../blocks/_blocks/cta.en";
export function AboutPage() {
    return (<div className="bg-bg">
      <section className="px-6 pt-20 pb-6 text-center">
        <div className="mx-auto max-w-3xl flex flex-col items-center gap-3">
          <Tag variant="soft" tone="brand" size="sm">
            About HanCloud
          </Tag>
          <Heading level={1} size="4xl" weight="bold" balance>
            Make every piece of data more valuable
          </Heading>
          <Text tone="muted" size="lg">
            We believe that good tools should disappear into the work.
          </Text>
        </div>
      </section>
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl flex flex-col gap-4 text-center">
          <Heading level={2} size="2xl" weight="bold">
            Our story
          </Heading>
          <Text tone="muted" size="lg">
            HanCloud began with a familiar frustration: fragmented systems, duplicate spreadsheets, and stale data were slowing the team down. We built a platform that connects those workflows and keeps information moving.
          </Text>
          <Text tone="muted" size="lg">
            We have valued restraint since the first line of code: build only what solves a real problem. Today, HanCloud gives thousands of teams one foundation for data ingestion and intelligent decisions, while staying focused on simplicity and reliability.
          </Text>
          <Text tone="muted" size="lg">
            We're still working every day to make complexity disappear.
          </Text>
        </div>
      </section>
      <StatsBlock />
      <MilestoneTimelineBlock />
      <TeamGridBlock />
      <TestimonialsBlock />
      <CtaBlock />
    </div>);
}
