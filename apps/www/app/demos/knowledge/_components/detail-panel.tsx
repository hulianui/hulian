"use client";
import { copy } from "./detail-panel.content";
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

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
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
          <Empty
            size="sm"
            title={copy("details")}
            description={copy("selectADocumentOrFileToViewCollaboratorsVersionsAnd")}
          />
        </div>
      </aside>
    );
  }

  const collaborators = node.collaborators ?? [];
  const avatars: AvatarCirclesItem[] = collaborators
    .slice(0, 5)
    .map((name) => ({ src: avatarOf(name), alt: name }));
  const versions = versionsOf(node.id);

  const openCollab = () => {
    setCollabKeys(collaborators.map((n) => `m-${n}`));
    setCollabOpen(true);
  };
  const memberItems: TransferItem[] = MEMBERS.map((m) => ({
    key: `m-${m.name}`,
    label: m.name,
    description: m.role,
  }));
  const saveCollab = () => {
    const names = collabKeys.map((k) => k.replace(/^m-/, ""));
    v.updateCollaborators(node.id, names);
    setCollabOpen(false);
    toast({
      title: copy("updatedCollaborators"),
      description: copy("memberCount", names.length),
      tone: "info",
    });
  };

  const removeTag = (t: string) => {
    v.updateTags(
      node.id,
      (node.tags ?? []).filter((x) => x !== t),
    );
    toast({ title: copy("tagRemoved"), description: t, tone: "info" });
  };
  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if ((node.tags ?? []).includes(t)) {
      toast({ title: copy("tagAlreadyExists"), tone: "danger" });
      return;
    }
    v.updateTags(node.id, [...(node.tags ?? []), t]);
    setTagInput("");
    setAdding(false);
    toast({ title: copy("labelAdded"), description: t, tone: "info" });
  };

  return (
    <aside className="min-h-0 overflow-y-auto border-l border-border bg-bg">
      <div className="space-y-5 p-4">
        {/* 基本信息 */}
        <div>
          <h2 className="truncate text-base font-semibold tracking-tight">{node.name}</h2>
          <dl className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">{copy("type")}</dt>
              <dd>
                {
                  (
                    {
                      folder: copy("folder"),
                      doc: copy("document"),
                      image: copy("image"),
                      file: copy("file"),
                    } as const
                  )[node.kind]
                }
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">{copy("creator")}</dt>
              <dd>{node.author}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">{copy("lastModified")}</dt>
              <dd className="tabular-nums">{node.updatedAt}</dd>
            </div>
          </dl>
        </div>

        {/* 协作者 */}
        <Section
          title={copy("collaborators")}
          action={
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              onClick={openCollab}
            >
              <Users className="size-3.5" /> {copy("manage")}
            </Button>
          }
        >
          {avatars.length > 0 ? (
            <AvatarCircles
              avatars={avatars}
              extraCount={Math.max(0, collaborators.length - 5)}
              size="sm"
            />
          ) : (
            <p className="text-sm text-muted-foreground">{copy("noCollaboratorsYet")}</p>
          )}
        </Section>

        {/* 标签 */}
        <Section
          title={copy("tag")}
          action={
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              onClick={() => setAdding((a) => !a)}
            >
              <Plus className="size-3.5" /> {copy("tag")}
            </Button>
          }
        >
          <div className="flex flex-wrap gap-1.5">
            {(node.tags ?? []).map((t) => (
              <Tag key={t} tone="brand" onClose={() => removeTag(t)}>
                {t}
              </Tag>
            ))}
            {(node.tags ?? []).length === 0 && !adding && (
              <span className="text-sm text-muted-foreground">{copy("noTags")}</span>
            )}
          </div>
          {adding && (
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder={copy("tagName")}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && addTag()}
              />
              <Button size="sm" onClick={addTag}>
                {copy("add")}
              </Button>
            </div>
          )}
        </Section>

        {/* 版本历史 */}
        <Section title={copy("versionHistory")}>
          <Timeline
            items={versions.map((ver, i) => ({
              color: i === 0 ? "primary" : "default",
              label: ver.at,
              children: (
                <div className="text-sm">
                  <span className="font-medium">{ver.rev}</span>
                  <span className="text-muted-foreground"> · {ver.author}</span>
                  <p className="text-muted-foreground">{ver.note}</p>
                </div>
              ),
            }))}
          />
        </Section>

        {/* 访问权限 */}
        <Section title={copy("access")}>
          <p className="mb-2 text-xs text-muted-foreground">
            {copy("checkTheDepartmentsMembersParentChildCascadeThatHaveAccess")}
          </p>
          <div className="rounded-[var(--radius)] border border-border bg-surface p-2">
            <Tree
              key={node.id}
              nodes={ORG_TREE}
              checkable
              defaultExpandedKeys={["rd", "design"]}
              defaultCheckedKeys={["rd-fe"]}
              onCheck={(info) =>
                toast({
                  title: copy("accessUpdated"),
                  description: copy("selectedNodeCount", info.checkedKeys.length),
                  tone: "info",
                })
              }
            />
          </div>
        </Section>
      </div>

      {/* 协作者管理（Transfer） */}
      <Dialog open={collabOpen} onOpenChange={setCollabOpen}>
        <DialogContentCollab
          keys={collabKeys}
          setKeys={setCollabKeys}
          items={memberItems}
          onCancelCls={cancelCls}
          onSave={saveCollab}
        />
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
    <DialogContent
      title={copy("manageCollaborators")}
      description={copy("addMembersToTheCollaboratorsOnTheRightToCollaborate")}
    >
      <div className="space-y-4">
        <Transfer
          dataSource={items}
          targetKeys={keys}
          onChange={(next) => setKeys(next)}
          titles={[copy("allMembers"), copy("collaborators")]}
          searchable
          searchPlaceholder={copy("searchMembers")}
        />
        <div className="flex justify-end gap-2">
          <DialogClose className={onCancelCls}>{copy("cancel")}</DialogClose>
          <Button size="sm" onClick={onSave}>
            {copy("save")}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
