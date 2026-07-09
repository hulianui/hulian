import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blocks, blockPreviews, getBlock } from "../_registry";
import { BlockView } from "../_block-view";

export function generateStaticParams() {
  return blocks.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const b = getBlock(slug);
  if (!b) return { title: "区块 · 瑚琏 Hulian" };
  const title = `${b.name} · 区块 · 瑚琏 Hulian`;
  const description = `${b.description} —— 瑚琏 Hulian 现成区块，可直接复制源码接入。`;
  const path = `/blocks/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "article", title, description, url: path, images: ["/opengraph-image.png"] },
  };
}

// 读取 block 的真实源文件作为可复制源码。server 组件在构建期(output:export)执行 fs，静态烘进页面。
function readBlockSource(file: string): string {
  return readFileSync(join(process.cwd(), "app/blocks/_blocks", file), "utf8");
}

export default async function BlockDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const b = getBlock(slug);
  const preview = blockPreviews[slug];
  if (!b || !preview) notFound();

  const source = readBlockSource(b.file);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{b.name}</h1>
        <p className="mt-1 text-sm text-muted">{b.description}</p>
      </header>
      <BlockView code={source}>{preview()}</BlockView>
    </div>
  );
}
