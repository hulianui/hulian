"use client";
import { notFound } from "next/navigation";
import type { ShowcaseSpec } from "@hulian/ui";
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
  if (!meta || !spec) notFound();

  return (
    <article className="mx-auto max-w-4xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">{meta.name}</h1>
        <p className="mt-1 text-sm text-muted">{meta.description}</p>
      </header>

      <ComponentPreview code={spec.toCode(defaultProps(spec))}>
        {spec.states[0]?.render()}
      </ComponentPreview>

      <section>
        <h2 className="mb-3 text-sm font-medium text-muted">全状态</h2>
        <StatesGallery states={spec.states} />
      </section>

      {spec.controls.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-muted">Playground</h2>
          <Playground spec={spec} />
        </section>
      )}
    </article>
  );
}
