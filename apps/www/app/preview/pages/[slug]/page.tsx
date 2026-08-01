import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pages, pagePreviews, getPage } from "../../../pages/_registry";

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
  return {
    title: p ? `${p.name} · 预览 · 瑚琏 Hulian` : "预览 · 瑚琏 Hulian",
    robots: { index: false, follow: false },
  };
}

export default async function PagePreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const preview = pagePreviews[slug];
  if (!getPage(slug) || !preview) notFound();
  return <>{preview()}</>;
}
