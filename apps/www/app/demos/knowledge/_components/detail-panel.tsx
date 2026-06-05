"use client";
import { useState } from "react";
import { Plus, Users } from "lucide-react";
import {
  AvatarCircles,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  Empty,
  Input,
  Timeline,
  Tag,
  Transfer,
  Tree,
  toast,
  type AvatarCirclesItem,
  type TransferItem,
} from "@hulianui/ui";
import { useKnowledge } from "./knowledge-shell";
import { versionsOf } from "../_data/vault";
import { COLLABORATORS, MEMBERS, ORG_TREE } from "../_data/org";

const cancelCls =
  "inline-flex h-8 items-center rounded-[var(--radius)] border border-border bg-surface px-3 text-sm text-foreground outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring";

// 无本地头像的成员 → 程序化首字母圆头像（零外链）。
function initialAvatar(name: string): string {
  const ch = name.slice(0, 1);
  const hue = (name.charCodeAt(0) * 37) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" rx="32" fill="hsl(${hue} 50% 50%)"/><text x="32" y="42" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#fff">${ch}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
const avatarOf = (name: string) => COLLABORATORS[name]?.avatar ?? initialAvatar(name);

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export function DetailPanel() {
  const { v, selectedId } = useKnowledge();
  const node = selectedId ? v.get(selectedId) : undefined;

  const [collabOpen, setCollabOpen] = useState(false);
  const [collabKeys, setCollabKeys] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [adding, setAdding] = useState(false);

  if (!node) {
    return (
      <aside className="border-l border-border bg-bg">
        <div className="grid h-full place-items-center p-6">
          <Empty size="sm" title="详情" description="选择一个文档或文件查看协作者、版本与权限。" />
        </div>
      </aside>
    );
  }

  const collaborators = node.collaborators ?? [];
  const avatars: AvatarCirclesItem[] = collaborators.slice(0, 5).map((name) => ({ src: avatarOf(name), alt: name }));
  const versions = versionsOf(node.id);

  const openCollab = () => {
    setCollabKeys(collaborators.map((n) => `m-${n}`));
    setCollabOpen(true);
  };
  const memberItems: TransferItem[] = MEMBERS.map((m) => ({ key: `m-${m.name}`, label: m.name, description: m.role }));
  const saveCollab = () => {
    const names = collabKeys.map((k) => k.replace(/^m-/, ""));
    v.updateCollaborators(node.id, names);
    setCollabOpen(false);
    toast({ title: "已更新协作者", description: `${names.length} 人`, tone: "info" });
  };

  const removeTag = (t: string) => {
    v.updateTags(node.id, (node.tags ?? []).filter((x) => x !== t));
    toast({ title: "已移除标签", description: t, tone: "info" });
  };
  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if ((node.tags ?? []).includes(t)) {
      toast({ title: "标签已存在", tone: "danger" });
      return;
    }
    v.updateTags(node.id, [...(node.tags ?? []), t]);
    setTagInput("");
    setAdding(false);
    toast({ title: "已添加标签", description: t, tone: "info" });
  };

  return (
    <aside className="min-h-0 overflow-y-auto border-l border-border bg-bg">
      <div className="space-y-5 p-4">
        {/* 基本信息 */}
        <div>
          <h2 className="truncate text-base font-semibold tracking-tight">{node.name}</h2>
          <dl className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-muted">类型</dt>
              <dd>{({ folder: "文件夹", doc: "文档", image: "图片", file: "文件" } as const)[node.kind]}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted">创建者</dt>
              <dd>{node.author}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted">最后修改</dt>
              <dd className="tabular-nums">{node.updatedAt}</dd>
            </div>
          </dl>
        </div>

        {/* 协作者 */}
        <Section
          title="协作者"
          action={
            <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={openCollab}>
              <Users className="size-3.5" /> 管理
            </Button>
          }
        >
          {avatars.length > 0 ? (
            <AvatarCircles avatars={avatars} extraCount={Math.max(0, collaborators.length - 5)} size="sm" />
          ) : (
            <p className="text-sm text-muted">暂无协作者</p>
          )}
        </Section>

        {/* 标签 */}
        <Section
          title="标签"
          action={
            <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={() => setAdding((a) => !a)}>
              <Plus className="size-3.5" /> 标签
            </Button>
          }
        >
          <div className="flex flex-wrap gap-1.5">
            {(node.tags ?? []).map((t) => (
              <Tag key={t} tone="brand" onClose={() => removeTag(t)}>
                {t}
              </Tag>
            ))}
            {(node.tags ?? []).length === 0 && !adding && <span className="text-sm text-muted">无标签</span>}
          </div>
          {adding && (
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="标签名"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && addTag()}
              />
              <Button size="sm" onClick={addTag}>
                添加
              </Button>
            </div>
          )}
        </Section>

        {/* 版本历史 */}
        <Section title="版本历史">
          <Timeline
            items={versions.map((ver, i) => ({
              color: i === 0 ? "primary" : "default",
              label: ver.at,
              children: (
                <div className="text-sm">
                  <span className="font-medium">{ver.rev}</span>
                  <span className="text-muted"> · {ver.author}</span>
                  <p className="text-muted">{ver.note}</p>
                </div>
              ),
            }))}
          />
        </Section>

        {/* 访问权限 */}
        <Section title="访问权限">
          <p className="mb-2 text-xs text-muted">勾选可访问该内容的部门 / 成员（父子级联）。</p>
          <div className="rounded-[var(--radius)] border border-border bg-surface p-2">
            <Tree
              key={node.id}
              nodes={ORG_TREE}
              checkable
              defaultExpandedKeys={["rd", "design"]}
              defaultCheckedKeys={["rd-fe"]}
              onCheck={(info) =>
                toast({ title: "已更新访问权限", description: `${info.checkedKeys.length} 个节点`, tone: "info" })
              }
            />
          </div>
        </Section>
      </div>

      {/* 协作者管理（Transfer） */}
      <Dialog open={collabOpen} onOpenChange={setCollabOpen}>
        <DialogContentCollab keys={collabKeys} setKeys={setCollabKeys} items={memberItems} onCancelCls={cancelCls} onSave={saveCollab} />
      </Dialog>
    </aside>
  );
}

// 拆出协作者 Dialog 内容（Transfer 较重，单独成块）。
function DialogContentCollab({
  keys,
  setKeys,
  items,
  onCancelCls,
  onSave,
}: {
  keys: string[];
  setKeys: (k: string[]) => void;
  items: TransferItem[];
  onCancelCls: string;
  onSave: () => void;
}) {
  return (
    <DialogContent title="管理协作者" description="把成员加入右侧「协作者」即可参与该内容协作。">
      <div className="space-y-4">
        <Transfer
          dataSource={items}
          targetKeys={keys}
          onChange={(next) => setKeys(next)}
          titles={["全体成员", "协作者"]}
          searchable
          searchPlaceholder="搜索成员"
        />
        <div className="flex justify-end gap-2">
          <DialogClose className={onCancelCls}>取消</DialogClose>
          <Button size="sm" onClick={onSave}>
            保存
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
