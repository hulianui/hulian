"use client";
import { useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { cn } from "../lib/cn";
import { Search } from "../_icons";
import { pressableClass } from "../motion";
import { filterApps, groupSections } from "./app-launcher.filter";
import type { AppLauncherItem, AppLauncherProps } from "./app-launcher.types";

// AppLauncher = 应用启动台：毛玻璃面板 + 搜索 + 分类胶囊 + 图标网格（macOS Launchpad / 工作台首页那种）。
//
// 和库内近邻的分工：Command 是**列表式**命令面板（键盘驱动、结果是命令）；Dock 是常驻程序坞
// （一排图标、不分类不搜索）；本组件是**网格式**应用入口——一屏铺开、按分类筛、按名字搜。
// 中后台的「应用中心 / 我的工作台 / 微应用市场」是同一个形态。
//
// 搜索与分类都支持受控/非受控；筛选与分节是纯函数（app-launcher.filter）可单测。
// 网格支持方向键漫游焦点：键盘用户不必按几十次 Tab 才走到下一行。

export function AppLauncher({
  items,
  categories,
  category,
  defaultCategory,
  onCategoryChange,
  allLabel = "全部",
  title,
  logo,
  actions,
  searchable = true,
  search,
  defaultSearch = "",
  onSearchChange,
  columns = 7,
  iconSize = 64,
  labelLines = 1,
  variant = "glass",
  emptyText = "没有匹配的应用",
  onItemClick,
  onItemContextMenu,
  className,
  ...rest
}: AppLauncherProps) {
  const [innerSearch, setInnerSearch] = useState(defaultSearch);
  const [innerCategory, setInnerCategory] = useState<string | undefined>(defaultCategory);
  const gridRef = useRef<HTMLDivElement>(null);

  // 受控优先：传了就以外部为准，没传才用内部态（两条 UI 状态各自独立受控）。
  const query = search ?? innerSearch;
  const activeCategory = category !== undefined ? category : innerCategory;

  const setQuery = (v: string) => {
    if (search === undefined) setInnerSearch(v);
    onSearchChange?.(v);
  };
  const setCategory = (key: string | undefined) => {
    if (category === undefined) setInnerCategory(key);
    onCategoryChange?.(key);
  };

  const sections = useMemo(
    () => groupSections(filterApps(items, { query, category: activeCategory })),
    [items, query, activeCategory],
  );
  const total = sections.reduce((n, s) => n + s.items.length, 0);

  // 方向键在网格里漫游：按列数换算上下行，Home/End 跳首尾。项是原生 button/a，回车由浏览器处理。
  const onGridKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"];
    if (!keys.includes(e.key)) return;
    const cells = Array.from(
      gridRef.current?.querySelectorAll<HTMLElement>("[data-app-item]") ?? [],
    );
    const current = cells.indexOf(document.activeElement as HTMLElement);
    if (current < 0) return;
    const step =
      e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : e.key === "ArrowDown" ? columns : e.key === "ArrowUp" ? -columns : 0;
    const next =
      e.key === "Home" ? 0 : e.key === "End" ? cells.length - 1 : current + step;
    if (next < 0 || next >= cells.length) return; // 越界不回绕：撞到边界比跳到对角更好预期
    e.preventDefault();
    cells[next].focus();
  };

  const renderItem = (item: AppLauncherItem) => {
    const content = (
      <>
        <span
          className="relative grid shrink-0 place-items-center overflow-hidden bg-surface-hover [&>img]:size-full [&>img]:object-cover [&>svg]:size-full"
          // 22% 圆角逼近 Apple 的超椭圆图标外形；不用 var(--radius)——它在 64px 方块上偏小、在小图标上又会磨成圆。
          style={{ width: iconSize, height: iconSize, borderRadius: "22%" }}
        >
          {item.icon}
        </span>
        <span
          className={cn(
            "w-full text-center text-xs leading-tight text-foreground",
            labelLines === 2 ? "line-clamp-2" : "truncate",
          )}
        >
          {item.label}
        </span>
        {item.badge != null && (
          <span className="absolute right-1 top-0 z-10">{item.badge}</span>
        )}
      </>
    );

    const cls = cn(
      "group relative flex cursor-pointer flex-col items-center gap-2 rounded-[var(--radius)] px-1 py-2 outline-none",
      "hover:bg-surface-hover/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
      item.disabled && "pointer-events-none opacity-40",
      pressableClass,
    );

    const shared = {
      "data-app-item": "",
      className: cls,
      title: typeof item.label === "string" ? item.label : undefined,
      onContextMenu: onItemContextMenu
        ? (e: MouseEvent<HTMLElement>) => onItemContextMenu(item, e)
        : undefined,
      onClick: (e: MouseEvent<HTMLElement>) => onItemClick?.(item, e),
    };

    return item.href ? (
      <a key={item.id} href={item.href} target={item.target} {...shared}>
        {content}
      </a>
    ) : (
      <button key={item.id} type="button" disabled={item.disabled} {...shared}>
        {content}
      </button>
    );
  };

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col rounded-[calc(var(--radius)+0.25rem)] border border-hairline p-4 shadow-lg",
        // glass 依赖身后有底图才出效果；没有底图时它退化成半透明面板，不会糊成一片。
        variant === "glass" ? "bg-surface/70 backdrop-blur-2xl" : "bg-surface",
        className,
      )}
      {...rest}
    >
      {(title != null || logo != null || actions != null || searchable) && (
        <div className="flex items-center gap-2 pb-3">
          {logo}
          {searchable ? (
            <span className="flex min-w-0 flex-1 items-center gap-2">
              <Search className="size-4 shrink-0 text-muted" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={typeof title === "string" ? title : "搜索应用"}
                aria-label={typeof title === "string" ? title : "搜索应用"}
                className="min-w-0 flex-1 bg-transparent text-lg font-semibold text-foreground outline-none placeholder:text-foreground/70 [&::-webkit-search-cancel-button]:appearance-none"
              />
            </span>
          ) : (
            <span className="min-w-0 flex-1 truncate text-lg font-semibold text-foreground">{title}</span>
          )}
          {actions}
        </div>
      )}

      {categories && categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-3" role="group" aria-label="应用分类">
          {/* 用 group + aria-pressed 而不是 tablist/tab：网格不是 tabpanel，套 tab 角色会给读屏
              用户一个并不存在的「面板切换」心智，也过不了「tab 须有 tabpanel」这类审计。 */}
          {[{ key: "", label: allLabel }, ...categories].map((c) => {
            const selected = (activeCategory ?? "") === c.key;
            return (
              <button
                key={c.key || "__all__"}
                type="button"
                aria-pressed={selected}
                onClick={() => setCategory(c.key || undefined)}
                className={cn(
                  "shrink-0 cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium outline-none",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                  selected
                    ? "bg-foreground/10 text-foreground"
                    : "bg-surface-hover/60 text-muted hover:text-foreground",
                  pressableClass,
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      )}

      <div ref={gridRef} onKeyDown={onGridKeyDown} className="min-h-0 flex-1 overflow-y-auto">
        {total === 0 ? (
          <p className="py-10 text-center text-sm text-muted">{emptyText}</p>
        ) : (
          sections.map((section, si) => (
            <div
              key={section.key || `__s${si}`}
              // 分节线是**功能性**分隔，用 border-border；--color-hairline 在亮色是 transparent
              // （它只服务「有阴影的元素在亮色下免双线」），拿来画分隔线等于画了条看不见的线。
              className={cn(si > 0 && "mt-4 border-t border-border pt-4")}
            >
              <div
                className="grid gap-x-2 gap-y-4"
                style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
              >
                {section.items.map(renderItem)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
