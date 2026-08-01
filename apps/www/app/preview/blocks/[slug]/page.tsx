import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blocks, blockPreviews, getBlock } from "../../../blocks/_registry";

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
  return {
    title: b ? `${b.name} · 预览 · 瑚琏 Hulian` : "预览 · 瑚琏 Hulian",
    // 隔离预览是详情页的 iframe 内容，不是给人直接搜到的落地页。
    robots: { index: false, follow: false },
  };
}

export default async function BlockPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const preview = blockPreviews[slug];
  if (!getBlock(slug) || !preview) notFound();
  // 区块是页面的一段，不是整页 —— 给足留白才是它在真实页面里的样子（整页预览则全出血，不加）。
  return <div className="px-6 py-12">{preview()}</div>;
}
