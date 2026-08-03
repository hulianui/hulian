import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getIntlayer } from "next-intlayer";
import { pages, getPage, pageMeta } from "../_registry";
import { PreviewViewer } from "../../../components/preview-viewer";
import { InstallPanel } from "../../../components/install-panel";
import { buildInstallModel, depNameOf } from "../../../lib/install-model";
import {
  readDepFiles,
  readDepTitles,
  readRegistryItem,
  readRegistryMeta,
} from "../../../lib/registry-source";
import { DOCS_LOCALE, withDocsBasePath } from "../../../lib/docs-locale";
import { blockMetaEn } from "../../../i18n/block-meta.en";
import englishSources from "../page-fixture-sources.en.json";

const content = getIntlayer("pages", DOCS_LOCALE).detail;

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
  if (!p) return { title: content.metadataFallback };
  const display = pageMeta(p);
  const title = content.metadataTitle.replace("{name}", display.name);
  const description = content.metadataDescription.replace("{description}", display.description);
  const barePath = `/pages/${slug}`;
  const path = withDocsBasePath(barePath);
  const englishPath = withDocsBasePath(barePath, "en");
  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: { "zh-CN": barePath, en: englishPath, "x-default": englishPath },
    },
    openGraph: { type: "article", title, description, url: path, images: ["/opengraph-image.png"] },
  };
}

// 读取页面组合的真实源文件作为可复制源码。server 组件在构建期(output:export)执行 fs。
function readPageSource(file: string): string {
  if (DOCS_LOCALE === "en") {
    const source = englishSources[file as keyof typeof englishSources];
    if (!source) throw new Error(`Missing English page source: ${file}`);
    return source;
  }
  return readFileSync(join(process.cwd(), "app/pages/_pages", file), "utf8");
}

function localizedDependencyTitle(name: string, fallback: string): string {
  if (DOCS_LOCALE !== "en" || !name.startsWith("block-")) return fallback;
  return blockMetaEn[name.slice("block-".length)]?.name ?? fallback;
}

export default async function PageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getPage(slug);
  if (!p) notFound();
  const display = pageMeta(p);

  const source = readPageSource(p.file);

  // 安装信息读站点自己产出的 /r/page-<slug>.json —— 与 shadcn CLI 拉到的是同一份字节。
  const item = readRegistryItem(`page-${slug}`);
  const registry = readRegistryMeta();
  const dependencyNames = (item.registryDependencies ?? []).map(depNameOf);
  const dependencyTitles = readDepTitles(dependencyNames);
  if (DOCS_LOCALE === "en") {
    for (const name of dependencyNames) {
      dependencyTitles[name] = localizedDependencyTitle(name, dependencyTitles[name] ?? name);
    }
  }
  const model = buildInstallModel(item, registry, dependencyTitles);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      <header>
        <h1 className="text-2xl font-semibold">{display.name}</h1>
        <p className="mt-1 text-sm text-muted">{display.description}</p>
      </header>
      <PreviewViewer
        src={`/preview/pages/${slug}`}
        code={source}
        title={display.name}
        height={780}
        // 文件树：本页在前，递归区块在后 —— 装完工程里会多出来的就是这些。
        files={[
          ...model.targets.map((path) => ({ path, note: content.fileNote })),
          ...readDepFiles(model.registryDeps.map((d) => d.name)).flatMap((dep) =>
            dep.targets.map((path) => ({
              path,
              note: content.dependencyNote.replace(
                "{title}",
                localizedDependencyTitle(dep.name, dep.title),
              ),
            })),
          ),
        ]}
      />
      <InstallPanel model={model} kind="page" />
    </div>
  );
}
