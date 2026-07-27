import type { Metadata } from "next";
import { Markdown, Tag, Timeline, Text } from "@hulianui/ui";
import { SiteNavbar } from "../../components/site-navbar";
import { UI_VERSION } from "../../lib/ui-version";
import changelog from "../../lib/changelog.json";

export const metadata: Metadata = {
  title: "更新日志 · 瑚琏 Hulian",
  description:
    "瑚琏 Hulian（@hulianui/ui · @hulianui/tokens）逐版本更新记录：新功能、修复与破坏性变更，含对应 commit 与 issue。",
};

const REPO = "https://github.com/hulianui/hulian";

type Bump = "major" | "minor" | "patch";
interface Entry {
  sha: string | null;
  bump: Bump;
  body: string;
}
interface Release {
  pkg: string;
  version: string;
  date: string | null;
  entries: Entry[];
}

// bump → 展示元信息。破坏性最扎眼，patch 最弱，与 Timeline 圆点语气色对齐。
const BUMP = {
  major: { label: "破坏性", tone: "danger", dot: "danger" },
  minor: { label: "新功能", tone: "brand", dot: "primary" },
  patch: { label: "修复", tone: "neutral", dot: "default" },
} as const;

const RANK: Record<Bump, number> = { patch: 0, minor: 1, major: 2 };

/** 正文里的 #123 转成指向 issue 的链接（跳过行内代码；含围栏代码块的正文整体放行）。 */
function linkifyIssues(md: string): string {
  if (md.includes("```")) return md;
  return md
    .split("`")
    .map((seg, i) => (i % 2 === 1 ? seg : seg.replace(/#(\d+)/g, `[#$1](${REPO}/issues/$1)`)))
    .join("`");
}

export default function ChangelogPage() {
  const releases = changelog as Release[];

  return (
    <>
      <SiteNavbar />
      <main className="mx-auto max-w-3xl px-6 pb-20 pt-10">
        <header className="pb-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">Changelog</p>
          <h1 className="mt-2 text-[1.7rem] font-semibold tracking-tight">更新日志</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            两个包各自独立发版：<code className="font-mono">@hulianui/ui</code>（组件）与{" "}
            <code className="font-mono">@hulianui/tokens</code>（设计令牌 CSS）。遵循语义化版本，记录由
            changesets 生成，每条可追到对应 commit 与 issue。
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="flex items-center gap-2">
              <Text size="sm" tone="muted">
                当前版本
              </Text>
              <Tag variant="soft" tone="brand" size="sm">
                v{UI_VERSION}
              </Tag>
            </span>
            <a
              className="text-primary hover:underline"
              href="https://www.npmjs.com/package/@hulianui/ui"
              target="_blank"
              rel="noreferrer"
            >
              npm
            </a>
            <a
              className="text-primary hover:underline"
              href={`${REPO}/releases`}
              target="_blank"
              rel="noreferrer"
            >
              GitHub Releases
            </a>
          </div>
        </header>

        <Timeline
          items={releases.map((r) => {
            // 该版本的最高 bump 决定圆点语气；同版本多条不同 bump 时各条自带标签。
            const top = r.entries.reduce<Bump>(
              (acc, e) => (RANK[e.bump] > RANK[acc] ? e.bump : acc),
              "patch",
            );
            const bumps = [...new Set(r.entries.map((e) => e.bump))].sort(
              (a, b) => RANK[b] - RANK[a],
            );
            // 两个包可能撞同一版本号（ui@0.1.1 与 tokens@0.1.1），锚点带包名才唯一。
            const anchor = `${r.pkg.replace("@hulianui/", "")}-${r.version}`;
            return {
              color: BUMP[top].dot,
              children: (
                <section id={anchor} className="scroll-mt-20 pb-2">
                  <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1.5">
                    <h2 className="font-mono text-lg font-semibold tracking-tight">
                      <a href={`#${anchor}`} className="hover:text-primary">
                        v{r.version}
                      </a>
                    </h2>
                    <Tag variant="soft" tone="neutral" size="sm">
                      {r.pkg}
                    </Tag>
                    {bumps.map((b) => (
                      <Tag key={b} variant="soft" tone={BUMP[b].tone} size="sm">
                        {BUMP[b].label}
                      </Tag>
                    ))}
                    {r.date ? (
                      <time className="ml-auto font-mono text-xs text-muted" dateTime={r.date}>
                        {r.date}
                      </time>
                    ) : null}
                  </div>

                  <div className="mt-3 space-y-5">
                    {r.entries.map((e, i) => (
                      <div key={e.sha ?? i}>
                        <Markdown size="sm">{linkifyIssues(e.body)}</Markdown>
                        {e.sha ? (
                          <a
                            className="mt-2 inline-block font-mono text-xs text-muted hover:text-primary hover:underline"
                            href={`${REPO}/commit/${e.sha}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {e.sha.slice(0, 7)}
                          </a>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </section>
              ),
            };
          })}
        />
      </main>
    </>
  );
}
