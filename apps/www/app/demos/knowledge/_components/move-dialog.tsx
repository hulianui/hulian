"use client";
import { copy } from "./move-dialog.content";
import { useMemo, useState } from "react";
import { Button, Drawer, DrawerContent, TreeSelect, type TreeNode } from "@hulianui/ui";
import { useKnowledge } from "./knowledge-shell";

const ROOT_KEY = "__root__";

export function MoveDialog({
  ids,
  onClose,
  onConfirm,
}: {
  ids: string[] | null;
  onClose: () => void;
  onConfirm: (ids: string[], targetFolderId: string | null) => void;
}) {
  const { v } = useKnowledge();
  const open = ids != null;
  const [target, setTarget] = useState<string>(ROOT_KEY);

  // 被移动项及其子孙不能作为目标（防移入自身）。
  const excluded = useMemo(() => {
    const set = new Set<string>(ids ?? []);
    let grew = true;
    while (grew) {
      grew = false;
      for (const n of v.list) {
        if (n.parentId && set.has(n.parentId) && !set.has(n.id)) {
          set.add(n.id);
          grew = true;
        }
      }
    }
    return set;
  }, [ids, v.list]);

  // 文件夹层级 → TreeSelect 的 TreeNode[]，附「根目录」顶项。
  const folderTree = useMemo<TreeNode[]>(() => {
    const build = (parentId: string | null): TreeNode[] =>
      v.list
        .filter((n) => n.kind === "folder" && n.parentId === parentId && !excluded.has(n.id))
        .sort((a, b) => a.name.localeCompare(b.name, "zh"))
        .map((n) => ({ key: n.id, label: n.name, children: build(n.id) }));
    return [{ key: ROOT_KEY, label: copy("hankuRootDirectory"), children: build(null) }];
  }, [v.list, excluded]);

  const count = ids?.length ?? 0;
  const names = (ids ?? []).map((id) => v.get(id)?.name).filter(Boolean);

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent
        side="right"
        title={copy("moveItemCountTitle", count)}
        description={copy("selectTheDestinationFolderAndTheMovedItemsWillBe")}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              {copy("cancel")}
            </Button>
            <Button
              size="sm"
              onClick={() => onConfirm(ids ?? [], target === ROOT_KEY ? null : target)}
            >
              {copy("moveHere")}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="rounded-[var(--radius)] border border-border bg-surface-hover/40 px-3 py-2 text-sm">
            <p className="mb-1 text-xs text-muted">{copy("toBeMoved")}</p>
            <p className="line-clamp-3">{names.join(copy("itemNameSeparator"))}</p>
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium">{copy("destinationFolder")}</p>
            <TreeSelect
              nodes={folderTree}
              value={target}
              onChange={(val) => setTarget(val as string)}
              searchable
              showLine
              placeholder={copy("selectDestinationFolder")}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
