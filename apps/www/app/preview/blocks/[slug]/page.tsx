import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getIntlayer } from "next-intlayer";
import { blocks, blockPreviews, getBlock, blockMeta } from "../../../blocks/_registry";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";
import { ConfigProvider, enUS, zhCN } from "@hulianui/ui";

const content = getIntlayer("preview", DOCS_LOCALE);

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
  const name = b ? blockMeta(b).name : null;
  return {
    title: name ? content.metadataTitle.replace("{name}", name) : content.metadataFallback,
    // 隔离预览是详情页的 iframe 内容，不是给人直接搜到的落地页。
    robots: { index: false, follow: false },
  };
}

export default async function BlockPreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const preview = blockPreviews[slug];
  if (!getBlock(slug) || !preview) notFound();
  // 区块是页面的一段，不是整页 —— 给足留白才是它在真实页面里的样子（整页预览则全出血，不加）。
  return (
    <ConfigProvider locale={DOCS_LOCALE === "en" ? enUS : zhCN}>
      <div className="px-6 py-12">{preview()}</div>
    </ConfigProvider>
  );
}
