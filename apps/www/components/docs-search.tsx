"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useIntlayer } from "next-intlayer";
import { Command, CommandTrigger, Tag, type CommandGroupData } from "@hulianui/ui";
import {
  TYPE_LABEL,
  relaxQuery,
  searchAll,
  searchDocs,
  searchPanelGroups,
  type SearchHit,
} from "../lib/search-index";
import { stripDocsBasePath, withDocsBasePath } from "../lib/docs-locale";

// 数量从索引现算，不写死 —— 写死的「366 个组件」下次加件就成了假话。
const COMPONENT_COUNT = searchDocs.filter((d) => d.type === "component").length;

// 全站搜索 —— dogfood 自家 Command。
//
// 关键在于**由本站决定排序与分组**，而不是让 Command 的默认子串过滤决定：
// 业务任务查询（「用户 管理 列表」）要先给整页/区块，再给低层组件；命中词多的要靠前。
// 所以走 onQueryChange 把搜索词同步出来 + filter={() => true} 交出过滤权，
// groups 完全由 lib/search-index 的相关度排序生成。
//
// 面板按**类型配额**取数（见 searchPanelGroups），不做全局截断 —— 全局截断会让
// 高层积木把组件的名额挤没，而用户看不出自己被截了。超出配额的部分给一条明说的出口。

function hitItems(hits: SearchHit[], go: (href: string) => void) {
  return hits.map((h) => ({
    value: h.id,
    label: h.title,
    description: h.description,
    // Command 的默认过滤已被关掉，keywords 只作可访问性/兜底文本用。
    keywords: [h.en, h.categoryLabel, ...h.keywords].filter(Boolean).join(" "),
    shortcut: h.en ? <span className="font-mono text-[11px]">{h.en}</span> : undefined,
    onSelect: () => go(h.href),
  }));
}

export function DocsSearch() {
  const content = useIntlayer("docs-search");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const groups = useMemo<CommandGroupData[]>(() => {
    const go = (href: string) => router.push(stripDocsBasePath(href));
    const trimmed = query.trim();
    const panel = searchPanelGroups(query);

    if (panel.length > 0) {
      const result: CommandGroupData[] = panel.map((g) => ({
        // 截断时把「显示了几条 / 一共几条」写在组标题上，别让人以为这就是全部。
        heading: g.truncated
          ? `${TYPE_LABEL[g.type]} (${content.count.replace("{shown}", String(g.hits.length)).replace("{total}", String(g.total))})`
          : `${TYPE_LABEL[g.type]} (${g.total})`,
        items: [
          ...hitItems(g.hits, go),
          ...(g.truncated && trimmed
            ? [
                {
                  value: `__more-${g.type}__`,
                  label: content.viewAllType
                    .replace("{name}", TYPE_LABEL[g.type])
                    .replace("{count}", String(g.total)),
                  onSelect: () =>
                    go(withDocsBasePath(`/search?q=${encodeURIComponent(trimmed)}&type=${g.type}`)),
                },
              ]
            : []),
        ],
      }));
      if (trimmed) {
        result.push({
          items: [
            {
              value: "__all__",
              label: content.viewAllQuery.replace("{query}", trimmed),
              onSelect: () => go(withDocsBasePath(`/search?q=${encodeURIComponent(trimmed)}`)),
            },
          ],
        });
      }
      return result;
    }

    if (!trimmed) return [];

    // 一个都没命中：给出口，而不是一句「无匹配」把人堵死。
    const relaxed = relaxQuery(trimmed);
    const fallback: CommandGroupData[] = [];
    if (relaxed) {
      fallback.push({
        heading: content.approximate.replace("{query}", relaxed),
        items: hitItems(searchAll(relaxed, { limit: 8 }), go),
      });
    }
    fallback.push({
      heading: content.alternatives,
      items: [
        {
          value: "__browse-pages__",
          label: content.browsePages,
          description: content.browsePagesDescription,
          onSelect: () => go(withDocsBasePath("/pages")),
        },
        {
          value: "__browse-blocks__",
          label: content.browseBlocks,
          description: content.browseBlocksDescription,
          onSelect: () => go(withDocsBasePath("/blocks")),
        },
        {
          value: "__browse-components__",
          label: content.browseComponents,
          description: content.browseComponentsDescription.replace("{count}", String(COMPONENT_COUNT)),
          onSelect: () => go(withDocsBasePath("/components")),
        },
        {
          value: "__registry__",
          label: content.registry,
          description: content.registryDescription,
          onSelect: () => {
            window.open(withDocsBasePath("/registry.json"), "_blank", "noreferrer");
          },
        },
      ],
    });
    return fallback;
  }, [content, query, router]);

  return (
    <>
      {/* 组件直达（ComponentQuickJump）不再挂顶栏：顶栏两个搜索框功能重叠、读起来像重复。
          ⌘K 搜索本就覆盖组件；高频直达留在组件目录页（placement="catalog"）。 */}
      {/* 顶栏入口：全断点常驻。窄屏收成图标钮（不折进汉堡菜单——搜索和主题切换一样是站点级动作）。
          键帽吃主色：与顶栏导航选中态同一档，首页跟着主题色轮换。 */}
      <CommandTrigger
        shape="pill"
        size="sm"
        collapseBelow="sm"
        placeholder={content.triggerPlaceholder}
        aria-label={content.trigger}
        onClick={() => setOpen(true)}
        className="sm:w-60"
      />

      <Command
        open={open}
        onOpenChange={setOpen}
        shortcut
        groups={groups}
        filter={() => true}
        onQueryChange={setQuery}
        aria-label={content.dialogLabel}
        placeholder={content.placeholder}
        emptyMessage={
          <span className="flex flex-col items-center gap-2">
            <span>{content.empty}</span>
            <span className="flex flex-wrap justify-center gap-1.5">
              {([content.pages, content.blocks, content.components] as const).map((t) => (
                <Tag key={t} variant="soft" tone="neutral" size="sm">
                  {t}
                </Tag>
              ))}
            </span>
          </span>
        }
      />
    </>
  );
}
