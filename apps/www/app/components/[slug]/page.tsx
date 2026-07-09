import type { Metadata } from "next";
import { manifest } from "../../../lib/manifest";
import { SITE_URL, SITE_NAME } from "../../../lib/site";
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
  if (!meta) return { title: "组件 · 瑚琏 Hulian" };
  const title = `${meta.name} · 瑚琏 Hulian`;
  // 每页独立 description：复用 manifest 里组件的真实用途文案，杜绝全站雷同。
  const description = `${meta.description} —— 瑚琏 Hulian React 组件库，含用法示例、Props 说明与可复制源码。`;
  const path = `/components/${slug}`;
  return {
    title,
    description,
    // canonical 回指主站权威域，收敛主站/镜像重复内容权重。
    alternates: { canonical: path },
    // images 显式带上文件约定的分享图，否则子页 openGraph 会覆盖掉继承的自动图。
    // 未设 twitter → 继承 layout 的 summary_large_image 卡片，标题/描述/图片回落到 og。
    openGraph: { type: "article", title, description, url: path, images: ["/opengraph-image.png"] },
  };
}

export default async function ComponentSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = manifest.find((m) => m.slug === slug);
  // 结构化数据：让搜索引擎/AI 把这页识别为「某组件的技术文档」，含面包屑。
  const jsonLd = meta
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "TechArticle",
            headline: `${meta.name} 组件 · 瑚琏 Hulian`,
            description: meta.description,
            url: `${SITE_URL}/components/${slug}`,
            inLanguage: "zh-CN",
            isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "组件", item: `${SITE_URL}/components` },
              { "@type": "ListItem", position: 2, name: meta.name, item: `${SITE_URL}/components/${slug}` },
            ],
          },
        ],
      }
    : null;
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ComponentDoc
        slug={slug}
        doc={loadComponentDoc(slug)}
        copyMd={loadComponentMarkdownForCopy(slug)}
      />
    </>
  );
}
