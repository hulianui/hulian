import { Avatar, Heading, Prose, Tag, Text } from "@hulianui/ui";
export function ArticleBodyBlock() {
    return (<section className="px-6 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-3xl">

        <div className="flex flex-col gap-5">
          <Tag variant="soft" tone="brand" size="sm">
            Elastic compute
          </Tag>
          <Heading level={1} size="4xl" weight="bold" balance className="text-foreground">
            How we cut cold starts from 1.8 s to 400 ms
          </Heading>
          <div className="flex flex-wrap items-center gap-2">
            <Avatar size="sm" fallback="Zhou"/>
            <Text size="sm" className="text-foreground">
              Zhou Mubai
            </Text>
            <Text size="sm" tone="muted">
              ·
            </Text>
            <Text size="sm" tone="muted">
              May 14, 2026
            </Text>
            <Text size="sm" tone="muted">
              ·
            </Text>
            <Text size="sm" tone="muted">
              9 min read
            </Text>
          </div>
          <div className="aspect-[2/1] rounded-[var(--radius-sm,0.5rem)] bg-gradient-to-br from-primary/30 via-accent/15 to-bg" aria-hidden/>
        </div>


        <Prose className="mt-10">
          <p>
            Cold starts are an unavoidable part of serverless computing. When an idle function wakes up, the request waits for runtime initialization, dependency loading, and network handshakes. Early HanCloud deployments took about 1.8 seconds—long enough to feel sluggish. Here is how we reduced that delay to 400 milliseconds.
          </p>

          <h2>Start with a flame graph</h2>
          <p>
            Optimization starts with measurement. Fine-grained spans split the 1.8-second cold start into image download, runtime initialization, dependency resolution, and user-code execution. The largest cost, unexpectedly, was outside the user code.
          </p>
          <ul>
            <li>Image download and extraction: about 700 ms, entirely serial</li>
            <li>Runtime initialization: about 600 ms, starting from scratch each time</li>
            <li>Dependency resolution: about 350 ms, repeatedly loading the same modules</li>
            <li>First user-code execution: about 150 ms</li>
          </ul>

          <h2>Three complementary techniques</h2>
          <p>
            Once the bottlenecks were clear, we optimized each stage separately: layered images reuse and pre-position common base layers, a warm pool keeps initialized instances ready during quiet periods, and runtime snapshots restore initialized memory instead of repeating the full cold-start sequence.
          </p>

          <blockquote>
            Performance work is measurement: find where every millisecond goes, then win it back one stage at a time.
          </blockquote>

          <p>
            Runtime snapshots delivered the largest gain. They capture the entire process after initialization but before its first request, so restoring the snapshot skips initialization entirely:
          </p>
          <pre>
            <code>{`// Freeze the runtime state at the initialization completion point const snapshot = await runtime.snapshot(); await store.put(fnId, snapshot); // Restore directly during cold start, skipping initialization const restored = await runtime.restore(snapshot); return restored.handle(request);`}</code>
          </pre>

          <h2>result</h2>
          <p>
            Together, the three changes brought P50 cold starts below 400 milliseconds and kept P99 near 700 milliseconds. More importantly, the path is now observable and regression-tested, so monitoring surfaces degradation immediately. That is the guardrail we actually needed.
          </p>
        </Prose>
      </div>
    </section>);
}
