import type { Metadata } from "next";
import { manifest } from "../../../lib/manifest";
import { loadComponentDoc, loadComponentMarkdownForCopy } from "../../../lib/load-component-doc";
import { ComponentDoc } from "../../../components/showcase/component-doc";

export function generateStaticParams() {
  return manifest.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = manifest.find((m) => m.slug === slug);
  return { title: meta ? `${meta.name} · 瑚琏 Hulian` : "组件 · 瑚琏 Hulian" };
}

export default async function ComponentSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <ComponentDoc
      slug={slug}
      doc={loadComponentDoc(slug)}
      copyMd={loadComponentMarkdownForCopy(slug)}
    />
  );
}
