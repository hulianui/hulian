import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pages, getPage } from "../_registry";
import { PreviewViewer } from "../../../components/preview-viewer";
import { InstallPanel } from "../../../components/install-panel";
import { buildInstallModel, depNameOf } from "../../../lib/install-model";
import {
  readDepFiles,
  readDepTitles,
  readRegistryItem,
  readRegistryMeta,
} from "../../../lib/registry-source";

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
  if (!p) return { title: "页面 · 瑚琏 Hulian" };
  const title = `${p.name} · 页面 · 瑚琏 Hulian`;
  const description = `${p.description} —— 瑚琏 Hulian 整页模板，多区块拼装，可复制源码。`;
  const path = `/pages/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "article", title, description, url: path, images: ["/opengraph-image.png"] },
  };
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
  if (!p) notFound();

  const source = readPageSource(p.file);

  // 安装信息读站点自己产出的 /r/page-<slug>.json —— 与 shadcn CLI 拉到的是同一份字节。
  const item = readRegistryItem(`page-${slug}`);
  const registry = readRegistryMeta();
  const model = buildInstallModel(
    item,
    registry,
    readDepTitles((item.registryDependencies ?? []).map(depNameOf)),
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      <header>
        <h1 className="text-2xl font-semibold">{p.name}</h1>
        <p className="mt-1 text-sm text-muted">{p.description}</p>
      </header>
      <PreviewViewer
        src={`/preview/pages/${slug}`}
        code={source}
        title={p.name}
        height={780}
        // 文件树：本页在前，递归区块在后 —— 装完工程里会多出来的就是这些。
        files={[
          ...model.targets.map((path) => ({ path, note: "本页" })),
          ...readDepFiles(model.registryDeps.map((d) => d.name)).flatMap((dep) =>
            dep.targets.map((path) => ({ path, note: `依赖 · ${dep.title}` })),
          ),
        ]}
      />
      <InstallPanel model={model} kind="page" />
    </div>
  );
}
