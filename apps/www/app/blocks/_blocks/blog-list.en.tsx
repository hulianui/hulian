import { Avatar, Card, Heading, Tag, Text } from "@hulianui/ui";
const FEATURED = {
    category: "Architecture",
    title: "Three years of HanCloud's scheduler: from one region to global elasticity",
    summary: "How we rewrote the scheduler to move workloads across three continents in seconds while keeping cross-region latency predictable\u2014and the trade-offs we made.",
    author: "Marco Reyes",
    authorFallback: "M",
    date: "May 28, 2026",
    gradient: "from-primary/30 via-accent/15 to-bg",
};
const POSTS = [
    {
        category: "Observability",
        title: "Reconstruct every incident from a 1% sample",
        summary: "How we keep distributed tracing cost-effective while still capturing rare anomalous requests.",
        author: "Aisha Karim",
        fallback: "A",
        date: "May 20, 2026",
        gradient: "from-accent/25 to-bg",
    },
    {
        category: "Elastic compute",
        title: "Cold start time reduced from 1.8s to 400ms",
        summary: "Warm pools, layered images, and runtime snapshots reshape the startup experience for serverless functions.",
        author: "Zhou Mubai",
        fallback: "Zhou",
        date: "May 14, 2026",
        gradient: "from-primary/20 to-accent/10",
    },
    {
        category: "edge",
        title: "Run compute within 20 ms of your users",
        summary: "How we chose HanCloud edge locations, designed origin routing and consistency, and learned from mistakes along the way.",
        author: "Lin Zhihua",
        fallback: "Lin",
        date: "May 6, 2026",
        gradient: "from-accent/20 via-primary/10 to-bg",
    },
    {
        category: "Security",
        title: "Multi-tenant isolation goes beyond namespaces",
        summary: "From kernel cgroups to network micro-segmentation, how we maintain hard isolation boundaries on shared infrastructure.",
        author: "Su Wan",
        fallback: "Su",
        date: "April 29, 2026",
        gradient: "from-primary/15 to-accent/15",
    },
    {
        category: "data",
        title: "Designing an event bus for millions of metrics",
        summary: "Backpressure, batching, and partitioning strategies build an internal pipeline that won't collapse during traffic spikes.",
        author: "Elena Volkov",
        fallback: "E",
        date: "April 22, 2026",
        gradient: "from-accent/30 to-primary/10",
    },
    {
        category: "Developer experience",
        title: "The quarter we rewrote the documentation site",
        summary: "Developer experience starts with the first curl. Here's how we cut time to first success in half.",
        author: "Daniel Osei",
        fallback: "D",
        date: "April 15, 2026",
        gradient: "from-primary/25 to-bg",
    },
];
export function BlogListBlock() {
    return (<section className="px-6 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <Tag variant="soft" tone="brand" size="sm">
            Engineering Blog
          </Tag>
          <Heading level={2} size="3xl" weight="bold" balance className="text-foreground">
            From the HanCloud engineering team
          </Heading>
          <Text tone="muted" size="lg" className="max-w-2xl">
            Architecture decisions, performance retrospectives, and hard-won lessons for engineers building infrastructure.
          </Text>
        </div>

        <Card variant="outline" className="mb-8 grid grid-cols-1 overflow-hidden md:grid-cols-2">
          <div className={`min-h-56 bg-gradient-to-br ${FEATURED.gradient}`} aria-hidden/>
          <div className="flex flex-col justify-center gap-4 p-8">
            <Tag variant="soft" tone="neutral" size="sm">
              {FEATURED.category}
            </Tag>
            <Heading level={3} size="2xl" weight="bold" balance className="text-foreground">
              {FEATURED.title}
            </Heading>
            <Text size="base" tone="muted" lineClamp={2}>
              {FEATURED.summary}
            </Text>
            <div className="mt-2 flex items-center gap-3">
              <Avatar size="sm" fallback={FEATURED.authorFallback}/>
              <Text size="sm" className="text-foreground">
                {FEATURED.author}
              </Text>
              <Text size="xs" tone="muted">
                {FEATURED.date}
              </Text>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {POSTS.map((post) => (<Card key={post.title} variant="outline" className="flex flex-col overflow-hidden">
              <div className={`aspect-video bg-gradient-to-br ${post.gradient}`} aria-hidden/>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <Tag variant="soft" tone="neutral" size="sm">
                  {post.category}
                </Tag>
                <Heading level={3} size="lg" weight="semibold" className="text-foreground">
                  {post.title}
                </Heading>
                <Text size="sm" tone="muted" lineClamp={2}>
                  {post.summary}
                </Text>
                <div className="mt-auto flex items-center gap-2.5 pt-2">
                  <Avatar size="sm" fallback={post.fallback}/>
                  <Text size="sm" className="text-foreground">
                    {post.author}
                  </Text>
                  <Text size="xs" tone="muted">
                    {post.date}
                  </Text>
                </div>
              </div>
            </Card>))}
        </div>
      </div>
    </section>);
}
