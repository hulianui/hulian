"use client";
import { useCallback } from "react";
import { notFound } from "next/navigation";
import { Anchor, Markdown, type ShowcaseSpec, type AnchorItem } from "@hulianui/ui";
import { componentMeta, manifest } from "../../lib/manifest";
import { DOCS_LOCALE } from "../../lib/docs-locale";
import { specBySlug } from "../../lib/registry";
import { ComponentPreview } from "./component-preview";
import { ExamplesSection } from "./examples-section";
import { StatesGallery } from "./states-gallery";
import { Playground } from "./playground";
import { CopyMarkdownButton } from "../copy-markdown-button";
import { ComponentDocNav, localizeComponentMarkdownLinks } from "./component-doc-nav";

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

  const hasPlayground = spec.controls.length > 0;
  const examples = spec.examples ?? [];
  const hasExamples = examples.length > 0;
  const toc: AnchorItem[] = [
    hasExamples
      ? { href: "#sec-usage", title: english ? "Usage" : "用法" }
      : { href: "#sec-preview", title: english ? "Preview" : "预览" },
    ...(localizedDoc ? [{ href: "#sec-doc", title: english ? "Documentation" : "文档" }] : []),
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
          <section
            id="sec-usage"
            className="scroll-mt-6 rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-7"
          >
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
          <section
            id="sec-doc"
            className="scroll-mt-6 rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-7"
          >
            <Markdown size="sm">{localizedDoc}</Markdown>
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
        <div className="sticky top-2">
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
