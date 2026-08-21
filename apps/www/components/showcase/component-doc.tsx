"use client";
import { useCallback } from "react";
import { notFound } from "next/navigation";
import { Anchor, Markdown, extractHeadings, type ShowcaseSpec, type AnchorItem } from "@hulianui/ui";
import { componentMeta, manifest } from "../../lib/manifest";
import { DOCS_LOCALE } from "../../lib/docs-locale";
import { specBySlug } from "../../lib/registry";
import { ComponentPreview } from "./component-preview";
import { ExamplesSection } from "./examples-section";
import { StatesGallery } from "./states-gallery";
import { Playground } from "./playground";
import { CopyMarkdownButton } from "../copy-markdown-button";
import { ComponentDocNav, localizeComponentMarkdownLinks } from "./component-doc-nav";

// md 章节的锚点统一带前缀。判据：本页的 id 命名空间不止 sec-* 这批分节 —— 「用法」区渲染的是
// 组件自己的示例，示例里可以出现任何 id（Anchor 的示例就实打实渲染出一批 sec-* 分节，其中
// sec-usage 与本页的分节 id 已经字面重名）。而 md 的 h2 又都是「Props」「相关」这类通用词，
// 不隔离迟早撞上，且撞了的表现是「点目录跳到页面另一处」——没人会把它当 bug 报上来。
const DOC_ID_PREFIX = "doc-";

function defaultProps(spec: ShowcaseSpec) {
  return Object.fromEntries(spec.controls.map((c) => [c.prop, c.defaultValue]));
}

export function ComponentDoc({
  slug,
  doc,
  copyMd,
}: {
  slug: string;
  doc?: string | null;
  copyMd?: string | null;
}) {
  const meta = manifest.find((m) => m.slug === slug);
  const spec = specBySlug[slug];
  // dogfood：本页右侧目录用真 Anchor 驱动；文档站滚动体是 <main>，故经 getContainer 指向它
  const getMain = useCallback(() => document.querySelector("main"), []);
  if (!meta || !spec) notFound();
  const localizedMeta = componentMeta(meta);
  const localizedDoc = localizeComponentMarkdownLinks(doc);
  const localizedCopyMd = localizeComponentMarkdownLinks(copyMd);
  const english = DOCS_LOCALE === "en";

  // 文档区章节进 TOC 二级。只收 h2：Anchor 只支持一层嵌套，顶层已被「文档」占住，md 的 h2
  // 正好落二级，h3 没有第三层可放；且 394 份组件 md 里 343 份一个 h3 都没有，为它拉平层级不值。
  // 与下方 <Markdown headingIds={DOC_ID_PREFIX}> 喂的是同一份 localizedDoc、同一个前缀，
  // 故 href 与 DOM 里的 id 必然一致（示例区已被 loadComponentDoc 剥掉，这里抽不到它）。
  const docSections = localizedDoc
    ? extractHeadings(localizedDoc, DOC_ID_PREFIX).filter((h) => h.level === 2)
    : [];

  const hasPlayground = spec.controls.length > 0;
  const examples = spec.examples ?? [];
  const hasExamples = examples.length > 0;
  const toc: AnchorItem[] = [
    hasExamples
      ? { href: "#sec-usage", title: english ? "Usage" : "用法" }
      : { href: "#sec-preview", title: english ? "Preview" : "预览" },
    ...(localizedDoc
      ? [
          {
            href: "#sec-doc",
            title: english ? "Documentation" : "文档",
            children: docSections.map((h) => ({ href: `#${h.id}`, title: h.plainText })),
          },
        ]
      : []),
    ...(hasExamples ? [] : [{ href: "#sec-states", title: english ? "States" : "全状态" }]),
    ...(hasPlayground ? [{ href: "#sec-playground", title: "Playground" }] : []),
  ];

  return (
    <div className="mx-auto flex max-w-6xl gap-10">
      <article className="min-w-0 flex-1 space-y-6">
        <header className="pb-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h1 className="text-[1.7rem] font-semibold tracking-tight">{meta.name}</h1>
                <span className="rounded-md bg-subtle px-2 py-0.5 font-mono text-xs text-muted-foreground">
                  {slug}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{localizedMeta.description}</p>
            </div>
            {/* 复制本组件完整用法 MD，喂给 AI 编程助手 */}
            {localizedCopyMd && <CopyMarkdownButton text={localizedCopyMd} className="shrink-0" />}
          </div>
        </header>

        {hasExamples ? (
          // 用法区不再包一层卡：ExamplesSection 里每个示例自带「预览 + 代码」边框，
          // 外面再套一个 border + bg-surface + shadow 只是套娃 —— 它不划分任何新信息，
          // 却让每个示例的边框离页面底色隔了两层。h2 仍在（TOC 锚点 + 分节标签）。
          <section id="sec-usage" className="scroll-mt-6">
            <h2 className="mb-5 text-sm font-medium text-muted-foreground">{english ? "Usage" : "用法"}</h2>
            <ExamplesSection examples={examples} />
          </section>
        ) : (
          <section id="sec-preview" className="scroll-mt-6">
            <ComponentPreview code={spec.toCode(defaultProps(spec))}>
              {spec.states[0]?.render()}
            </ComponentPreview>
          </section>
        )}

        {localizedDoc && (
          <section className="relative rounded-xl border border-border bg-surface p-6 shadow-sm [&_h2]:scroll-mt-6 sm:p-7">
            {/* sec-doc 挂在这个 1px 高的定位标记上，而不是整个 <section> 上。
                Anchor 的 scrollspy 取「文档顺序最靠前的可见项」——若父项的观测目标是整块文档
                容器，它在文档区内任何位置都处于可见状态，就会永远压过自己的子项，二级高亮
                只在点击的一瞬间存在，滚动/落位后立刻弹回「文档」。换成贴在卡片顶边的点状标记，
                父项只在文档区开头当选，往下就把高亮交给具体章节。
                位置与原来的 section 顶边逐像素相同，故点击落点不变；scroll-mt 同为 24px，
                与 Anchor 的 offsetTop 对齐（章节标题的那份写在 [&_h2] 上，供 #doc-xxx 深链）。 */}
            <span id="sec-doc" aria-hidden className="absolute inset-x-0 top-0 h-px scroll-mt-6" />
            <Markdown size="sm" headingIds={DOC_ID_PREFIX}>
              {localizedDoc}
            </Markdown>
          </section>
        )}

        {!hasExamples && (
          <section
            id="sec-states"
            className="scroll-mt-6 rounded-xl border border-border bg-surface p-6 shadow-sm"
          >
            <h2 className="mb-4 text-sm font-medium text-muted-foreground">{english ? "States" : "全状态"}</h2>
            <StatesGallery states={spec.states} />
          </section>
        )}

        {hasPlayground && (
          <section
            id="sec-playground"
            className="scroll-mt-6 rounded-xl border border-border bg-surface p-6 shadow-sm"
          >
            <h2 className="mb-4 text-sm font-medium text-muted-foreground">Playground</h2>
            <Playground spec={spec} />
          </section>
        )}

        <ComponentDocNav slug={slug} />
      </article>

      {/* 本页目录：真·瑚琏 Anchor（dogfood）。锚到 <main> 滚动容器，随滚动高亮、点击平滑跳转。 */}
      <aside className="hidden w-44 shrink-0 lg:block">
        {/* 限高 + 内部滚动。实测 1440×640 都还溢不出来（button 那页目录整列 562px），
            留着不是因为已经复现过，而是因为两侧都会变：章节条数随组件 md 增长，视口高度
            在横屏手机与分屏窗口下比我们测过的 640 还矮。一个 className 换掉「将来目录末尾
            滚不到且没人发现」，值。别当死代码删。 */}
        <div className="sticky top-2 max-h-[calc(100dvh-1rem)] overflow-y-auto">
          <p className="mb-2 pl-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {english ? "On this page" : "本页"}
          </p>
          <Anchor
            items={toc}
            offsetTop={24}
            getContainer={getMain}
            aria-label={english ? "On this page" : "本页目录"}
          />
        </div>
      </aside>
    </div>
  );
}
