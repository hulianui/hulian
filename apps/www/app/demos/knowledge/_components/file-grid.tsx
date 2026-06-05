"use client";
import { useEffect, useState } from "react";
import {
  File as FileIcon,
  FileArchive,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileType,
  Folder,
  FolderInput,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import {
  Button,
  Checkbox,
  Empty,
  ImageViewer,
  Popconfirm,
  Tag,
  toast,
  type ImageViewerImage,
} from "@hulianui/ui";
import { useKnowledge } from "./knowledge-shell";
import type { VaultNode } from "../_data/types";

function formatSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// 按扩展名映射文件图标 + 语义色（纯函数，好测）。颜色优先吃语义 token；
// 紫/青无对应 token，用项目已在用的标准 Tailwind 色（text-violet-600 / text-teal-600）。
export function fileIconMeta(name: string): { Icon: LucideIcon; className: string } {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  switch (ext) {
    case "md":
    case "markdown":
    case "doc":
    case "docx":
      return { Icon: FileText, className: "text-primary" };
    case "pdf":
      return { Icon: FileType, className: "text-danger" };
    case "xls":
    case "xlsx":
    case "csv":
      return { Icon: FileSpreadsheet, className: "text-success" };
    case "ppt":
    case "pptx":
      return { Icon: FileType, className: "text-warning" };
    case "zip":
    case "rar":
    case "7z":
      return { Icon: FileArchive, className: "text-warning" };
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "svg":
    case "webp":
      return { Icon: FileImage, className: "text-violet-600" };
    case "json":
    case "ts":
    case "tsx":
    case "js":
    case "css":
    case "html":
      return { Icon: FileCode, className: "text-teal-600" };
    default:
      return { Icon: FileIcon, className: "text-muted" };
  }
}

// 卡片缩略：图片显原图，文件夹固定 Folder，其余按扩展名取图标 + 语义色。
function NodeThumb({ node }: { node: VaultNode }) {
  if (node.kind === "image" && node.src) {
    return <img src={node.src} alt={node.name} className="size-full object-cover" />;
  }
  if (node.kind === "folder") {
    return <Folder className="size-10 text-primary/70" />;
  }
  const { Icon, className } = fileIconMeta(node.name);
  return <Icon className={`size-10 ${className}`} />;
}

export function FileGrid({ folderId }: { folderId: string | null }) {
  const { v, select, picked, setPicked, openMove } = useKnowledge();
  const items = v.childrenOf(folderId);
  const images = items.filter((n) => n.kind === "image");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  // 切换文件夹清空多选。
  useEffect(() => setPicked([]), [folderId, setPicked]);

  const viewerImages: ImageViewerImage[] = images.map((n) => ({ src: n.src!, alt: n.name, caption: `${n.name} · ${formatSize(n.size)}` }));

  const toggle = (id: string, checked: boolean) =>
    setPicked(checked ? [...picked, id] : picked.filter((x) => x !== id));

  const openImage = (node: VaultNode) => {
    const idx = images.findIndex((n) => n.id === node.id);
    if (idx >= 0) {
      setViewerIndex(idx);
      setViewerOpen(true);
    }
  };

  const onCardOpen = (node: VaultNode) => {
    if (node.kind === "folder" || node.kind === "doc") select(node.id);
    else if (node.kind === "image") openImage(node);
    else toast({ title: "暂不支持预览此文件类型", description: node.name, tone: "neutral" });
  };

  const batchDelete = () => {
    const n = picked.length;
    picked.forEach((id) => v.remove(id));
    setPicked([]);
    toast({ title: `已删除 ${n} 项`, tone: "info" });
  };

  if (items.length === 0) {
    return (
      <div className="grid h-full place-items-center p-8">
        <Empty title="此文件夹为空" description="右键目录树新建文档 / 文件夹，或拖文件到左下角上传区。">
          <Button size="sm" variant="outline" onClick={() => { const { id, res } = v.createDoc(folderId); toast({ title: res.message, tone: "info" }); select(id); }}>
            新建文档
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* 多选操作条 */}
      {picked.length > 0 && (
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-surface px-5 py-2 text-sm">
          <span className="text-muted">已选 {picked.length} 项</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => openMove(picked)}>
              <FolderInput className="size-4" /> 批量移动
            </Button>
            <Popconfirm title={`删除选中的 ${picked.length} 项？`} description="此操作不可撤销。" danger okText="删除" onConfirm={batchDelete}>
              <Button size="sm" variant="ghost" className="text-danger hover:bg-danger/10">
                <Trash2 className="size-4" /> 批量删除
              </Button>
            </Popconfirm>
          </div>
        </div>
      )}

      <div className="grid flex-1 content-start gap-3 overflow-y-auto p-5 [grid-template-columns:repeat(auto-fill,minmax(150px,1fr))]">
        {items.map((node) => {
          const checked = picked.includes(node.id);
          return (
            <div
              key={node.id}
              className="group relative overflow-hidden rounded-[var(--radius)] border border-border bg-surface transition-colors hover:border-primary/50"
            >
              <span className="absolute left-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100 data-[on=true]:opacity-100" data-on={checked}>
                <Checkbox checked={checked} onCheckedChange={(c) => toggle(node.id, c)} aria-label={`选择 ${node.name}`} />
              </span>
              <button
                type="button"
                onClick={() => onCardOpen(node)}
                className="flex w-full flex-col text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                <span className="grid aspect-[4/3] place-items-center overflow-hidden bg-surface-hover">
                  <NodeThumb node={node} />
                </span>
                <span className="flex flex-col gap-0.5 px-2.5 py-2">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-medium">{node.name}</span>
                    {node.status === "added" && <Tag size="sm" tone="success">新</Tag>}
                  </span>
                  <span className="truncate text-xs text-muted">
                    {node.kind === "folder" ? `${v.childrenOf(node.id).length} 项` : `${node.author} · ${node.updatedAt}`}
                    {node.size ? ` · ${formatSize(node.size)}` : ""}
                  </span>
                </span>
              </button>
            </div>
          );
        })}
      </div>

      <ImageViewer open={viewerOpen} onOpenChange={setViewerOpen} images={viewerImages} index={viewerIndex} onIndexChange={setViewerIndex} />
    </div>
  );
}
