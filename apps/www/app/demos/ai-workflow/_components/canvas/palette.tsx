import { Plus } from "lucide-react";
import { ScrollArea, Text, cn } from "@hulianui/ui";
import { ACCENT, NODE_KINDS } from "../../_data/node-kinds";
import type { NodeKind } from "../../_data/types";

const GROUPS = ["输入", "生成", "后处理", "输出"] as const;

/** 左侧节点库：按分组列出可添加的节点类型，点击即添加到画布。 */
export function Palette({ onAdd }: { onAdd: (kind: NodeKind) => void }) {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <Text weight="semibold" size="sm">
          节点库
        </Text>
        <Text tone="muted" size="xs" className="mt-0.5">
          点击添加到画布
        </Text>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-3">
          {GROUPS.map((group) => {
            const items = NODE_KINDS.filter((k) => k.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group}>
                <div className="px-1 pb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted">{group}</div>
                <div className="space-y-1.5">
                  {items.map((meta) => {
                    const accent = ACCENT[meta.accent];
                    const Icon = meta.icon;
                    return (
                      <button
                        key={meta.kind}
                        type="button"
                        onClick={() => onAdd(meta.kind)}
                        className={cn(
                          "group flex w-full items-center gap-2.5 rounded-[var(--radius)] border border-border bg-bg px-2.5 py-2 text-left",
                          "transition-colors hover:border-primary/40 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        )}
                      >
                        <span className={cn("grid size-8 shrink-0 place-items-center rounded-[var(--radius)]", accent.chip)}>
                          <Icon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium text-foreground">{meta.label}</span>
                          <span className="block truncate text-[11px] text-muted">{meta.desc}</span>
                        </span>
                        <Plus className="size-4 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
}
