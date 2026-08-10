"use client";
import { cloneElement, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import { useComponentLocale } from "../config/locale-context";
import type { NavMenuGroup, NavMenuItem, NavMenuNode, NavMenuProps } from "./nav-menu.types";

const isGroup = (node: NavMenuNode): node is NavMenuGroup =>
  (node as NavMenuGroup).type === "group";

// 扁平化所有「普通项」（含分组内、含子树），供 key→item 反查 onSelect 回调用。
function flattenItems(nodes: NavMenuNode[], out: Map<string, NavMenuItem> = new Map()) {
  for (const node of nodes) {
    if (isGroup(node)) {
      flattenItems(node.children, out);
      continue;
    }
    out.set(node.key, node);
    if (node.children?.length) flattenItems(node.children, out);
  }
  return out;
}

// 某项子树（不含自身）是否含选中键——用于父项「后代选中」的弱高亮，辅助定位。
function hasSelectedDescendant(item: NavMenuItem, selected: Set<string>): boolean {
  if (!item.children?.length) return false;
  return item.children.some((c) => selected.has(c.key) || hasSelectedDescendant(c, selected));
}

interface FlatRow {
  key: string;
  depth: number;
  hasChildren: boolean;
  expanded: boolean;
  disabled: boolean;
  parentKey: string | null;
}

// 按 DOM 顺序产出「当前可聚焦行」：分组透明下沉（标题非 treeitem 不入列）。
// inline 模式仅下钻已展开子树；collapsed 模式下钻【整棵树】——飞出层 DOM 恒在且无限级，
// 每一层子项都是真实可聚焦 treeitem，键盘漫游要能覆盖到（否则深层项不可达）。
function flattenVisible(
  nodes: NavMenuNode[],
  openSet: Set<string>,
  collapsed: boolean,
  depth: number,
  parentKey: string | null,
  out: FlatRow[],
) {
  for (const node of nodes) {
    if (isGroup(node)) {
      flattenVisible(node.children, openSet, collapsed, depth, parentKey, out);
      continue;
    }
    const hasChildren = !!node.children?.length;
    const expanded = !collapsed && hasChildren && openSet.has(node.key);
    out.push({ key: node.key, depth, hasChildren, expanded, disabled: !!node.disabled, parentKey });
    if (expanded || (collapsed && hasChildren)) {
      flattenVisible(node.children!, openSet, collapsed, depth + 1, node.key, out);
    }
  }
  return out;
}

// collapsed 模式：把分组下沉、只取顶层普通项（顶层即收起态图标轨）。
function topLevelItems(nodes: NavMenuNode[], out: NavMenuItem[] = []) {
  for (const node of nodes) {
    if (isGroup(node)) topLevelItems(node.children, out);
    else out.push(node);
  }
  return out;
}

// 沿 parentKey 上溯到顶层键（collapsed 态把深层选中项映射回图标轨上那颗图标）。
function rootKeyOf(rows: FlatRow[], key: string): string {
  const parentOf = new Map(rows.map((r) => [r.key, r.parentKey] as const));
  let cur = key;
  // 数据即便被外部构造成环也不会死循环：最多走 rows.length 步。
  for (let i = 0; i < rows.length; i++) {
    const parent = parentOf.get(cur);
    if (!parent) return cur;
    cur = parent;
  }
  return cur;
}

/**
 * 自研侧边导航菜单（零依赖 · "use client"）。区别于命令式下拉 Menu：这是常驻左侧主导航。
 *  · inline 手风琴内联展开子菜单（主用）；collapsed 收起为图标轨 + 悬浮/聚焦飞出子菜单。
 *  · selectedKeys / openKeys 受控、非受控双轨；点击叶子触发 onSelect。
 *  · 子菜单高度过渡用纯 CSS `grid-template-rows: 0fr↔1fr`（嵌套自洽、零 JS 测量、零运行时），
 *    时长/曲线复用 motion token CSS 镜像（同 Accordion/Dialog 手感）。
 *  · 键盘 WAI-ARIA tree：上下移动焦点、→ 展开/进子、← 收起/回父、Home/End、Enter/Space 激活。
 *    roving tabindex（仅当前项 tabIndex=0）。
 */
export function NavMenu({
  items,
  mode = "inline",
  semantics = "tree",
  selectedKeys,
  defaultSelectedKeys,
  onSelect,
  openKeys,
  defaultOpenKeys,
  onOpenChange,
  className,
  "aria-label": ariaLabel,
  ...props
}: NavMenuProps) {
  const componentLocale = useComponentLocale();
  const resolvedAriaLabel = ariaLabel ?? componentLocale.navMenu?.navigation ?? "侧边导航";
  const collapsed = mode === "collapsed";
  const reduced = useReducedMotion();
  // list 语义（hulianui/hulian#69）：站点主导航是 list + link，不是 tree widget。
  // 显式 role 一律压过 <a> 的隐式 link role，所以这一档**不写 role**，让消费方给的元素自带语义。
  // 连带三件事：roving tabindex 让位给原生 Tab（半吊子 tree 比没有 tree 更糟）、
  // aria-selected 换成 aria-current="page"（前者在 link 上无效）、方向键不接管。
  const asList = semantics === "list";
  // Tailwind preflight 把 ul 的 list-style 清成 none，Safari/VoiceOver 会因此把 list 语义摘掉。
  // 显式 role="list" 是把它钉回来的标准做法。
  const listRole = asList ? "list" : "tree";
  const groupRole = asList ? "list" : "group";
  // list 档不给内层 ul 重复 aria-label：外层 <nav> 已经有了，两处同名读屏会念两遍。
  const listLabel = asList ? undefined : resolvedAriaLabel;

  const [selectedState, setSelectedState] = useState<string[]>(defaultSelectedKeys ?? []);
  const selected = selectedKeys ?? selectedState;
  const setSelected = (next: string[]) => {
    if (selectedKeys === undefined) setSelectedState(next);
  };

  const [openState, setOpenState] = useState<string[]>(defaultOpenKeys ?? []);
  const open = openKeys ?? openState;
  const setOpen = (next: string[]) => {
    if (openKeys === undefined) setOpenState(next);
    onOpenChange?.(next);
  };
  const toggleOpen = (key: string, next: boolean) => {
    const set = new Set(open);
    if (next) set.add(key);
    else set.delete(key);
    setOpen([...set]);
  };

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const openSet = useMemo(() => new Set(open), [open]);
  const nodeMap = useMemo(() => flattenItems(items), [items]);

  const openKey = open.join("\u0000"); // 稳定依赖键，避免数组引用每次新建触发 memo 失效
  const flat = useMemo(
    () =>
      flattenVisible(
        items,
        new Set(openKey ? openKey.split("\u0000") : []),
        collapsed,
        0,
        null,
        [],
      ),
    [items, openKey, collapsed],
  );

  // roving tabindex：当前可聚焦项。无显式焦点时落在首个选中项，否则首行。
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const flatKeys = flat.map((r) => r.key);
  const selectedRowKey = flat.find((r) => selectedSet.has(r.key))?.key;
  // collapsed 态：默认 tab 落点收敛到选中项的【顶层祖先】（图标轨上真实可见的那颗），
  // 不落到飞出层深处——否则 Tab 会跳进一个视觉上尚未展开的位置。
  const firstSelected =
    collapsed && selectedRowKey ? rootKeyOf(flat, selectedRowKey) : selectedRowKey;
  const effectiveActive =
    activeKey && flatKeys.includes(activeKey) ? activeKey : firstSelected ?? flatKeys[0] ?? null;

  const itemRefs = useRef(new Map<string, HTMLElement>());
  const focusKey = (key: string) => {
    setActiveKey(key);
    itemRefs.current.get(key)?.focus();
  };

  // collapsed 第一层飞出层的实测坐标（详见 FLYOUT_WRAP_FIXED 注释）：
  // 图标轨几乎总是被放进可滚动的侧栏容器（`AdminLayout` 就是 ScrollArea），
  // `position: absolute` 的面板会被那个祖先的 overflow 直接裁掉 —— 收起态等于没有子菜单。
  // fixed 不受祖先 overflow 裁剪，代价是必须自己量坐标。
  //
  // 刻意**不**用 `visibility: hidden` 兜「还没量到」的那一帧：`visibility:hidden` 会把整棵子树
  // 从无障碍树里摘掉，屏幕阅读器与 `getByRole` 都读不到——那等于把刚补上的「深层项 DOM 恒在」
  // 又拿掉一半。改为挂载即量全部顶层项，位置永远是已知的（面板静息态本就 opacity-0，
  // 首帧位置不对也画不出来）。
  const [flyoutPos, setFlyoutPos] = useState<Record<string, { top: number; left: number }>>({});
  const topKeys = useMemo(
    () => (collapsed ? topLevelItems(items).map((i) => i.key) : []),
    [items, collapsed],
  );
  // 稳定依赖键：数组引用每次渲染都新建，直接进依赖数组会让 effect 每帧重挂监听。
  // 分隔符写成 \u0001 转义而不是字面控制字符，免得整个文件被 git 判成二进制。
  const topKeysDep = topKeys.join("\u0001");
  const measureFlyout = (key: string) => {
    const el = itemRefs.current.get(key);
    if (!el) return;
    const r = el.getBoundingClientRect();
    setFlyoutPos((prev) => {
      const cur = prev[key];
      if (cur && cur.top === r.top && cur.left === r.right) return prev;
      return { ...prev, [key]: { top: r.top, left: r.right } };
    });
  };

  // 轨道滚动 / 窗口尺寸变化都会让坐标失效。捕获阶段听 scroll 才能收到内层滚动容器
  // （ScrollArea 的 viewport）的事件——它不冒泡到 window。
  useEffect(() => {
    if (!collapsed) return;
    const keys = topKeysDep ? topKeysDep.split("\u0001") : [];
    const sync = () => {
      setFlyoutPos((prev) => {
        let next = prev;
        for (const key of keys) {
          const el = itemRefs.current.get(key);
          if (!el) continue;
          const r = el.getBoundingClientRect();
          const cur = next[key];
          if (cur && cur.top === r.top && cur.left === r.right) continue;
          if (next === prev) next = { ...prev };
          next[key] = { top: r.top, left: r.right };
        }
        return next;
      });
    };
    // 捕获阶段的 scroll 会收到页面上**任意**滚动容器的事件，不节流的话每次滚动都要对所有顶层项
    // 做一次 getBoundingClientRect（强制同步布局）。用 rAF 合并到每帧一次。
    let frame = 0;
    const onScrollOrResize = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        sync();
      });
    };
    sync();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [collapsed, topKeysDep]);

  const selectLeaf = (key: string) => {
    setSelected([key]);
    const item = nodeMap.get(key);
    if (item) onSelect?.(key, item);
  };

  const activate = (row: FlatRow) => {
    if (row.disabled) return;
    if (row.hasChildren) toggleOpen(row.key, !row.expanded);
    else selectLeaf(row.key);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    const idx = flat.findIndex((r) => r.key === effectiveActive);
    if (idx === -1) return;
    const row = flat[idx];

    // collapsed 态是「级联飞出」而非线性列表：↑↓ 在同层兄弟间移动，→ 进子层，←/Esc 回父层。
    // 焦点进入某层即让该层（及其所有祖先层）通过 :focus-within 显形，故无需 openKeys 参与。
    if (collapsed) {
      const siblings = flat.filter((r) => r.parentKey === row.parentKey);
      const si = siblings.findIndex((r) => r.key === row.key);
      const firstChild = flat.find((r) => r.parentKey === row.key);
      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          if (siblings[si + 1]) focusKey(siblings[si + 1].key);
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          if (siblings[si - 1]) focusKey(siblings[si - 1].key);
          break;
        }
        case "ArrowRight": {
          e.preventDefault();
          if (firstChild) focusKey(firstChild.key);
          break;
        }
        case "ArrowLeft":
        case "Escape": {
          e.preventDefault();
          if (row.parentKey) focusKey(row.parentKey);
          break;
        }
        case "Home": {
          e.preventDefault();
          if (siblings[0]) focusKey(siblings[0].key);
          break;
        }
        case "End": {
          e.preventDefault();
          if (siblings[siblings.length - 1]) focusKey(siblings[siblings.length - 1].key);
          break;
        }
        case "Enter":
        case " ": {
          e.preventDefault();
          if (row.disabled) break;
          if (row.hasChildren) {
            if (firstChild) focusKey(firstChild.key);
          } else selectLeaf(row.key);
          break;
        }
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        const next = flat[idx + 1];
        if (next) focusKey(next.key);
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const prev = flat[idx - 1];
        if (prev) focusKey(prev.key);
        break;
      }
      case "ArrowRight": {
        e.preventDefault();
        if (collapsed) break; // 收起态子菜单走悬浮飞出，无内联展开
        if (row.hasChildren && !row.expanded) toggleOpen(row.key, true);
        else if (row.expanded) {
          const child = flat[idx + 1];
          if (child && child.parentKey === row.key) focusKey(child.key);
        }
        break;
      }
      case "ArrowLeft": {
        e.preventDefault();
        if (collapsed) break;
        if (row.hasChildren && row.expanded) toggleOpen(row.key, false);
        else if (row.parentKey) focusKey(row.parentKey);
        break;
      }
      case "Home": {
        e.preventDefault();
        if (flat[0]) focusKey(flat[0].key);
        break;
      }
      case "End": {
        e.preventDefault();
        const last = flat[flat.length - 1];
        if (last) focusKey(last.key);
        break;
      }
      case "Enter":
      case " ": {
        e.preventDefault();
        activate(row);
        break;
      }
    }
  };

  // ---- 收起态：图标轨 + 无限级级联飞出子菜单（纯 CSS reveal，DOM 恒在）----
  if (collapsed) {
    const tops = topLevelItems(items);
    const revealStyle = {
      transitionDuration: reduced ? "0ms" : motionDurationCss.fast,
      transitionTimingFunction: motionEaseCss.out,
    };

    // 递归渲染飞出层的一层子菜单：与 inline 态能力对齐（三级/四级/N 级都真实进 DOM 且可键盘抵达）。
    // 有子层的项自己再挂一层飞出面板，靠 :hover / :focus-within 逐层显形。
    const renderFlyoutList = (nodes: NavMenuItem[], depth: number) => (
      <ul role={groupRole} className="flex flex-col gap-0.5">
        {nodes.map((child) => {
          const childHasChildren = !!child.children?.length;
          const isSelected = selectedSet.has(child.key);
          const branchActive = isSelected || hasSelectedDescendant(child, selectedSet);
          const isActive = child.key === effectiveActive;
          const shared = {
            ...(asList
              ? { "aria-current": isSelected ? ("page" as const) : undefined }
              : {
                  role: "treeitem" as const,
                  "aria-selected": isSelected || undefined,
                  // roving tabindex 贯穿飞出层：整棵树只有一个 tab 落点，深层靠 → / ← 进出。
                  tabIndex: isActive ? 0 : -1,
                }),
            "aria-disabled": child.disabled || undefined,
            "aria-haspopup": childHasChildren || undefined,
            "data-selected": branchActive ? "" : undefined,
            className: FLYOUT_ROW,
            ref: (el: HTMLElement | null) => {
              if (el) itemRefs.current.set(child.key, el);
              else itemRefs.current.delete(child.key);
            },
            onFocus: () => setActiveKey(child.key),
          };
          const inner = (
            <>
              {child.icon ? (
                <span aria-hidden className="shrink-0 [&>svg]:size-4">
                  {child.icon}
                </span>
              ) : null}
              <span className="flex-1 truncate">{child.label}</span>
              {childHasChildren ? <FlyoutChevron /> : null}
            </>
          );
          return (
            <li key={child.key} role={asList ? undefined : "none"} className="relative">
              {child.render && !childHasChildren ? (
                cloneElement(
                  child.render,
                  {
                    ...shared,
                    "aria-current": isSelected ? "page" : undefined,
                    className: cn(
                      shared.className,
                      (child.render.props as { className?: string }).className,
                    ),
                    onClick: (event: MouseEvent) => {
                      (child.render!.props as { onClick?: (e: MouseEvent) => void }).onClick?.(
                        event,
                      );
                      if (child.disabled) return;
                      setActiveKey(child.key);
                      selectLeaf(child.key);
                    },
                  } as Record<string, unknown>,
                  inner,
                )
              ) : child.href && !childHasChildren ? (
                <a
                  {...shared}
                  href={child.href}
                  aria-current={isSelected ? "page" : undefined}
                  onClick={() => {
                    if (child.disabled) return;
                    setActiveKey(child.key);
                    selectLeaf(child.key);
                  }}
                >
                  {inner}
                </a>
              ) : (
                <button
                  {...shared}
                  type="button"
                  onClick={() => {
                    if (child.disabled) return;
                    setActiveKey(child.key);
                    // 有子层的父项点击不选中（与 inline 态父项语义一致）；进下一层靠悬浮 / → 键。
                    if (!childHasChildren) selectLeaf(child.key);
                  }}
                >
                  {inner}
                </button>
              )}
              {childHasChildren ? (
                <div
                  data-flyout
                  data-depth={depth + 1}
                  role="none"
                  className={FLYOUT_WRAP}
                  style={revealStyle}
                >
                  <div className={cn(FLYOUT_PANEL, "min-w-40")}>
                    {renderFlyoutList(child.children!, depth + 1)}
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    );

    return (
      <nav
        aria-label={resolvedAriaLabel}
        className={cn("w-14 shrink-0 select-none text-foreground", className)}
        onKeyDown={asList ? undefined : onKeyDown}
        {...props}
      >
        <ul role={listRole} aria-label={listLabel} className="flex flex-col gap-1">
          {tops.map((item) => {
            const isSelected = selectedSet.has(item.key);
            const branchActive = isSelected || hasSelectedDescendant(item, selectedSet);
            const isActive = item.key === effectiveActive;
            const hasChildren = !!item.children?.length;
            const positioned = flyoutPos[item.key];
            return (
              <li
                key={item.key}
                role={asList ? undefined : "none"}
                className="group/col relative"
                // 悬浮与聚焦都要量：键盘用户是先 Tab 到轨道上的图标（本 li 内），
                // 再按 → 进飞出层 —— 那时面板必须已定位好，否则 focus() 会落进一个
                // 还没被摆到正确位置（且 visibility:hidden）的容器里。
                onMouseEnter={() => measureFlyout(item.key)}
                onFocus={() => measureFlyout(item.key)}
              >
                <button
                  type="button"
                  {...(asList
                    ? { "aria-current": isSelected ? ("page" as const) : undefined }
                    : {
                        role: "treeitem" as const,
                        "aria-selected": isSelected || undefined,
                        tabIndex: isActive ? 0 : -1,
                      })}
                  aria-disabled={item.disabled || undefined}
                  aria-haspopup={hasChildren || undefined}
                  data-selected={branchActive ? "" : undefined}
                  ref={(el) => {
                    if (el) itemRefs.current.set(item.key, el);
                    else itemRefs.current.delete(item.key);
                  }}
                  onFocus={() => setActiveKey(item.key)}
                  onClick={() => {
                    if (item.disabled) return;
                    setActiveKey(item.key);
                    if (!hasChildren) {
                      setSelected([item.key]);
                      onSelect?.(item.key, item);
                    }
                  }}
                  className={cn(
                    "relative grid size-11 place-items-center rounded-lg outline-none transition-colors",
                    "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
                    "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                    "data-[selected]:bg-primary/10 data-[selected]:text-primary",
                    "aria-disabled:pointer-events-none aria-disabled:opacity-50",
                    "before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:rounded-full before:bg-primary before:opacity-0 data-[selected]:before:opacity-100",
                  )}
                >
                  <span aria-hidden className="[&>svg]:size-5">
                    {item.icon ?? (
                      <span className="text-sm font-medium">{firstGlyph(item.label)}</span>
                    )}
                  </span>
                </button>
                {/* 飞出层：hover / focus-within 才显示；第一层用 fixed + 实测坐标贴在图标右侧，
                    以逃出侧栏滚动容器的裁剪。第二层起仍是 absolute（此时祖先已是不裁剪的面板） */}
                <div
                  data-flyout
                  data-depth={1}
                  data-positioned={positioned ? "" : undefined}
                  role="none"
                  className={FLYOUT_WRAP_FIXED}
                  style={{ ...revealStyle, top: positioned?.top ?? 0, left: positioned?.left ?? 0 }}
                >
                  <div className={cn(FLYOUT_PANEL, "min-w-44")}>
                    <div role="none" className="px-2.5 py-1.5 text-sm font-medium text-foreground">
                      {item.label}
                    </div>
                    {hasChildren ? renderFlyoutList(item.children!, 1) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  // ---- inline 态：递归手风琴 ----
  const renderNodes = (nodes: NavMenuNode[], depth: number) =>
    nodes.map((node) => {
      if (isGroup(node)) {
        return (
          <li key={node.key} role={asList ? undefined : "none"}>
            <div
              role="presentation"
              className="px-3 pb-1 pt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground first:pt-1"
            >
              {node.label}
            </div>
            <ul role={groupRole} className="flex flex-col gap-0.5">
              {/* 分组子项比分组标签缩进一级，建立层级（同 Ant Menu ItemGroup） */}
              {renderNodes(node.children, depth + 1)}
            </ul>
          </li>
        );
      }

      const hasChildren = !!node.children?.length;
      const expanded = hasChildren && openSet.has(node.key);
      const isSelected = selectedSet.has(node.key);
      const branchActive = isSelected || hasSelectedDescendant(node, selectedSet);
      const isActive = node.key === effectiveActive;
      const indent = { paddingLeft: `calc(0.75rem + ${depth} * 1rem)` };

      const rowClass = cn(
        "group/item relative flex w-full items-center gap-2.5 rounded-md py-2 pr-2.5 text-left text-sm outline-none transition-colors",
        "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        "data-[selected]:bg-primary/10 data-[selected]:font-medium data-[selected]:text-primary",
        "aria-disabled:pointer-events-none aria-disabled:opacity-50",
        "before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-0.5 before:rounded-full before:bg-primary before:opacity-0 data-[selected]:before:opacity-100",
      );

      const content = (
        <>
          {node.icon ? (
            <span aria-hidden className="shrink-0 text-current [&>svg]:size-4">
              {node.icon}
            </span>
          ) : null}
          <span className="flex-1 truncate">{node.label}</span>
          {hasChildren ? (
            <svg
              data-chevron
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(
                "size-3.5 shrink-0 text-muted-foreground transition-transform",
                expanded && "rotate-90",
              )}
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          ) : null}
        </>
      );

      const shared = {
        ...(asList
          ? // 不写 role / tabIndex：<a> 是 link、<button> 是 button，Tab 逐项即可。
            { "aria-current": isSelected ? ("page" as const) : undefined }
          : {
              role: "treeitem" as const,
              "aria-selected": isSelected || undefined,
              tabIndex: isActive ? 0 : -1,
            }),
        // aria-expanded 两档都要：list 档下它是 button 上合法的 disclosure 语义。
        "aria-expanded": hasChildren ? expanded : undefined,
        "aria-disabled": node.disabled || undefined,
        "data-selected": branchActive ? "" : undefined,
        style: indent,
        // 有行尾 actions 时多留右内边距，避免标题文字钻到操作按钮下方。
        className: cn(rowClass, node.actions != null && "pr-9"),
        ref: (el: HTMLElement | null) => {
          if (el) itemRefs.current.set(node.key, el);
          else itemRefs.current.delete(node.key);
        },
        onFocus: () => setActiveKey(node.key),
      };

      // render 逃生口（hulianui/hulian#59）：把皮肤与键盘漫游属性合并进消费方给的元素，
      // 于是 react-router / next/link 这类客户端路由件既保住 <a> 语义又不整页刷新。
      const leafClick = () => {
        if (node.disabled) return;
        setActiveKey(node.key);
        setSelected([node.key]);
        onSelect?.(node.key, node);
      };

      const rowEl =
        node.render && !hasChildren ? (
          cloneElement(
            node.render,
            {
              ...shared,
              "aria-current": isSelected ? "page" : undefined,
              className: cn(
                shared.className,
                (node.render.props as { className?: string }).className,
              ),
              onClick: (event: MouseEvent) => {
                (node.render!.props as { onClick?: (e: MouseEvent) => void }).onClick?.(event);
                leafClick();
              },
            } as Record<string, unknown>,
            content,
          )
        ) : node.href && !hasChildren ? (
          <a
            {...shared}
            href={node.href}
            aria-current={isSelected ? "page" : undefined}
            onClick={leafClick}
          >
            {content}
          </a>
        ) : (
          <button
            {...shared}
            type="button"
            onClick={() => {
              if (node.disabled) return;
              setActiveKey(node.key);
              if (hasChildren) toggleOpen(node.key, !expanded);
              else {
                setSelected([node.key]);
                onSelect?.(node.key, node);
              }
            }}
          >
            {content}
          </button>
        );

      return (
        <li key={node.key} role={asList ? undefined : "none"}>
          {/* 行尾操作槽：渲染在 treeitem 按钮【之外】（绝对覆盖行右侧），避免 <button> 内嵌交互元素。
              覆盖层 pointer-events-none → 空白区点击穿透回行按钮；其直接子（动作元素）恢复可点。
              消费者可用 group-hover/nav-row 做「hover 才显」。 */}
          {node.actions != null ? (
            <div className="group/nav-row relative">
              {rowEl}
              <span className="pointer-events-none absolute inset-y-0 right-1.5 z-10 flex items-center [&>*]:pointer-events-auto">
                {node.actions}
              </span>
            </div>
          ) : (
            rowEl
          )}

          {hasChildren ? (
            <div
              data-submenu
              className={cn(
                "grid transition-[grid-template-rows]",
                expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
              style={{
                transitionDuration: reduced ? "0ms" : motionDurationCss.base,
                transitionTimingFunction: motionEaseCss.out,
              }}
            >
              <div className="min-h-0 overflow-hidden">
                <ul role={groupRole} className="flex flex-col gap-0.5 pt-0.5">
                  {renderNodes(node.children!, depth + 1)}
                </ul>
              </div>
            </div>
          ) : null}
        </li>
      );
    });

  return (
    <nav
      aria-label={resolvedAriaLabel}
      className={cn("w-60 shrink-0 select-none text-foreground", className)}
      // list 档不接管方向键：那是 tree widget 的键盘契约，这里交回浏览器（Tab 逐项 + 原生激活）。
      onKeyDown={asList ? undefined : onKeyDown}
      {...props}
    >
      <ul role={listRole} aria-label={listLabel} className="flex flex-col gap-0.5">
        {renderNodes(items, 0)}
      </ul>
    </nav>
  );
}

// 飞出面板外壳：`left-full` 贴在自己那一行右侧；用 `pl-2` 而不是 `ml-2` 留间距，
// 让「图标轨 → 面板」之间那 8px 也算在本层的命中区内，鼠标横移过去时 hover 不会中断。
//
// 可见性刻意不用 Tailwind 具名 group：`group-hover/x:` 编译成【后代】选择器，
// 多级嵌套时同名 group 会让祖先 hover 连带点亮所有后代面板（三级四级同时炸开）。
// 这里用 `li:hover>&` / `li:focus-within>&` 直接子选择器，每层只认自己那个 li，天然自洽。
const FLYOUT_WRAP = cn(
  "pointer-events-none absolute left-full top-0 z-50 pl-2 opacity-0 transition-opacity",
  "[li:hover>&]:pointer-events-auto [li:hover>&]:opacity-100",
  "[li:focus-within>&]:pointer-events-auto [li:focus-within>&]:opacity-100",
);
// 第一层飞出层专用：`fixed` 而不是 `absolute`。
// 原因是裁剪，不是层叠 —— 收起态的图标轨几乎总住在一个可滚动容器里（`AdminLayout` 用的是
// ScrollArea），`overflow: hidden/auto` 的祖先会把 absolute 的面板整块裁掉：面板在 DOM 里、
// 有尺寸、opacity=1，但一个像素都画不出来（elementFromPoint 打到的是内容区）。
// fixed 的包含块是视口，不受祖先 overflow 影响；代价是 `left-full/top-0` 这种相对定位失效，
// 坐标必须 JS 实测（见 measureFlyout）。第二层起不需要：它们的祖先就是本面板，不裁剪。
const FLYOUT_WRAP_FIXED = cn(
  "pointer-events-none fixed z-50 pl-2 opacity-0 transition-opacity",
  "[li:hover>&]:pointer-events-auto [li:hover>&]:opacity-100",
  "[li:focus-within>&]:pointer-events-auto [li:focus-within>&]:opacity-100",
);
const FLYOUT_PANEL = "rounded-lg border border-border bg-surface p-1 shadow-lg";
// 飞出层行（叶子与父项共用；父项多一枚右向 chevron 提示还有下一层）。
const FLYOUT_ROW = cn(
  "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm outline-none transition-colors",
  "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
  "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
  "data-[selected]:bg-primary/10 data-[selected]:font-medium data-[selected]:text-primary",
  "aria-disabled:pointer-events-none aria-disabled:opacity-50",
);

// 飞出层父项的「还有下一层」指示（纯装饰，aria-hidden）。
function FlyoutChevron() {
  return (
    <svg
      data-chevron
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3.5 shrink-0 text-muted-foreground"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

// collapsed 无 icon 时取 label 首字符兜底（中文取首字、英文取首字母大写）。
function firstGlyph(label: React.ReactNode): string {
  if (typeof label === "string" && label.length) return label.trim().charAt(0).toUpperCase();
  if (typeof label === "number") return String(label).charAt(0);
  return "•";
}
