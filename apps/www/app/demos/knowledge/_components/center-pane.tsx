"use client";
import { Breadcrumb, Segmented } from "@hulianui/ui";
import type { BreadcrumbItem } from "@hulianui/ui";
import { useKnowledge, NothingSelected } from "./knowledge-shell";
import { DocEditor } from "./doc-editor";
import { FileGrid } from "./file-grid";

export function CenterPane() {
  const { v, selectedId, viewMode, setViewMode } = useKnowledge();
  const node = selectedId ? v.get(selectedId) : undefined;

  if (!node) {
    return (
      <section className="min-h-0">
        <NothingSelected hint="选择左侧文档查看 / 编辑，或选择文件夹浏览内容" />
      </section>
    );
  }

  // 面包屑：瀚库根 + 从根到当前节点的链路（展示当前位置，最后一项为当前页）。
  const chain = v.breadcrumbOf(node.id);
  const crumbs: BreadcrumbItem[] = [
    { label: "瀚库" },
    ...chain.map((n, i) => ({ label: n.name, current: i === chain.length - 1 })),
  ];

  const isFolder = node.kind === "folder";
  const folderId = isFolder ? node.id : node.parentId;
  // 文档节点 → 文档模式；文件夹 → 按 viewMode（文件网格 / landing 说明文档）。
  const showDoc = node.kind === "doc" || (isFolder && viewMode === "doc");

  return (
    <section className="flex min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-5 py-2.5">
        <Breadcrumb items={crumbs} className="min-w-0 [&_*]:truncate" />
        {isFolder && (
          <Segmented
            size="sm"
            value={viewMode}
            onValueChange={(val) => setViewMode(val as typeof viewMode)}
            items={[
              { value: "file", label: "文件" },
              { value: "doc", label: "说明文档" },
            ]}
            aria-label="中栏视图模式"
          />
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {showDoc ? <DocEditor nodeId={node.id} /> : <FileGrid folderId={folderId} />}
      </div>
    </section>
  );
}
