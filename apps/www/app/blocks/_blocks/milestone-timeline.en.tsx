import { Heading, Tag, Text, Timeline, type TimelineItemProps } from "@hulianui/ui";
interface Milestone {
    year: string;
    title: string;
    desc: string;
    color: TimelineItemProps["color"];
}
const MILESTONES: Milestone[] = [
    {
        year: "2019",
        title: "The first line of code in the garage",
        desc: "Three founders, tired of moving data between disconnected systems, set out to build a platform that connects them. HanCloud was born.",
        color: "primary",
    },
    {
        year: "2020",
        title: "First public beta launched",
        desc: "We opened the private beta to our first 100 teams with one rule: build only what solves a real problem.",
        color: "default",
    },
    {
        year: "2021",
        title: "Raised Series A funding",
        desc: "After our Series A, the team grew to 30 and brought elastic compute and the global edge network into production.",
        color: "success",
    },
    {
        year: "2023",
        title: "Edge network covers the world",
        desc: "More than 100 edge nodes now span 20 countries, bringing initial page loads below 400 ms for most international users.",
        color: "primary",
    },
    {
        year: "2024",
        title: "Meet enterprise compliance requirements",
        desc: "Completed SOC 2 Type II and MLPS Level 3 audits, signed our first public-company customer, and launched Enterprise.",
        color: "warning",
    },
];
export function MilestoneTimelineBlock() {
    const items: TimelineItemProps[] = MILESTONES.map((m) => ({
        color: m.color,
        label: (<span className="font-semibold tracking-tight text-foreground">{m.year}</span>),
        children: (<div className="pb-2">
        <Text weight="semibold" className="text-foreground">
          {m.title}
        </Text>
        <Text tone="muted" size="sm" className="mt-1 leading-relaxed">
          {m.desc}
        </Text>
      </div>),
    }));
    return (<section className="px-6 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-14 flex flex-col items-center gap-3 text-center">
          <Tag variant="soft" tone="brand" size="sm">
            Our history
          </Tag>
          <Heading level={2} size="3xl" weight="bold" balance className="text-foreground">
            Our journey
          </Heading>
          <Text tone="muted" size="lg" className="max-w-2xl">
            From three people in a garage to serving more than 100,000 developers around the world, every step counts.
          </Text>
        </div>
        <Timeline mode="alternate" items={items} pending="The next chapter is yours to define"/>
      </div>
    </section>);
}
