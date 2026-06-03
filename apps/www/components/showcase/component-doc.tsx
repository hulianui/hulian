"use client";
import { useCallback } from "react";
import { notFound } from "next/navigation";
import { Anchor, type ShowcaseSpec, type AnchorItem } from "@hulian/ui";
import { manifest } from "../../lib/manifest";
import { specBySlug } from "../../lib/registry";
import { ComponentPreview } from "./component-preview";
import { StatesGallery } from "./states-gallery";
import { Playground } from "./playground";

function defaultProps(spec: ShowcaseSpec) {
  return Object.fromEntries(spec.controls.map((c) => [c.prop, c.defaultValue]));
}

export function ComponentDoc({ slug }: { slug: string }) {
  const meta = manifest.find((m) => m.slug === slug);
  const spec = specBySlug[slug];
  // dogfood：本页右侧目录用真 Anchor 驱动；文档站滚动体是 <main>，故经 getContainer 指向它
  const getMain = useCallback(() => document.querySelector("main"), []);
  if (!meta || !spec) notFound();

  const hasPlayground = spec.controls.length > 0;
  const toc: AnchorItem[] = [
    { href: "#sec-preview", title: "预览" },
    { href: "#sec-states", title: "全状态" },
    ...(hasPlayground ? [{ href: "#sec-playground", title: "Playground" }] : []),
  ];

  return (
    <div className="mx-auto flex max-w-6xl gap-10">
      <article className="min-w-0 flex-1 space-y-8">
        <header>
          <h1 className="text-2xl font-semibold">{meta.name}</h1>
          <p className="mt-1 text-sm text-muted">{meta.description}</p>
        </header>

        <section id="sec-preview" className="scroll-mt-6">
          <ComponentPreview code={spec.toCode(defaultProps(spec))}>
            {spec.states[0]?.render()}
          </ComponentPreview>
        </section>

        <section id="sec-states" className="scroll-mt-6">
          <h2 className="mb-3 text-sm font-medium text-muted">全状态</h2>
          <StatesGallery states={spec.states} />
        </section>

        {hasPlayground && (
          <section id="sec-playground" className="scroll-mt-6">
            <h2 className="mb-3 text-sm font-medium text-muted">Playground</h2>
            <Playground spec={spec} />
          </section>
        )}
      </article>

      {/* 本页目录：真·瑚琏 Anchor（dogfood）。锚到 <main> 滚动容器，随滚动高亮、点击平滑跳转。 */}
      <aside className="hidden w-44 shrink-0 lg:block">
        <div className="sticky top-2">
          <p className="mb-2 pl-3 text-xs font-medium uppercase tracking-wide text-muted">本页</p>
          <Anchor items={toc} offsetTop={24} getContainer={getMain} aria-label="本页目录" />
        </div>
      </aside>
    </div>
  );
}
