"use client";
import { memo, useCallback, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Button } from "../button";
import { Card, CardBody } from "../card";
import { CodeBlock } from "../code-block";
import { Command } from "../command";
import type { CommandGroupData, CommandItemData } from "../command";
import { Empty } from "../empty";
import { Input } from "../input";
import { Search } from "../_icons";
import { ScrollArea } from "../scroll-area";
import { Table } from "../table";
import type { ColumnDef } from "../table";
import { Tag } from "../tag";
import { Tree } from "../tree";
import type { TreeNode } from "../tree";
import { cn } from "../lib/cn";
import { useComponentLocale } from "../config/locale-context";
import {
  ALL_CATEGORY_KEY,
  buildCategoryTree,
  defaultPropsOf,
  matchesCategory,
} from "./component-picker-catalog";
import { rankComponents } from "./component-picker-search";
import type {
  ComponentPickerCategoryNode,
  ComponentPickerCommandProps,
  ComponentPickerFilter,
  ComponentPickerItem,
  ComponentPickerLabels,
  ComponentPickerProp,
  ComponentPickerProps,
} from "./component-picker.types";

// 组件库浏览器：左分类树 + 顶搜索 + 结果网格 + 右详情面板。
//
// 三条边界（都是刻意的，不是没做完）：
// 1. **不取数**：items 由消费方喂。库组件不该假设运行环境有 llms-full.txt，
//    更不该在渲染里发网络请求；解析走导出的纯函数 parseComponentCatalog。
// 2. **不渲染任意组件**：live 预览走 renderPreview 注入。库里没有 slug->组件 的映射，
//    也不会 eval 字符串或塞 iframe —— 那是把「安全边界」换成「看起来能跑」。
// 3. **不引 fuse.js**：打分器是本目录的纯函数，按「slug/name 命中 >> 描述命中」调过。

// 内置兜底：没包 ConfigProvider 时 useComponentLocale() 取不到字典，仍要有可用的中文文案。
const FALLBACK_LABELS: ComponentPickerLabels = {
  searchPlaceholder: "搜索组件名、slug 或描述",
  categoryTree: "组件分类",
  allCategories: "全部",
  results: "组件搜索结果",
  resultCount: (count, total) => `${count} / ${total}`,
  noResultTitle: "没有匹配的组件",
  noResultDescription: "换个关键词，或在左侧切换分类。",
  emptyCatalogTitle: "组件目录为空",
  emptyCatalogDescription: "把解析好的组件目录传给 items。",
  detail: "组件详情",
  previewTitle: "预览",
  previewPlaceholder: "未接入预览渲染",
  propsTitle: "属性",
  noProps: "该组件没有属性表",
  propName: "名称",
  propType: "类型",
  propDefault: "默认",
  propDescription: "说明",
  examplesTitle: "示例",
  noExamples: "该组件没有示例代码",
  select: "选用该组件",
};

/** 分类树的纯数据节点 -> Tree 的 TreeNode（标签右侧挂计数）。 */
function toTreeNodes(nodes: ComponentPickerCategoryNode[]): TreeNode[] {
  return nodes.map((node) => ({
    key: node.key,
    searchText: node.label,
    label: (
      <span className="flex w-full items-center justify-between gap-2">
        <span className="truncate">{node.label}</span>
        <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{node.count}</span>
      </span>
    ),
    ...(node.children ? { children: toTreeNodes(node.children) } : {}),
  }));
}

function PropsTable({
  props: rows,
  labels,
}: {
  props: ComponentPickerProp[];
  labels: ComponentPickerLabels;
}) {
  const columns = useMemo<ColumnDef<ComponentPickerProp, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: labels.propName,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-foreground">
            {row.original.name}
            {row.original.required ? <span className="text-danger"> *</span> : null}
          </span>
        ),
      },
      {
        accessorKey: "type",
        header: labels.propType,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{row.original.type ?? "—"}</span>
        ),
      },
      {
        accessorKey: "default",
        header: labels.propDefault,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{row.original.default ?? "—"}</span>
        ),
      },
      {
        accessorKey: "description",
        header: labels.propDescription,
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.description ?? ""}</span>,
      },
    ],
    [labels],
  );
  return (
    <Table<ComponentPickerProp>
      columns={columns}
      data={rows}
      enableSorting={false}
      striped={false}
      density="compact"
      getRowId={(row) => row.name}
      emptyText={labels.noProps}
    />
  );
}

function ComponentPickerImpl({
  items,
  filter,
  defaultFilter,
  onFilterChange,
  showTree = true,
  showPreview = false,
  showProps = true,
  showExamples = true,
  renderPreview,
  onSelect,
  activeSlug,
  defaultActiveSlug,
  onActiveChange,
  maxResults = 60,
  labels: labelOverrides,
  className,
}: ComponentPickerProps) {
  // 优先级：labels prop > ConfigProvider 的 locale > 内置中文兜底。
  const localeLabels = useComponentLocale().componentPicker ?? FALLBACK_LABELS;
  const labels = useMemo(
    () => ({ ...localeLabels, ...labelOverrides }),
    [localeLabels, labelOverrides],
  );
  const reactId = useId();
  const listId = `${reactId}-results`;
  const listRef = useRef<HTMLDivElement | null>(null);

  const [innerFilter, setInnerFilter] = useState<ComponentPickerFilter>(defaultFilter ?? {});
  const current = filter ?? innerFilter;
  const search = current.search ?? "";
  const category = current.category ?? ALL_CATEGORY_KEY;

  const commitFilter = useCallback(
    (next: ComponentPickerFilter) => {
      if (filter === undefined) setInnerFilter(next);
      onFilterChange?.(next);
    },
    [filter, onFilterChange],
  );

  const [innerActive, setInnerActive] = useState<string | null>(defaultActiveSlug ?? null);
  const active = activeSlug !== undefined ? activeSlug : innerActive;

  const commitActive = useCallback(
    (slug: string | null) => {
      if (activeSlug === undefined) setInnerActive(slug);
      onActiveChange?.(slug);
    },
    [activeSlug, onActiveChange],
  );

  const treeNodes = useMemo(
    () => toTreeNodes(buildCategoryTree(items, { allLabel: labels.allCategories })),
    [items, labels.allCategories],
  );

  const scoped = useMemo(() => items.filter((item) => matchesCategory(item, category)), [items, category]);
  const results = useMemo(
    () => rankComponents(scoped, search, { limit: maxResults }).map((r) => r.item),
    [scoped, search, maxResults],
  );

  const activeItem = useMemo(
    () => (active === null ? null : (items.find((item) => item.slug === active) ?? null)),
    [items, active],
  );

  const optionId = (slug: string) => `${listId}-${slug}`;

  /** 高亮项滚进视口。jsdom 没有 scrollIntoView，故一律可选链调用。 */
  const revealOption = useCallback((slug: string) => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-slug="${slug}"]`);
    el?.scrollIntoView?.({ block: "nearest" });
  }, []);

  const move = useCallback(
    (delta: number) => {
      if (results.length === 0) return;
      const at = results.findIndex((item) => item.slug === active);
      // 未高亮任何项时，向下从第一条开始、向上从最后一条开始
      const next = at < 0 ? (delta > 0 ? 0 : results.length - 1) : (at + delta + results.length) % results.length;
      const slug = results[next]!.slug;
      commitActive(slug);
      revealOption(slug);
    },
    [results, active, commitActive, revealOption],
  );

  const choose = useCallback(
    (item: ComponentPickerItem) => {
      commitActive(item.slug);
      onSelect?.(item.slug, defaultPropsOf(item));
    },
    [commitActive, onSelect],
  );

  const onSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      move(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "Enter") {
      const item = results.find((r) => r.slug === active);
      if (item) {
        event.preventDefault();
        choose(item);
      }
    } else if (event.key === "Escape") {
      // 逐级退出：先清搜索词，词已空再清高亮 —— 免得一次 Esc 把上下文全丢了
      if (search) {
        event.preventDefault();
        commitFilter({ ...current, search: "" });
      } else if (active !== null) {
        event.preventDefault();
        commitActive(null);
      }
    }
  };

  const showDetail = activeItem !== null && (showPreview || showProps || showExamples);

  return (
    <div className={cn("flex min-h-0 w-full gap-4", className)}>
      {showTree && (
        <ScrollArea className="w-52 shrink-0 rounded-[var(--radius)] border border-border bg-surface">
          <div className="p-2">
            <Tree
              nodes={treeNodes}
              selectedKeys={[category]}
              expandTrigger="icon"
              defaultExpandedKeys={[ALL_CATEGORY_KEY]}
              onSelect={(keys) => commitFilter({ ...current, category: keys[0] ?? ALL_CATEGORY_KEY })}
              aria-label={labels.categoryTree}
            />
          </div>
        </ScrollArea>
      )}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-center gap-3">
          <Input
            // 刻意不用 type="search"：浏览器原生的清除按钮 + 原生 Esc 清空会和这里
            // 「Esc 先清词、再清高亮」的逐级退出打架，行为在各浏览器还不一致。
            type="text"
            role="combobox"
            aria-expanded
            aria-controls={listId}
            aria-autocomplete="list"
            aria-label={labels.searchPlaceholder}
            aria-activedescendant={active !== null ? optionId(active) : undefined}
            placeholder={labels.searchPlaceholder}
            prefix={<Search className="size-4" />}
            value={search}
            onChange={(e) => commitFilter({ ...current, search: e.target.value })}
            onKeyDown={onSearchKeyDown}
          />
          <span className="shrink-0 font-mono text-xs text-muted-foreground">
            {labels.resultCount(results.length, items.length)}
          </span>
        </div>

        <div className="flex min-h-0 flex-1 gap-4">
          <ScrollArea className="min-w-0 flex-1">
            <div
              ref={listRef}
              id={listId}
              role="listbox"
              aria-label={labels.results}
              // pr-2.5：ScrollArea 的竖向滚动条是覆盖式的（absolute，不占布局宽度），宽 w-2=8px。
              // 内容必须自留 ≥ 滚动条宽度的内边距，否则滚动条稳定地压在最右一列卡片上（#118）。
              className="grid auto-rows-min grid-cols-1 gap-3 pr-2.5 md:grid-cols-2 2xl:grid-cols-3"
            >
              {results.map((item) => {
                const isActive = item.slug === active;
                return (
                  <Card
                    key={item.slug}
                    id={optionId(item.slug)}
                    data-slug={item.slug}
                    role="option"
                    aria-selected={isActive}
                    onClick={() => commitActive(item.slug)}
                    onDoubleClick={() => choose(item)}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-surface-hover",
                      isActive && "border-primary bg-surface-hover",
                    )}
                  >
                    <CardBody className="flex flex-col gap-1.5 px-4 py-3">
                      {/* 组件名与 slug 都 truncate 时，flex 会让两者按内容平分宽度，
                          于是名称还没到边就先省略成「But… Emp… Com…」。把宽度优先让给名称：
                          名称 min-w-0 flex-1 可压缩，slug shrink-0 保持完整（#118）。 */}
                      <div className="flex min-w-0 items-baseline gap-2">
                        <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                          {item.name}
                        </span>
                        <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                          {item.slug}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
                      <div className="flex flex-wrap items-center gap-1">
                        <Tag size="sm" tone="brand">
                          {item.category}
                        </Tag>
                        {item.group ? (
                          <Tag size="sm" variant="outline">
                            {item.group}
                          </Tag>
                        ) : null}
                        {(item.tags ?? []).map((tag) => (
                          <Tag key={tag} size="sm">
                            {tag}
                          </Tag>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
              {results.length === 0 && (
                <div className="col-span-full">
                  {items.length === 0 ? (
                    <Empty
                      title={labels.emptyCatalogTitle}
                      description={labels.emptyCatalogDescription}
                    />
                  ) : (
                    <Empty title={labels.noResultTitle} description={labels.noResultDescription} />
                  )}
                </div>
              )}
            </div>
          </ScrollArea>

          {showDetail && (
            <ScrollArea className="w-80 shrink-0 rounded-[var(--radius)] border border-border bg-surface">
              <div role="region" aria-label={labels.detail} className="flex flex-col gap-4 p-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex min-w-0 items-baseline gap-2">
                    <span className="truncate text-base font-medium text-foreground">
                      {activeItem.name}
                    </span>
                    <span className="truncate font-mono text-xs text-muted-foreground">{activeItem.slug}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{activeItem.description}</p>
                </div>

                {showPreview && (
                  <section className="flex flex-col gap-2">
                    <h4 className="text-xs font-medium text-foreground">{labels.previewTitle}</h4>
                    <div className="flex min-h-24 items-center justify-center rounded-[var(--radius)] border border-dashed border-border p-3">
                      {renderPreview ? (
                        renderPreview(activeItem)
                      ) : (
                        <Empty size="sm" title={labels.previewPlaceholder} />
                      )}
                    </div>
                  </section>
                )}

                {showProps && (
                  <section className="flex flex-col gap-2">
                    <h4 className="text-xs font-medium text-foreground">{labels.propsTitle}</h4>
                    <PropsTable props={activeItem.props ?? []} labels={labels} />
                  </section>
                )}

                {showExamples && (
                  <section className="flex flex-col gap-2">
                    <h4 className="text-xs font-medium text-foreground">{labels.examplesTitle}</h4>
                    {(activeItem.examples ?? []).length === 0 ? (
                      <p className="text-xs text-muted-foreground">{labels.noExamples}</p>
                    ) : (
                      (activeItem.examples ?? []).map((example, i) => (
                        <CodeBlock
                          key={`${example.title ?? "example"}-${i}`}
                          code={example.code}
                          lang={example.lang}
                        />
                      ))
                    )}
                  </section>
                )}

                {onSelect && (
                  <Button size="sm" onClick={() => choose(activeItem)}>
                    {labels.select}
                  </Button>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * ⌘K 形态的薄封装。
 *
 * 为什么是「薄封装」而不是主形态：issue 的主诉求是「浏览器」——分类树 + 结果网格 +
 * props 表 + 示例代码，这些放不进一条 40px 的命令行。所以常驻面板是主形态，
 * 命令面板只解决「已经知道要哪个组件，想快速跳过去」那一半场景。
 *
 * 实现上走 Command 文档写明的逃生口：`filter={() => true}` + `onQueryChange`，
 * 由这里用同一个打分器排完序再喂 groups —— Command 自己的过滤是子串匹配、且不排序。
 */
export function ComponentPickerCommand({
  items,
  open,
  onOpenChange,
  onSelect,
  placeholder: placeholderProp,
  emptyMessage: emptyMessageProp,
  maxResults = 30,
  groupByCategory = true,
  shortcut = false,
  className,
  "aria-label": ariaLabel,
}: ComponentPickerCommandProps) {
  // 与常驻面板同一条优先级链：prop > ConfigProvider 的 locale > 内置中文兜底。
  const localeLabels = useComponentLocale().componentPicker ?? FALLBACK_LABELS;
  const placeholder = placeholderProp ?? localeLabels.searchPlaceholder;
  const emptyMessage = emptyMessageProp ?? localeLabels.noResultTitle;
  const [query, setQuery] = useState("");

  const groups = useMemo<CommandGroupData[]>(() => {
    const ranked = rankComponents(items, query, { limit: maxResults }).map((r) => r.item);
    const toItem = (item: ComponentPickerItem): CommandItemData => ({
      value: item.slug,
      label: item.name,
      keywords: `${item.slug} ${item.description} ${(item.tags ?? []).join(" ")}`,
      description: item.description,
      onSelect: () => onSelect?.(item.slug, defaultPropsOf(item)),
    });
    if (!groupByCategory) return [{ items: ranked.map(toItem) }];
    const byCategory = new Map<string, ComponentPickerItem[]>();
    for (const item of ranked) {
      const bucket = byCategory.get(item.category);
      if (bucket) bucket.push(item);
      else byCategory.set(item.category, [item]);
    }
    return [...byCategory].map(([heading, list]) => ({ heading, items: list.map(toItem) }));
  }, [items, query, maxResults, groupByCategory, onSelect]);

  return (
    <Command
      open={open}
      onOpenChange={onOpenChange}
      groups={groups}
      filter={() => true}
      onQueryChange={setQuery}
      placeholder={placeholder}
      emptyMessage={emptyMessage}
      shortcut={shortcut}
      className={className}
      aria-label={ariaLabel}
    />
  );
}

ComponentPickerImpl.displayName = "ComponentPicker";

// #89：父级稳定更新时 React 无法自己 bailout，只能靠 memo —— 与 Button/Checkbox/Chip 同一处方。
export const ComponentPicker = memo(ComponentPickerImpl);
ComponentPicker.displayName = "ComponentPicker";
