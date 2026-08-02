import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getIntlayer } from "next-intlayer";
import { pages, pagePreviews, getPage, pageMeta } from "../../../pages/_registry";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";
import { ConfigProvider, enUS, zhCN } from "@hulianui/ui";

const content = getIntlayer("preview", DOCS_LOCALE);

export function generateStaticParams() {
  return pages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getPage(slug);
  const name = p ? pageMeta(p).name : null;
  return {
    title: name ? content.metadataTitle.replace("{name}", name) : content.metadataFallback,
    robots: { index: false, follow: false },
  };
}

export default async function PagePreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const preview = pagePreviews[slug];
  if (!getPage(slug) || !preview) notFound();
  return <ConfigProvider locale={DOCS_LOCALE === "en" ? enUS : zhCN}>{preview()}</ConfigProvider>;
}
