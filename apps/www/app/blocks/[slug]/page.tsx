import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blocks, getBlock } from "../_registry";
import { PreviewViewer } from "../../../components/preview-viewer";
import { InstallPanel } from "../../../components/install-panel";
import { buildInstallModel, depNameOf } from "../../../lib/install-model";
import { readDepTitles, readRegistryItem, readRegistryMeta } from "../../../lib/registry-source";

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
  if (!b) notFound();

  const source = readBlockSource(b.file);

  // 安装信息读站点自己产出的 /r/block-<slug>.json —— 与 shadcn CLI 拉到的是同一份字节。
  const item = readRegistryItem(`block-${slug}`);
  const registry = readRegistryMeta();
  const model = buildInstallModel(
    item,
    registry,
    readDepTitles((item.registryDependencies ?? []).map(depNameOf)),
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{b.name}</h1>
        <p className="mt-1 text-sm text-muted">{b.description}</p>
      </header>
      <PreviewViewer
        src={`/preview/blocks/${slug}`}
        code={source}
        title={b.name}
        files={model.targets.map((path) => ({ path, note: "本区块" }))}
      />
      <InstallPanel model={model} kind="block" />
    </div>
  );
}
