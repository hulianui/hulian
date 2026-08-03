import type { Metadata } from "next";
import { componentMeta, manifest } from "../../../lib/manifest";
import { SITE_URL, SITE_NAME } from "../../../lib/site";
import { DOCS_LOCALE, withDocsBasePath } from "../../../lib/docs-locale";
import { loadComponentDoc, loadComponentMarkdownForCopy } from "../../../lib/load-component-doc";
import { ComponentDoc } from "../../../components/showcase/component-doc";
import { JsonLd } from "../../../components/json-ld";

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
  if (!meta) return { title: DOCS_LOCALE === "en" ? "Components · Hulian" : "组件 · 瑚琏 Hulian" };
  const display = componentMeta(meta);
  const title = `${meta.name} · ${DOCS_LOCALE === "en" ? "Hulian" : "瑚琏 Hulian"}`;
  // 每页独立 description：复用 manifest 里组件的真实用途文案，杜绝全站雷同。
  const description =
    DOCS_LOCALE === "en"
      ? `${display.description} — Hulian React component documentation with examples, props, and copyable source.`
      : `${meta.description} —— 瑚琏 Hulian React 组件库，含用法示例、Props 说明与可复制源码。`;
  const barePath = `/components/${slug}`;
  const path = withDocsBasePath(barePath);
  const englishPath = withDocsBasePath(barePath, "en");
  return {
    title,
    description,
    // canonical 回指主站权威域，收敛主站/镜像重复内容权重。
    alternates: {
      canonical: path,
      languages: { "zh-CN": barePath, en: englishPath, "x-default": englishPath },
    },
    // images 显式带上文件约定的分享图，否则子页 openGraph 会覆盖掉继承的自动图。
    // 未设 twitter → 继承 layout 的 summary_large_image 卡片，标题/描述/图片回落到 og。
    openGraph: { type: "article", title, description, url: path, images: ["/opengraph-image.png"] },
  };
}

export default async function ComponentSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = manifest.find((m) => m.slug === slug);
  const display = meta ? componentMeta(meta) : null;
  const path = withDocsBasePath(`/components/${slug}`);
  const componentsPath = withDocsBasePath("/components");
  const siteName = DOCS_LOCALE === "en" ? "Hulian" : SITE_NAME;
  // 结构化数据：让搜索引擎/AI 把这页识别为「某组件的技术文档」，含面包屑。
  const jsonLd = meta
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "TechArticle",
            headline:
              DOCS_LOCALE === "en"
                ? `${meta.name} component · Hulian`
                : `${meta.name} 组件 · 瑚琏 Hulian`,
            description: display?.description,
            url: `${SITE_URL}${path}`,
            inLanguage: DOCS_LOCALE,
            isPartOf: { "@type": "WebSite", name: siteName, url: SITE_URL },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: DOCS_LOCALE === "en" ? "Components" : "组件",
                item: `${SITE_URL}${componentsPath}`,
              },
              { "@type": "ListItem", position: 2, name: meta.name, item: `${SITE_URL}${path}` },
            ],
          },
        ],
      }
    : null;
  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      <ComponentDoc
        slug={slug}
        doc={loadComponentDoc(slug)}
        copyMd={loadComponentMarkdownForCopy(slug)}
      />
    </>
  );
}
