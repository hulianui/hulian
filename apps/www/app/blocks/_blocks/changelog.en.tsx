import { Heading, Tag, Text } from "@hulianui/ui";
type EntryKind = "New" | "Fixes" | "Optimize";
const KIND_TONE: Record<EntryKind, "success" | "warning" | "neutral"> = {
    "New": "success",
    "Fixes": "warning",
    "Optimize": "neutral",
};
const RELEASES: Array<{
    version: string;
    date: string;
    entries: Array<{
        kind: EntryKind;
        text: string;
    }>;
}> = [
    {
        version: "v3.4.0",
        date: "May 30, 2026",
        entries: [
            { kind: "New", text: "Runtime snapshots bring P50 cold starts into the 400 ms range." },
            { kind: "New", text: "Added a global edge-node topology view to the console." },
            { kind: "Optimize", text: "Cross-region migration jitter in the scheduler is down by about 40%." },
        ],
    },
    {
        version: "v3.3.0",
        date: "May 12, 2026",
        entries: [
            { kind: "New", text: "The observability dashboard supports custom sampling rates and strategies for capturing long-tail failures." },
            { kind: "Fixes", text: "Fixed occasional missing root spans in distributed traces under high concurrency." },
            { kind: "Optimize", text: "Improved metrics-query response times across large time windows." },
        ],
    },
    {
        version: "v3.2.0",
        date: "April 24, 2026",
        entries: [
            { kind: "New", text: "Added multi-tenant network microsegmentation with tenant-scoped policy delivery." },
            { kind: "Fixes", text: "Fixed an edge case that prevented image-pull timeouts from retrying in some regions." },
        ],
    },
    {
        version: "v3.1.0",
        date: "April 8, 2026",
        entries: [
            { kind: "New", text: "The event bus is now in public beta, with backpressure and partitioned consumers." },
            { kind: "Optimize", text: "Rewrote the documentation site and cut onboarding time roughly in half." },
            { kind: "Fixes", text: "Improved contrast for several console charts in dark mode." },
        ],
    },
];
export function ChangelogBlock() {
    return (<section className="px-6 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <Tag variant="soft" tone="brand" size="sm">
            Changelog
          </Tag>
          <Heading level={2} size="3xl" weight="bold" balance className="text-foreground">
            What's new in HanCloud?
          </Heading>
          <Text tone="muted" size="lg" className="max-w-2xl">
            Track every feature, fix, and performance improvement across releases.
          </Text>
        </div>

        <div className="border-l border-border pl-8">
          {RELEASES.map((release) => (<div key={release.version} className="relative pb-12 last:pb-0">
              <span className="absolute -left-[2.3125rem] top-1.5 size-2.5 rounded-full border-2 border-bg bg-primary" aria-hidden/>
              <div className="mb-4 flex items-baseline gap-3">
                <Text as="span" weight="medium" className="font-mono text-foreground">
                  {release.version}
                </Text>
                <Text as="span" size="xs" tone="muted">
                  {release.date}
                </Text>
              </div>
              <ul className="flex flex-col gap-3">
                {release.entries.map((entry, i) => (<li key={i} className="flex items-start gap-3">
                    <Tag variant="soft" tone={KIND_TONE[entry.kind]} size="sm">
                      {entry.kind}
                    </Tag>
                    <Text size="sm" tone="muted" className="pt-0.5">
                      {entry.text}
                    </Text>
                  </li>))}
              </ul>
            </div>))}
        </div>
      </div>
    </section>);
}
