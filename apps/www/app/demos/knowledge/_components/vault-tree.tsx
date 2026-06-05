"use client";
import { useState } from "react";
import { FilePlus2, FolderPlus, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  Button,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  Dialog,
  DialogClose,
  DialogContent,
  FileTree,
  Input,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Upload,
  toast,
  type FileNode,
  type UploadFile,
} from "@hulian/ui";
import { usePending } from "../../lib/async";
import { useKnowledge } from "./knowledge-shell";

const cancelCls =
  "inline-flex h-8 items-center rounded-[var(--radius)] border border-border bg-surface px-3 text-sm text-foreground outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring";
const dangerCls =
  "inline-flex h-8 items-center rounded-[var(--radius)] bg-danger px-3 text-sm font-medium text-danger-foreground outline-none transition-colors hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring";

export function VaultTree() {
  const { v, selectedId, select, openMove } = useKnowledge();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploadList, setUploadList] = useState<UploadFile[]>([]);
  const [pending, run] = usePending();

  const selectedPath = selectedId ? v.pathOfId.get(selectedId) : undefined;
  const activeNode = activeId ? v.get(activeId) : undefined;

  // 新建项落点：选中文件夹 → 其内；选中文件/文档 → 其父；否则根。
  const targetFolderFor = (id: string | null): string | null => {
    const n = id ? v.get(id) : undefined;
    if (!n) return null;
    return n.kind === "folder" ? n.id : n.parentId;
  };

  const onTreeSelect = (_node: FileNode, path: string) => {
    const id = v.idOfPath.get(path);
    if (id) select(id);
  };

  const onTreeContextMenu = (_node: FileNode, path: string) => {
    setActiveId(v.idOfPath.get(path) ?? null);
  };

  const doCreateDoc = (parentId: string | null) => {
    const { id, res } = v.createDoc(parentId);
    toast({ title: res.message, description: res.detail, tone: "info" });
    select(id);
  };
  const doCreateFolder = (parentId: string | null) => {
    const { res } = v.createFolder(parentId);
    toast({ title: res.message, description: res.detail, tone: "info" });
  };

  const confirmRename = () => {
    if (!renameId || !renameValue.trim()) {
      toast({ title: "名称不能为空", tone: "danger" });
      return;
    }
    const res = v.rename(renameId, renameValue.trim());
    toast({ title: res.message, description: res.detail, tone: "info" });
    setRenameId(null);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    const res = v.remove(deleteId);
    toast({ title: res.message, description: res.detail, tone: res.ok ? "info" : "danger" });
    if (deleteId === selectedId) select(null);
    setDeleteId(null);
  };

  const onUploadSelect = (files: File[]) => {
    const parentId = targetFolderFor(selectedId);
    // 先以 uploading 态展示进度帧
    const items: UploadFile[] = files.map((f, i) => ({
      id: `u${i}-${f.name}`,
      name: f.name,
      size: f.size,
      status: "uploading",
      progress: 40,
    }));
    setUploadList(items);
    void run(async () => {
      const { res } = v.upload(
        parentId,
        files.map((f) => ({ name: f.name, size: f.size, isImage: /\.(png|jpe?g|gif|webp|svg)$/i.test(f.name) })),
      );
      setUploadList(items.map((it) => ({ ...it, status: "success", progress: 100 })));
      toast({ title: res.message, tone: "info" });
      setTimeout(() => setUploadList([]), 1500);
    });
  };

  const newItemTarget = targetFolderFor(selectedId);

  return (
    <aside className="flex min-h-0 flex-col border-r border-border bg-bg">
      <div className="flex shrink-0 items-center justify-between px-3 py-2.5">
        <span className="text-sm font-semibold tracking-tight">目录</span>
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="sm" className="size-8 px-0" aria-label="新建文档" onClick={() => doCreateDoc(newItemTarget)}>
                  <FilePlus2 className="size-[18px]" />
                </Button>
              }
            />
            <TooltipContent>新建文档</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="sm" className="size-8 px-0" aria-label="新建文件夹" onClick={() => doCreateFolder(newItemTarget)}>
                  <FolderPlus className="size-[18px]" />
                </Button>
              }
            />
            <TooltipContent>新建文件夹</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        <ContextMenu>
          <ContextMenuTrigger>
            <FileTree
              nodes={v.fileNodes}
              searchable
              searchPlaceholder="搜索文件 / 文档"
              selectedPath={selectedPath}
              onSelect={onTreeSelect}
              onContextMenu={onTreeContextMenu}
            />
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={() => doCreateDoc(activeNode?.kind === "folder" ? activeNode.id : (activeNode?.parentId ?? null))}>
              新建文档
            </ContextMenuItem>
            <ContextMenuItem onClick={() => doCreateFolder(activeNode?.kind === "folder" ? activeNode.id : (activeNode?.parentId ?? null))}>
              新建文件夹
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              disabled={!activeNode}
              onClick={() => {
                if (!activeNode) return;
                setRenameValue(activeNode.name);
                setRenameId(activeNode.id);
              }}
            >
              重命名
            </ContextMenuItem>
            <ContextMenuItem disabled={!activeNode} onClick={() => activeNode && openMove([activeNode.id])}>
              移动到…
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem variant="danger" disabled={!activeNode} onClick={() => activeNode && setDeleteId(activeNode.id)}>
              删除
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>

      <div className="shrink-0 border-t border-border p-3">
        <Upload
          accept="image/*,.pdf,.md,.zip"
          multiple
          variant="dropzone"
          files={uploadList}
          onSelect={onUploadSelect}
          onReject={(rej) => toast({ title: `${rej.length} 个文件被拒绝`, description: "类型或大小不符", tone: "danger" })}
          label={pending ? "上传中…" : "拖拽文件到此或点击上传"}
          hint="支持图片 / PDF / Markdown，单文件 ≤ 10MB"
        />
        {pending && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
            <Loader2 className="size-3.5 animate-spin" /> 正在上传到「{v.get(newItemTarget)?.name ?? "根目录"}」
          </p>
        )}
      </div>

      {/* 重命名对话框（受控） */}
      <Dialog open={renameId != null} onOpenChange={(o) => !o && setRenameId(null)}>
        <DialogContent title="重命名" description="为该文档或文件夹输入新名称。">
          <div className="space-y-4">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="新名称"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && confirmRename()}
            />
            <div className="flex justify-end gap-2">
              <DialogClose className={cancelCls}>取消</DialogClose>
              <Button size="sm" onClick={confirmRename}>
                确认
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 删除二次确认（重操作 → AlertDialog） */}
      <AlertDialog open={deleteId != null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent
          title={`删除「${deleteId ? v.get(deleteId)?.name : ""}」？`}
          description="文件夹内所有子项会一并删除，此操作不可撤销。"
        >
          <AlertDialogClose className={cancelCls}>取消</AlertDialogClose>
          <AlertDialogClose className={dangerCls} onClick={confirmDelete}>
            删除
          </AlertDialogClose>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
}
