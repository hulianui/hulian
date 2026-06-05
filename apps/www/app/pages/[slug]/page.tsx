import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pages, pagePreviews, getPage } from "../_registry";
import { PageView } from "../_page-view";

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
  return { title: p ? `${p.name} · 页面 · 瑚琏 Hulian` : "页面 · 瑚琏 Hulian" };
}

// 读取页面组合的真实源文件作为可复制源码。server 组件在构建期(output:export)执行 fs。
function readPageSource(file: string): string {
  return readFileSync(join(process.cwd(), "app/pages/_pages", file), "utf8");
}

export default async function PageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getPage(slug);
  const preview = pagePreviews[slug];
  if (!p || !preview) notFound();

  const source = readPageSource(p.file);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">{p.name}</h1>
        <p className="mt-1 text-sm text-muted">{p.description}</p>
      </header>
      <PageView code={source}>{preview()}</PageView>
    </div>
  );
}
