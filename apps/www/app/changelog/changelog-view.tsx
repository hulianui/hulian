"use client";
import { useMemo, useState } from "react";
import { Anchor, Empty, Markdown, ScrollArea, Segmented, Tag, Text, Timeline } from "@hulianui/ui";

const REPO = "https://github.com/hulianui/hulian";

type Bump = "major" | "minor" | "patch";
interface Entry {
  sha: string | null;
  bump: Bump;
  body: string;
}
export interface Release {
  pkg: string;
  version: string;
  date: string | null;
  entries: Entry[];
}

// bump → 展示元信息。破坏性最扎眼，patch 最弱，与 Timeline 圆点语气色对齐。
const BUMP = {
  major: { label: "破坏性", tone: "danger", dot: "danger", dotClass: "bg-danger" },
  minor: { label: "新功能", tone: "brand", dot: "primary", dotClass: "bg-primary" },
  patch: { label: "修复", tone: "neutral", dot: "default", dotClass: "bg-muted" },
} as const;

const RANK: Record<Bump, number> = { patch: 0, minor: 1, major: 2 };

// 默认只出最近这么多个版本。更新日志天然只增不减，全量铺开会越来越长，
// 而绝大多数来访只关心「最近发生了什么」；想看全史一键切「全部」。
const RECENT_COUNT = 5;

const VIEWS = [
  { value: "recent", label: `最近 ${RECENT_COUNT} 版` },
  { value: "all", label: "全部" },
  { value: "breaking", label: "仅破坏性" },
];

/** 正文里的 #123 转成指向 issue 的链接（跳过行内代码；含围栏代码块的正文整体放行）。 */
function linkifyIssues(md: string): string {
  if (md.includes("```")) return md;
  return md
    .split("`")
    .map((seg, i) => (i % 2 === 1 ? seg : seg.replace(/#(\d+)/g, `[#$1](${REPO}/issues/$1)`)))
    .join("`");
}

/** 两个包可能撞同一版本号（ui@0.1.1 与 tokens@0.1.1），锚点带包名才唯一。 */
const anchorOf = (r: Release) => `${r.pkg.replace("@hulianui/", "")}-${r.version}`;

const topBump = (r: Release): Bump =>
  r.entries.reduce<Bump>((acc, e) => (RANK[e.bump] > RANK[acc] ? e.bump : acc), "patch");

export function ChangelogView({
  releases,
  currentVersion,
}: {
  releases: Release[];
  currentVersion: string;
}) {
  const [view, setView] = useState("recent");

  const shown = useMemo(() => {
    if (view === "breaking") return releases.filter((r) => r.entries.some((e) => e.bump === "major"));
    if (view === "recent") return releases.slice(0, RECENT_COUNT);
    return releases;
  }, [releases, view]);

  // 目录跟随筛选，否则点了目录却跳到被筛掉的版本，锚点落空。
  const anchorItems = useMemo(
    () =>
      shown.map((r) => ({
        href: `#${anchorOf(r)}`,
        title: (
          <span className="flex items-center gap-2">
            <span
              className={`size-1.5 shrink-0 rounded-full ${BUMP[topBump(r)].dotClass}`}
              aria-hidden
            />
            <span className="font-mono text-xs">v{r.version}</span>
            {r.version === currentVersion && r.pkg === "@hulianui/ui" ? (
              <span className="shrink-0 text-[0.65rem] text-primary">当前</span>
            ) : (
              // 条目数给个预期：一眼知道点进去是一行还是十行，省得跳过去才发现要滚很久
              <span className="shrink-0 text-[0.65rem] text-muted/70">{r.entries.length}</span>
            )}
          </span>
        ),
      })),
    [shown, currentVersion],
  );

  return (
    <div className="lg:flex lg:items-start lg:gap-10">
      {/* 目录：桌面粘在侧边。更新日志是只增不减的长页，没有目录就只能靠滚轮找版本。
          限高 + 内部滚动，避免版本多了目录自己顶穿视口。 */}
      <aside className="hidden lg:sticky lg:top-24 lg:block lg:w-40 lg:shrink-0">
        <Text size="sm" tone="muted" className="mb-2 block">
          版本
        </Text>
        {/* offsetTop 让滚动高亮与 scroll-mt-20 的落点对齐，否则高亮总慢一格。
            只有版本多到会顶穿视口时才套 ScrollArea —— 它的滚动条轨道即使内容不溢出也会画出来，
            默认视图只有几项时那条竖线纯属噪音。 */}
        {anchorItems.length > 12 ? (
          <ScrollArea className="max-h-[calc(100dvh-12rem)]">
            <Anchor items={anchorItems} offsetTop={88} />
          </ScrollArea>
        ) : (
          <Anchor items={anchorItems} offsetTop={88} />
        )}
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-8">
          <Segmented
            items={VIEWS}
            value={view}
            onValueChange={setView}
            aria-label="更新日志视图"
          />
        </div>

        {shown.length === 0 ? (
          <Empty
            title="没有破坏性变更"
            description="到目前为止所有版本都是向后兼容的。切回「全部」查看完整记录。"
          />
        ) : (
          <Timeline
            items={shown.map((r) => {
              const top = topBump(r);
              // 同版本多条不同 bump 时各条自带标签，故版本头列出该版涉及的全部 bump。
              const bumps = [...new Set(r.entries.map((e) => e.bump))].sort(
                (a, b) => RANK[b] - RANK[a],
              );
              const anchor = anchorOf(r);
              return {
                color: BUMP[top].dot,
                children: (
                  <section id={anchor} className="scroll-mt-20 pb-2">
                    {/* 版本头吸顶：单条 changeset 动辄十几行，滚进正文深处就不知道自己在哪一版了。
                        吸顶比「把内容折叠起来」好——后者会让 Ctrl+F 搜不到（Base UI 的 Collapsible
                        收起时内容不在 DOM），而更新日志最常见的用法恰恰是搜「这个改动在哪版」。
                        需要不透明底色，否则下方内容会从半透明的头后面透出来。 */}
                    <div className="sticky top-16 z-10 -mx-2 flex flex-wrap items-baseline gap-x-2.5 gap-y-1.5 bg-bg px-2 py-1.5">
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
        )}

        {view === "recent" && releases.length > RECENT_COUNT ? (
          <p className="mt-8 text-sm text-muted">
            还有 {releases.length - RECENT_COUNT} 个更早的版本，切到「全部」查看。
          </p>
        ) : null}
      </div>
    </div>
  );
}
