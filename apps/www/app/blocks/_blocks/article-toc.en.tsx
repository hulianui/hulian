import { Avatar, Heading, Prose, Tag, Text } from "@hulianui/ui";
interface Toc {
    id: string;
    label: string;
}
const TOC: Toc[] = [
    { id: "prep", label: "1 \u00B7 Connect to the code repository" },
    { id: "build", label: "2 \u00B7 Zero-configuration build" },
    { id: "preview", label: "3 \u00B7 Preview environment" },
    { id: "release", label: "4 \u00B7 Progressive release and rollback" },
    { id: "observe", label: "5 \u00B7 Add observability" },
    { id: "secure", label: "6 \u00B7 Establish a security baseline" },
    { id: "summary", label: "Summary" },
];
export function ArticleTocBlock() {
    return (<section className="px-6 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-5xl">

        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          <Tag variant="soft" tone="brand" size="sm">
            Deployment Guide
          </Tag>
          <Heading level={1} size="4xl" weight="bold" balance className="text-foreground">
            From Zero to Production: 6 Checkpoints Before Go-Live
          </Heading>
          <div className="flex flex-wrap items-center gap-2">
            <Avatar size="sm" fallback="Lin"/>
            <Text size="sm" className="text-foreground">
              Lin Zhiyuan
            </Text>
            <Text size="sm" tone="muted">·</Text>
            <Text size="sm" tone="muted">June 1, 2026</Text>
            <Text size="sm" tone="muted">·</Text>
            <Text size="sm" tone="muted">12 min read</Text>
          </div>
        </div>


        <div className="mt-12 lg:grid lg:grid-cols-[1fr_200px] lg:gap-12">
          <article className="min-w-0">
            <Prose className="max-w-none">
              <p>
                A reliable production release depends on a proven set of checks, not a silver bullet. This guide walks through the HanCloud team's pre-release checklist so you can avoid common failure modes.
              </p>

              <h2 id="prep">Connect to code repository</h2>
              <p>
                Start with your repository. Once HanCloud has access, every push triggers a traceable pipeline. Test a non-default branch first to confirm permissions and webhooks are configured correctly.
              </p>

              <h2 id="build">Zero-configuration build</h2>
              <p>
                HanCloud detects your framework and creates the build configuration, so most projects need no custom CI. For an unusual project layout, use <code>hancloud.json</code> to override the defaults only when needed—convention comes first.
              </p>

              <h2 id="preview">Preview environment</h2>
              <p>
                Every pull request gets an isolated preview with realistic data. Share the link in review so product and design can test the real experience before merge instead of guessing from screenshots.
              </p>

              <h2 id="release">Progressive rollout and rollback</h2>
              <p>
                Production releases use progressive delivery by default: shift a small share of traffic first, watch key metrics, then proceed once the release is healthy. If an alert fires, roll back to the last healthy version in one click, usually within seconds.
              </p>

              <h2 id="observe">Add observability</h2>
              <p>
                Logs, metrics, and distributed traces work out of the box. Define SLOs for critical paths on day one so monitoring exposes every regression immediately—observability is a release guardrail, not an afterthought.
              </p>

              <h2 id="secure">Establish a security baseline</h2>
              <p>
                Manage secrets instead of hard-coding them, grant least-privilege access, encrypt data in transit, and enable audit logs by default. Security is foundational, not a switch to flip later.
              </p>

              <h2 id="summary">Summary</h2>
              <p>
                Together, these six checkpoints create an observable, reversible, and dependable release path. Make them routine and shipping becomes a normal part of the day instead of a source of anxiety.
              </p>
            </Prose>
          </article>


          <aside className="hidden lg:block">
            <nav className="sticky top-24">
              <Text size="xs" tone="muted" weight="medium" className="mb-3 uppercase tracking-wide">
                In this article
              </Text>
              <ul className="flex flex-col gap-2 border-l border-border">
                {TOC.map((t) => (<li key={t.id}>
                    <a href={`#${t.id}`} className="-ml-px block border-l-2 border-transparent pl-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground">
                      {t.label}
                    </a>
                  </li>))}
              </ul>
            </nav>
          </aside>
        </div>
      </div>
    </section>);
}
