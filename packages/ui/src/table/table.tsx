"use client";
import {
  Fragment,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getExpandedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnPinningState,
  type SortingState,
  type RowSelectionState,
  type ExpandedState,
  type ColumnFiltersState,
  type ColumnSizingState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronRight, GripVertical } from "../_icons";
import { Button } from "../button/button";
import { Checkbox } from "../checkbox/checkbox";
import { useLocaleValue } from "../config/locale-context";
import { Empty } from "../empty";
import { cn } from "../lib/cn";
import { warnOnce } from "../lib/warn-once";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../tooltip/tooltip";
import type { RowDragEndEvent, TableProps } from "./table.types";
import { planCellSpans, planHeaderRows, spanKey } from "./table.span";
import { TABLE_DENSITY_PAD, TABLE_WHITESPACE_CLASS } from "./table-primitives";

const SELECT_COL = "__select__";
const EXPANDER_COL = "__expander__";
const DRAG_COL = "__drag__";

// 行点击冒泡隔离：点击落在行内交互元素（链接/按钮/表单控件，含前插的复选框/展开器）时
// 不触发行级动作，各自的 onClick 照常工作。
// 注意瑚琏 Checkbox 的 Root 是 span[role=checkbox]（非原生 input），须靠 role 命中。
const ROW_INTERACTIVE_SELECTOR =
  "a,button,input,select,textarea,label,[role='button'],[role='checkbox'],[role='switch'],[role='menuitem']";

// ── 固定列：从 TanStack 原生 pinning 读 offset，皮肤补 sticky 几何 ──────────
// （meta.sticky 只是初始 columnPinning 的派生源；offset 走 getStart/getAfter 不手算累加宽度）
/** #194：单元格垂直对齐（表头恒 middle，不跟随）。 */
const VALIGN_CLASS = { top: "align-top", middle: "align-middle", bottom: "align-bottom" } as const;
/**
 * #194：按列的换行策略。
 * `pre-wrap` 连带 `break-words` —— 否则超长无空格串（URL / 身份证号）会撑破列宽，
 * 而「保留原文换行」的那些字段恰恰最容易混进这种串。
 */
// 类名与组合原语共用一份（#285）：换行是皮肤的一部分，两边不能各写一套。
const WHITESPACE_CLASS = TABLE_WHITESPACE_CLASS;

function stickyStyle<TData>(column: Column<TData, unknown>): React.CSSProperties | undefined {
  const pinned = column.getIsPinned();
  if (!pinned) return undefined;
  return {
    position: "sticky",
    left: pinned === "left" ? column.getStart("left") : undefined,
    right: pinned === "right" ? column.getAfter("right") : undefined,
    zIndex: 1,
  };
}
function stickyClass<TData>(column: Column<TData, unknown>): string | undefined {
  const pinned = column.getIsPinned();
  if (!pinned) return undefined;
  // 固定列须实心底色（否则横滚时下层内容透出来）；边缘列加投影分隔（防 [[element-ui-table-fixed-right-overflow-leak]] 那类溢出/透漏）
  return cn(
    "bg-bg",
    pinned === "left" && column.getIsLastColumn("left") && "shadow-pin-left",
    pinned === "right" && column.getIsFirstColumn("right") && "shadow-pin-right",
  );
}

function colId<TData>(c: ColumnDef<TData, any>): string {
  if (c.id) return c.id;
  if ("accessorKey" in c && c.accessorKey != null) return String(c.accessorKey);
  return "";
}

// ── 列几何：宽度 / 对齐 / 溢出省略 ──────────────────────────────────────────
// 宽度只走「单元格内联 style」这一条路（th 与 td 用同一个 style 对象），不另开 <colgroup>——
// 两套并存必然漂移，且 <col> 在浏览器里只认 width，min-width/max-width 会被忽略。
// 内建前插列的 id 约定（__select__ / __expander__ / __drag__）：固定几何的图标列，恒不可拖拽调宽
const BUILT_IN_COL = /^__.+__$/;
const ALIGN_TEXT = { left: "text-left", center: "text-center", right: "text-right" } as const;
const ALIGN_ITEMS = { left: "items-start", center: "items-center", right: "items-end" } as const;
type Align = keyof typeof ALIGN_TEXT;

/** 列上「消费者显式写了的」宽度声明（区别于 TanStack 兜的默认值）。 */
interface DeclaredWidth {
  size?: number;
  minSize?: number;
  maxSize?: number;
}

/**
 * 采集显式宽度声明。
 *
 * 不能读 `column.columnDef.size` 判有无——TanStack 会把 defaultColumn
 * （size:150 / minSize:20 / maxSize:Number.MAX_SAFE_INTEGER）合并进每个 columnDef，
 * 于是"没写 size"和"写了 150"在那里长得一模一样，照着出宽度就把整张表钉成等宽。
 * 所以口径只认消费者原始传入的 ColumnDef 对象。
 */
function collectDeclaredWidths<TData>(defs: ColumnDef<TData, any>[]): Map<string, DeclaredWidth> {
  const map = new Map<string, DeclaredWidth>();
  const walk = (list: ColumnDef<TData, any>[]) => {
    for (const c of list) {
      map.set(colId(c), { size: c.size, minSize: c.minSize, maxSize: c.maxSize });
      // 分组列（多级表头）：真正承载数据的是嵌套里的叶子列，宽度也声明在它们身上。
      // 只扫顶层的话，分组表里每一列的 size / minSize / maxSize 全部读不到，
      // auto 布局下等于没写（#261）。
      const sub = (c as { columns?: ColumnDef<TData, any>[] }).columns;
      if (sub?.length) walk(sub);
    }
  };
  walk(defs);
  return map;
}


/**
 * 把 ColumnDef 的 size / minSize / maxSize 落成真实宽度样式。
 *
 * auto 布局下**只认显式声明**（见 collectDeclaredWidths）；fixed 布局下每列都出实宽。
 *
 * 固定列例外：sticky 的 left/right offset 由 `getStart/getAfter` 按 `getSize()` 累加得出，
 * 渲染宽必须与该口径一致，否则贴边偏移错位。故 pinned 列即使没写 size 也钉死 getSize()。
 * 列宽变化（改 size / 拖拽调宽）后 offset 自动重算——每次渲染都现读 getStart/getAfter。
 */
function colWidthStyle<TData>(
  column: Column<TData, unknown>,
  fixedLayout: boolean,
  declared: Map<string, DeclaredWidth>,
): React.CSSProperties {
  if (fixedLayout) {
    const w = column.getSize();
    return { width: w, minWidth: w, maxWidth: w };
  }
  const d = declared.get(column.id);
  const style: React.CSSProperties = {};
  if (d?.size != null) style.width = column.getSize();
  if (d?.minSize != null) style.minWidth = d.minSize;
  if (d?.maxSize != null) style.maxWidth = d.maxSize;
  // 省略号要生效必须有 max-width 收口，否则 auto 布局下列被内容撑开、truncate 永不触发
  if (column.columnDef.meta?.ellipsis && style.maxWidth == null && style.width != null)
    style.maxWidth = style.width;
  if (column.getIsPinned()) {
    const w = column.getSize();
    style.width = w;
    style.minWidth = w;
  }
  return style;
}

/**
 * 有 ellipsis 列时才挂 TooltipProvider：Base UI 的 delay 只认 Provider（Root 上没有这个 prop），
 * 不挂就是默认 600ms 起浮，表格里逐格扫读手感太钝。Provider 不产出 DOM 节点，可安全穿过 table 结构。
 */
function MaybeTooltipProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  if (!enabled) return <>{children}</>;
  return (
    <TooltipProvider delay={300} closeDelay={0}>
      {children}
    </TooltipProvider>
  );
}

/**
 * 溢出省略单元格：截断 + 悬停 Tooltip 显示全文（对标 el-table 的 show-overflow-tooltip）。
 *
 * 浮层内容取**原始值**而不是把 cell 再渲染一遍：自定义 cell 常含按钮/图片/链接，
 * 复制进浮层会产生重复的可交互元素与重复无障碍名。非文本值（对象/节点）只截断不挂浮层。
 * 触发器强制渲成 <span>（Base UI 默认是 <button>）——否则会被行点击的
 * ROW_INTERACTIVE_SELECTOR 命中，整列单元格都点不动行。
 */
function EllipsisCell({ value, children }: { value: unknown; children: React.ReactNode }) {
  const text = typeof value === "string" || typeof value === "number" ? String(value) : "";
  if (!text) return <span className="block truncate">{children}</span>;
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="block truncate">{children}</span>} />
      <TooltipContent className="max-w-xs break-words">{text}</TooltipContent>
    </Tooltip>
  );
}

// ── 行拖拽排序（@dnd-kit）──────────────────────────────────────────────────
// 库内 Sortable 渲染的是 <ul><li>，塞进 <tbody> 是非法 DOM，故这里在 <tr> 上直接挂
// useSortable（DndContext / SortableContext 都不产出 DOM 节点，可安全穿过 table 结构）。
// 顺序状态不归组件——onRowDragEnd 回传相对位置语义，data 仍由消费方掌控（家风同 sorting/selection）。

/** 行拖拽的 activator（把手）上下文：让前插的手柄列单元格拿到当行的 useSortable 产物。 */
interface RowDragHandleCtx {
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
  setActivatorNodeRef: (element: HTMLElement | null) => void;
  disabled: boolean;
}
const RowDragContext = createContext<RowDragHandleCtx | null>(null);

/** 手柄列单元格：只有它是 activator，行内其余区域照常点击/选择（dragHandle="cell"）。 */
function RowDragHandle() {
  const loc = useLocaleValue("table", {
    empty: "暂无数据",
    dragSort: "拖拽排序",
    selectAll: "全选",
    selectRow: "选择行",
    collapse: "收起",
    expand: "展开",
    filterPlaceholder: "筛选…",
    filter: (column) => `筛选 ${column}`,
    resizeColumn: "调整列宽",
  });
  const ctx = useContext(RowDragContext);
  // 无 context（理论不可达）→ 占位保持列宽，不渲染可交互元素
  if (!ctx) return <span className="inline-block size-5" />;
  // 这里刻意**不**用 <Button size="iconXs">（同尺寸的展开器已经收编过去了，#146）：
  // Button 基座带 `disabled:pointer-events-none`，而拖拽手柄禁用时要保留 cursor-not-allowed
  // 作为「这行不能拖」的反馈 —— 没有指针事件就没有光标变化。改过去得写三条 disabled: 覆盖
  // （pointer-events-auto / cursor / opacity）把基座顶回来，比这段手写还长，属于为了统一而统一。
  return (
    <button
      type="button"
      ref={ctx.setActivatorNodeRef}
      {...ctx.attributes}
      {...ctx.listeners}
      disabled={ctx.disabled}
      aria-label={loc.dragSort ?? "拖拽排序"}
      // touch-none：触屏上不让页面滚动劫持拖拽手势
      className={cn(
        // rounded-sm 而不是裸 rounded：本库 @theme 注册了 --radius，裸 rounded 就是 10px，
        // 落在 20px 方块上是个圆片（与 Button 的 iconXs 档同源，见 button-base.ts）。
        "inline-grid size-5 place-items-center rounded-sm text-muted-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
        ctx.disabled
          ? "cursor-not-allowed opacity-40"
          : "cursor-grab touch-none hover:text-foreground active:cursor-grabbing",
      )}
    >
      <GripVertical className="size-4" aria-hidden />
    </button>
  );
}

/** 传给 <tr> 的拖拽渲染产物（皮肤只消费这几项，不直接碰 dnd-kit 内部）。 */
interface RowDragRender {
  setNodeRef: (element: HTMLElement | null) => void;
  style: React.CSSProperties;
  isDragging: boolean;
  /** dragHandle="row" 时挂到 <tr> 自身的 activator props；"cell" 模式为空对象 */
  activator: React.HTMLAttributes<HTMLTableRowElement>;
}

/**
 * dragHandle="row"：activator 落在整行上，但**行内交互元素上的手势不得起拖**——
 * 否则点复选框/展开器/操作按钮会被拖拽吞掉（复用行点击那套 ROW_INTERACTIVE_SELECTOR）。
 */
function guardRowListeners(listeners: DraggableSyntheticListeners): DraggableSyntheticListeners {
  if (!listeners) return listeners;
  const guarded: Record<string, (event: unknown) => void> = {};
  for (const [name, handler] of Object.entries(listeners)) {
    guarded[name] = (event: unknown) => {
      const target = (event as { target?: unknown } | null)?.target;
      if (target instanceof Element && target.closest(ROW_INTERACTIVE_SELECTOR)) return;
      (handler as (e: unknown) => void)(event);
    };
  }
  return guarded as DraggableSyntheticListeners;
}

/**
 * DndContext 宿主。sensors 的 hook 收在这里、而非 Table 本体，是为了让**不开 rowDraggable
 * 的消费方一个 dnd-kit hook 都不执行**——此前 `useSensors` 写在 Table 顶层（hook 不可条件调用），
 * 于是任何用了 Table 的下游都会拉起整条 dnd-kit 运行时；下游 vitest 里 @dnd-kit 无 exports 字段、
 * 只有 legacy main/module，解析出第二份 React 后整页崩，而栈顶在 dnd-kit 内部、极难归因。
 * 组件不是 hook，声明在这里零成本；只有 dragEnabled 时才挂载。
 */
function RowDndProvider({
  onDragStart,
  onDragOver,
  onDragEnd,
  onDragCancel,
  children,
}: {
  onDragStart: (e: DragStartEvent) => void;
  onDragOver: (e: DragOverEvent) => void;
  onDragEnd: (e: DragEndEvent) => void;
  onDragCancel: () => void;
  children: React.ReactNode;
}) {
  // 指针通道设 6px 距离阈值（不吞掉行点击 / 行内按钮的 click）+ 键盘通道（Space 抓起 · 方向键移动 · Space 放下）。
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      {children}
    </DndContext>
  );
}

/** 单行的 useSortable 宿主：hook 必须按行独立调用，故拆成组件 + render prop（不产出额外 DOM）。 */
function DraggableRow({
  id,
  disabled,
  handleMode,
  render,
}: {
  id: string;
  disabled: boolean;
  handleMode: "row" | "cell";
  render: (drag: RowDragRender) => React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled,
    // 整行拖时 <tr> 必须保住 row 语义（dnd-kit 默认把 activator 写成 role="button"）；
    // 手柄模式 activator 本身就是 <button>，用默认即可。
    attributes: handleMode === "row" ? { role: "row" } : undefined,
  });

  const ctx = useMemo<RowDragHandleCtx>(
    () => ({ attributes, listeners, setActivatorNodeRef, disabled }),
    [attributes, listeners, setActivatorNodeRef, disabled],
  );

  const activator = useMemo<React.HTMLAttributes<HTMLTableRowElement>>(() => {
    if (handleMode !== "row" || disabled) return {};
    return {
      ...attributes,
      ...guardRowListeners(listeners),
    } as React.HTMLAttributes<HTMLTableRowElement>;
  }, [handleMode, disabled, attributes, listeners]);

  return (
    <RowDragContext.Provider value={ctx}>
      {render({
        setNodeRef,
        // 用 Translate 不用 Transform：<tr> 上缩放会把整行几何拉花
        style: { transform: CSS.Translate.toString(transform), transition },
        isDragging,
        activator,
      })}
    </RowDragContext.Provider>
  );
}

/**
 * 由 dnd-kit 的 active/over 推导 onRowDragEnd 事件载荷（纯函数·可单测）。
 *
 * position 对标 baTable.dragSort() 的 direction：向下拖（overIndex > activeIndex）落在目标行**之后**
 * → "after"（= baTable 的 "down"）；向上拖落在目标行**之前** → "before"（= "up"）。
 * 落点未变（activeId === overId）或行已不存在时返回 null，调用方不触发回调。
 */
export function resolveRowDragEnd<TData>(
  activeId: string,
  overId: string,
  rows: readonly { id: string; index: number; original: TData }[],
  data: TData[],
): RowDragEndEvent<TData> | null {
  if (activeId === overId) return null;
  const activeIndex = rows.findIndex((r) => r.id === activeId);
  const overIndex = rows.findIndex((r) => r.id === overId);
  if (activeIndex < 0 || overIndex < 0) return null;
  const activeRow = rows[activeIndex];
  const overRow = rows[overIndex];
  return {
    activeId,
    overId,
    activeIndex,
    overIndex,
    position: overIndex > activeIndex ? "after" : "before",
    activeRow: activeRow.original,
    overRow: overRow.original,
    // row.index 是该行在原始 data 中的下标（不受排序/筛选影响），故重排直接落在 data 上
    nextData: arrayMove(data, activeRow.index, overRow.index),
  };
}

// headless 逻辑（useReactTable）+ 瑚琏皮肤（render）。逻辑/皮肤同文件但段落分离。
export function Table<TData>({
  columns,
  data,
  enableSorting = true,
  sorting: sortingProp,
  onSortingChange,
  striped = true,
  density = "default",
  bordered = true,
  getRowId,
  rowClassName,
  cellClassName,
  className,
  // 列几何（列宽 / 布局 / 拖拽调宽）
  layout = "auto",
  resizable = false,
  columnSizing: columnSizingProp,
  onColumnSizingChange,
  // 行点击 / 整行导航
  onRowClick,
  rowHref,
  onRowDoubleClick,
  // 行选择
  enableRowSelection,
  rowSelection: rowSelectionProp,
  onRowSelectionChange,
  // 可展开明细
  renderExpandedRow,
  getRowCanExpand,
  // 常驻整宽附属行 / 表尾
  renderRowExtra,
  footer,
  // 树形
  getSubRows,
  indent = 16,
  // 展开受控（树形 + 明细共用）
  expanded: expandedProp,
  onExpandedChange,
  // 筛选
  columnFilters: columnFiltersProp,
  onColumnFiltersChange,
  filterPlacement = "header",
  // 行拖拽排序
  rowDraggable = false,
  dragHandle = "cell",
  onRowDragEnd,
  getRowCanDrag,
  // 单元格合并
  cellSpan,
  // 单元格排版（表级默认，列 meta 可覆盖）
  cellAlign,
  headerAlign: headerAlignProp,
  cellVerticalAlign,
  cellWhitespace,
  // 表头吸顶 / 表体宽度下限
  stickyHeader = false,
  stickyHeaderOffset,
  maxHeight,
  minWidth,
  // 虚拟滚动
  virtual,
  // 底部悬浮横向滚动条
  stickyScrollbar = false,
  // 空态
  emptyText,
  renderEmpty,
}: TableProps<TData>) {
  const loc = useLocaleValue("table", {
    empty: "暂无数据",
    dragSort: "拖拽排序",
    selectAll: "全选",
    selectRow: "选择行",
    collapse: "收起",
    expand: "展开",
    filterPlaceholder: "筛选…",
    filter: (column) => `筛选 ${column}`,
    resizeColumn: "调整列宽",
  });
  const selectionEnabled = Boolean(enableRowSelection);
  const treeMode = Boolean(getSubRows);
  const panelMode = Boolean(renderExpandedRow);
  const hasExpander = treeMode || panelMode;
  const dragEnabled = Boolean(rowDraggable);
  // 表头吸顶两档（#238）：true 沿用旧口径 = "self"。
  const stickyMode = stickyHeader === true ? "self" : stickyHeader || null;
  const stickyToScrollParent = stickyMode === "scrollParent";
  const dragHandleCol = dragEnabled && dragHandle === "cell";
  // 拖拽调宽必须有确定列宽，否则手柄拖了没处落 → 强制切 fixed 布局。
  const fixedLayout = layout === "fixed" || resizable;
  // 任一列开 ellipsis 才挂 TooltipProvider（统一延迟分组，避免每格自带 600ms 默认延迟）
  const hasEllipsis = useMemo(() => columns.some((c) => c.meta?.ellipsis), [columns]);

  // 受控/非受控对称：传 state+onChange 即受控，否则内部 useState（家风同 sorting/Tabs/Slider）
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const sorting = sortingProp ?? internalSorting;
  const [internalSelection, setInternalSelection] = useState<RowSelectionState>({});
  const rowSelection = rowSelectionProp ?? internalSelection;
  const [internalExpanded, setInternalExpanded] = useState<ExpandedState>({});
  const expanded = expandedProp ?? internalExpanded;
  const [internalFilters, setInternalFilters] = useState<ColumnFiltersState>([]);
  const columnFilters = columnFiltersProp ?? internalFilters;
  const [internalSizing, setInternalSizing] = useState<ColumnSizingState>({});
  const columnSizing = columnSizingProp ?? internalSizing;

  // 自动前插：拖拽手柄列 + 选择列（含全选）+ 展开器列。前插列在用户列之前。
  const finalColumns = useMemo<ColumnDef<TData, any>[]>(() => {
    const lead: ColumnDef<TData, any>[] = [];
    if (dragHandleCol) {
      lead.push({
        id: DRAG_COL,
        size: 40,
        enableSorting: false,
        header: () => null,
        // 单元格拿不到当行的 useSortable 产物 → 走 RowDragContext（由 DraggableRow 注入）
        cell: () => <RowDragHandle />,
      });
    }
    if (selectionEnabled) {
      lead.push({
        id: SELECT_COL,
        size: 44,
        enableSorting: false,
        header: ({ table }) => (
          <Checkbox
            aria-label={loc.selectAll ?? "全选"}
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
            onCheckedChange={(v) => table.toggleAllRowsSelected(v)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label={loc.selectRow ?? "选择行"}
            checked={row.getIsSelected()}
            indeterminate={row.getIsSomeSelected() && !row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onCheckedChange={(v) => row.toggleSelected(v)}
          />
        ),
      });
    }
    if (hasExpander) {
      lead.push({
        id: EXPANDER_COL,
        size: 44,
        enableSorting: false,
        header: () => null,
        cell: ({ row }) =>
          row.getCanExpand() ? (
            <Button
              variant="ghost"
              tone="neutral"
              size="iconXs"
              aria-label={row.getIsExpanded() ? loc.collapse ?? "收起" : loc.expand ?? "展开"}
              aria-expanded={row.getIsExpanded()}
              onClick={row.getToggleExpandedHandler()}
              style={{ marginLeft: row.depth * indent }}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronRight
                className={cn("size-4 transition-transform", row.getIsExpanded() && "rotate-90")}
              />
            </Button>
          ) : (
            // 树形叶子：占位保持缩进对齐（明细模式 depth 恒 0 → 无缩进）
            <span style={{ marginLeft: row.depth * indent }} className="inline-block size-5" />
          ),
      });
    }
    return [...lead, ...columns];
  }, [columns, dragHandleCol, selectionEnabled, hasExpander, indent, loc]);

  // 显式宽度声明表（含前插列）：宽度渲染的唯一口径，不读被 defaultColumn 污染过的 columnDef
  const declaredWidths = useMemo(() => collectDeclaredWidths(finalColumns), [finalColumns]);

  // 固定列：从用户列 meta.sticky 派生初始 pinning（静态，不随交互变）。
  // 若存在左固定列，前插的选择/展开器列也跟随固定到左侧，否则横滚会丢失它们。
  const columnPinning = useMemo<ColumnPinningState>(() => {
    const left: string[] = [];
    const right: string[] = [];
    const hasLeft = columns.some((c) => c.meta?.sticky === "left");
    if (hasLeft) {
      if (dragHandleCol) left.push(DRAG_COL);
      if (selectionEnabled) left.push(SELECT_COL);
      if (hasExpander) left.push(EXPANDER_COL);
    }
    for (const c of columns) {
      const s = c.meta?.sticky;
      if (s === "left") left.push(colId(c));
      else if (s === "right") right.push(colId(c));
    }
    return { left, right };
  }, [columns, dragHandleCol, selectionEnabled, hasExpander]);

  const table = useReactTable<TData>({
    data,
    columns: finalColumns,
    state: {
      sorting,
      rowSelection,
      expanded,
      columnFilters,
      columnPinning,
      columnSizing,
    },
    enableSorting,
    enableRowSelection,
    enableColumnResizing: resizable,
    // onChange：拖拽过程中实时改宽，固定列 offset 跟着 getStart/getAfter 同帧重算
    columnResizeMode: "onChange",
    onColumnSizingChange: onColumnSizingChange ?? setInternalSizing,
    getRowCanExpand: panelMode && !treeMode ? getRowCanExpand ?? (() => true) : getRowCanExpand,
    getSubRows,
    onSortingChange: onSortingChange ?? setInternalSorting,
    onRowSelectionChange: onRowSelectionChange ?? setInternalSelection,
    onExpandedChange: onExpandedChange ?? setInternalExpanded,
    onColumnFiltersChange: onColumnFiltersChange ?? setInternalFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(hasExpander ? { getExpandedRowModel: getExpandedRowModel() } : {}),
    getRowId,
  });

  const colCount = table.getAllLeafColumns().length;
  const rows = table.getRowModel().rows;

  // 密度：仅作用于单元格内边距（表头/表体共用），default 维持原 px-3 py-2。
  // 与组合原语（#241）共用同一份档位表，两套皮肤不分家。
  const cellPad = TABLE_DENSITY_PAD[density];

  // 虚拟滚动（可选）：hook 恒调用（无虚拟时 getScrollElement 返回 null → 闲置）。
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualEnabled = Boolean(virtual?.enabled);
  const rowHeight = virtual?.rowHeight ?? 44;
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan: virtual?.overscan ?? 8,
  });

  // ── 单元格合并（#176）────────────────────────────────────────────────────
  // 两个组合天然无解，静默不合并 + dev 告警，而不是画出一张错位的表：
  //  · 虚拟滚动只渲染可见窗口，跨窗口的 rowSpan 没有落点；
  //  · 明细展开会在数据行之间插 <tr>，纵向合并会跨过那一行（HTML 的 rowSpan 按后续 <tr> 计数）；
  //  · 常驻附属行（renderRowExtra）同理，而且它连「没展开就没有」这个逃生口都没有。
  const spanBlockedBy = virtualEnabled
    ? "virtual"
    : panelMode
    ? "renderExpandedRow"
    : renderRowExtra
    ? "renderRowExtra"
    : null;
  // 附属行与虚拟滚动：虚拟化按「一条数据 = 一行 rowHeight」估高并据此撑占位行，
  // 每行再挂 N 条附属行后估高必然偏小 —— 表现是滚动位置漂移 / 底部留白。
  // 不静默关掉（关了消费方的证书行就没了，比错位更难查），只告警。
  if (renderRowExtra && virtualEnabled) {
    warnOnce(
      "table-row-extra-with-virtual",
      "[hulian] Table: renderRowExtra 与 virtual 同开会让虚拟化的行高估算失准（它按每条数据一行 rowHeight 撑占位），" +
        "表现是滚动漂移 / 底部留白。附属行数量固定时可把 virtual.rowHeight 调成「数据行 + 附属行」的总高。",
    );
  }
  if (cellSpan && spanBlockedBy) {
    warnOnce(
      `table-cell-span-with-${spanBlockedBy}`,
      `[hulian] Table: cellSpan 与 ${spanBlockedBy} 不能同开，本次不做合并。` +
        `（虚拟滚动只渲染可见窗口 / 明细面板会插在数据行之间，跨行合并在这两种情况下无解）`,
    );
  }
  const spanEnabled = Boolean(cellSpan) && !spanBlockedBy;
  const spanPlan = useMemo(() => {
    if (!cellSpan || !spanEnabled) return null;
    const cellsByRow = rows.map((r) => r.getVisibleCells());
    const originals = rows.map((r) => r.original);
    const cols = cellsByRow[0]?.length ?? 0;
    return planCellSpans(rows.length, cols, (r, c) => {
      const cell = cellsByRow[r]?.[c];
      if (!cell) return undefined;
      return cellSpan({
        row: originals[r] as TData,
        rowIndex: r,
        rows: originals,
        columnId: cell.column.id,
        columnIndex: c,
        value: cell.getValue(),
      });
    });
  }, [cellSpan, spanEnabled, rows]);

  // cellClassName 的 ctx.rows（#289）：与 cellSpan 同口径 —— 渲染顺序（排序/筛选之后）的原始数据。
  // 不传 cellClassName 的表一格也不回调，这份数组也就不必存在。
  const originalRows = useMemo(
    () => (cellClassName ? rows.map((r) => r.original) : ([] as TData[])),
    [cellClassName, rows],
  );


  // ── 底部悬浮横向滚动条（#149）────────────────────────────────────────────────
  // 宽表比视口高时，真正的横向滚动条落在表格底边、被挤到折叠线以下 —— 想横向拖一下
  // 得先把整页滚到表底。这里在表格外壳里再放一条 `position: sticky; bottom: 0` 的
  // 代理滚动条：它只有一个撑到 scrollWidth 的空占位子元素，滚动位置与真容器双向同步。
  //
  // 三条实现要点，改动前先读懂：
  //  1. 代理条必须是滚动容器的**兄弟**而不是子节点 —— 放进 `overflow-x-auto` 里面，
  //     sticky 就只相对那个容器定位，永远贴不到视口底。所以开启时才多包一层外壳。
  //  2. window 上的 scroll 监听走**捕获**（第三参 true）：scroll 事件不冒泡，
  //     表格外面套着内层滚动容器（AdminLayout 的内容区就是）时，非捕获收不到。
  //  3. 虚拟滚动下整个容器是定高的，横向滚动条本来就贴在容器底边、一直看得见，
  //     这条代理条纯属多余，所以直接不启用。
  const barRef = useRef<HTMLDivElement>(null);
  // 外壳自己就是定高滚动容器时（virtual / maxHeight），横向滚动条本来就贴在容器底边、
  // 一直看得见，再挂一条代理条就是上下两条并排。
  // scrollParent 吸顶档下外壳根本不横向滚动（见下方 #238 注释），代理条没有可镜像的容器。
  const stickyBarEnabled =
    stickyScrollbar && !virtualEnabled && maxHeight == null && !stickyToScrollParent;
  const [bar, setBar] = useState({ width: 0, visible: false });

  useEffect(() => {
    if (!stickyBarEnabled) return;
    const el = scrollRef.current;
    if (!el) return;

    const sync = (event?: Event) => {
      const barEl = barRef.current;
      // 代理条自己滚动时**不能**回写它 —— window 上的捕获监听跑在目标自身的
      // onScroll 之前，回写会把用户刚拖出来的位置抹回旧值，代理条当场拖不动。
      // 镜像方向永远是「真容器 → 代理条」，反向由代理条的 onScroll 负责。
      const fromBar = barEl !== null && event?.target === barEl;
      // 滚动位置镜像走命令式，不进 state —— 每帧 setState 会让整张表重渲染。
      if (barEl && !fromBar && barEl.scrollLeft !== el.scrollLeft) barEl.scrollLeft = el.scrollLeft;

      const overflowing = el.scrollWidth - el.clientWidth > 1;
      // 表格底边还在视口里时，真滚动条本来就够得着，再挂一条会变成上下两条并排。
      const belowFold = el.getBoundingClientRect().bottom > window.innerHeight;
      const next = { width: el.scrollWidth, visible: overflowing && belowFold };
      // 返回同一个引用让 React bail out：不然滚动时每帧都是新对象。
      setBar((prev) => (prev.width === next.width && prev.visible === next.visible ? prev : next));
    };

    sync();
    // 容器尺寸与**表格本身**的宽度都要盯：拖列宽只改后者，只观察容器会漏掉。
    // ResizeObserver 做存在性判断——jsdom 默认没有它，直接 new 会让整棵树挂掉。
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => sync());
      ro.observe(el);
      const tableEl = el.querySelector("table");
      if (tableEl) ro.observe(tableEl);
    }
    window.addEventListener("scroll", sync, true);
    window.addEventListener("resize", sync);
    return () => {
      ro?.disconnect();
      window.removeEventListener("scroll", sync, true);
      window.removeEventListener("resize", sync);
    };
  }, [stickyBarEnabled]);

  // 空态宽度：只在真的空的时候量，非空表零成本。
  const [emptyViewportWidth, setEmptyViewportWidth] = useState<number | null>(null);
  const isEmpty = rows.length === 0;
  useEffect(() => {
    if (!isEmpty) return;
    const el = scrollRef.current;
    if (!el) return;
    const sync = () => setEmptyViewportWidth(el.clientWidth || null);
    sync();
    let ro: ResizeObserver | undefined;
    // jsdom 默认没有 ResizeObserver，直接 new 会把整棵树挂掉。
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => sync());
      ro.observe(el);
    }
    window.addEventListener("resize", sync);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [isEmpty]);

  const rowClass = (selected: boolean) =>
    cn(
      "border-b border-border transition-colors last:border-0 hover:bg-surface-hover",
      striped && "even:bg-surface-hover/40",
      selected && "bg-primary/10 hover:bg-primary/10",
    );

  // ── 行拖拽排序 ────────────────────────────────────────────────────────────
  // rowIds/dragState 恒声明（React hook 不可条件调用），但都是 React 自带 hook，与 dnd-kit 无关。
  // dnd-kit 自己的 hook（useSensors/useSortable）全部收进 RowDndProvider / DraggableRow 两个
  // 子组件，rowDraggable=false 时它们不挂载 → 一个 dnd-kit hook 都不执行。
  const rowIds = useMemo(() => rows.map((r) => r.id), [rows]);
  // 拖拽中的 active/over：只喂落点指示线，拖完即清。顺序始终由 data 决定，组件不偷存。
  const [dragState, setDragState] = useState<{ activeId: string; overId: string | null } | null>(
    null,
  );
  // 树形子行（depth>0）恒不可拖：跨层级落点语义未定义，禁掉比给个错语义强。
  // disabled 传给 useSortable 会同时关掉 draggable 与 droppable → 禁用行既抓不起也不能当落点。
  const canDragRow = (row: (typeof rows)[number], index: number) =>
    dragEnabled && row.depth === 0 && (getRowCanDrag ? getRowCanDrag(row.original, index) : true);

  const handleDragStart = (e: DragStartEvent) =>
    setDragState({ activeId: String(e.active.id), overId: null });
  const handleDragOver = (e: DragOverEvent) =>
    setDragState((s) => (s ? { ...s, overId: e.over ? String(e.over.id) : null } : s));
  const handleDragEnd = (e: DragEndEvent) => {
    setDragState(null);
    if (!e.over) return;
    const payload = resolveRowDragEnd(String(e.active.id), String(e.over.id), rows, data);
    if (payload) onRowDragEnd?.(payload);
  };

  // 单行皮肤。drag=null 即未开拖拽，渲染结果与改造前逐字一致。
  const renderTr = (row: (typeof rows)[number], index: number, drag: RowDragRender | null) => {
    // 行点击 / 整行导航：onRowClick 优先；rowHref 按行返回 undefined 即该行不可点。
    const href = onRowClick ? undefined : rowHref?.(row.original, index);
    const rowInteractive = Boolean(onRowClick) || href != null;
    const activate = (e: React.MouseEvent | React.KeyboardEvent) => {
      if (onRowClick) {
        onRowClick(row.original, index);
        return;
      }
      if (href == null) return;
      if ("metaKey" in e && (e.metaKey || e.ctrlKey)) window.open(href, "_blank", "noopener");
      else window.location.assign(href);
    };

    // 点击/双击落在行内交互元素上时不触发行级动作（两者共用同一条隔离规则）。
    const hitsRowInteractive = (e: React.MouseEvent<HTMLTableRowElement>) => {
      const hit = (e.target as HTMLElement).closest(ROW_INTERACTIVE_SELECTOR);
      return Boolean(hit && e.currentTarget.contains(hit));
    };

    // dragHandle="row" 时 activator（role/tabIndex/onKeyDown/onPointerDown…）落在 <tr> 自身；
    // "cell" 模式为空对象，activator 在手柄列的 <button> 上。
    const activator = drag?.activator ?? {};
    const dragKeyDown = activator.onKeyDown;

    // 落点指示：over 行画一条主色边（向下拖压目标行下沿，向上拖压上沿）
    const dropEdge = (() => {
      if (!dragState?.overId) return null;
      if (dragState.overId !== row.id || dragState.activeId === row.id) return null;
      const from = rowIds.indexOf(dragState.activeId);
      const to = rowIds.indexOf(dragState.overId);
      if (from < 0 || to < 0) return null;
      return to > from ? ("after" as const) : ("before" as const);
    })();

    return (
      <tr
        ref={drag?.setNodeRef}
        style={drag?.style}
        {...activator}
        className={cn(
          rowClass(row.getIsSelected()),
          rowInteractive &&
            "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
          // 整行可拖：抓手光标 + touch-none（触屏不让滚动手势劫持拖拽）
          dragKeyDown && "cursor-grab touch-none active:cursor-grabbing",
          // 拖起行半透明并抬到上层，避免被相邻行的 hover 底色盖住
          drag?.isDragging && "relative z-[1] opacity-50",
          rowClassName?.(row.original, index),
        )}
        data-selected={row.getIsSelected() || undefined}
        data-dragging={drag?.isDragging || undefined}
        tabIndex={rowInteractive ? 0 : activator.tabIndex}
        onClick={
          rowInteractive
            ? (e) => {
                if (hitsRowInteractive(e)) return;
                activate(e);
              }
            : undefined
        }
        onDoubleClick={
          onRowDoubleClick
            ? (e) => {
                if (hitsRowInteractive(e)) return;
                onRowDoubleClick(row.original, index);
              }
            : undefined
        }
        onKeyDown={
          rowInteractive || dragKeyDown
            ? (e) => {
                // 只响应焦点落在 <tr> 自身的 Enter/Space，不劫持行内输入控件的按键
                if (rowInteractive && e.target === e.currentTarget) {
                  // 整行可拖时 Space 归 dnd-kit（抓起/放下），行点击只留 Enter，避免同键双语义
                  const activateKeys = dragKeyDown ? ["Enter"] : ["Enter", " "];
                  if (activateKeys.includes(e.key)) {
                    e.preventDefault();
                    activate(e);
                    return;
                  }
                }
                dragKeyDown?.(e);
              }
            : undefined
        }
      >
        {row.getVisibleCells().map((cell, colIndex) => {
          const meta = cell.column.columnDef.meta;
          const content = flexRender(cell.column.columnDef.cell, cell.getContext());
          // 被前面的格子合掉的位置整格不渲染 —— 留一个空 <td> 会把后面的列整体挤歪。
          const key = spanKey(index, colIndex);
          if (spanPlan?.hidden.has(key)) return null;
          const span = spanPlan?.spans.get(key);
          return (
            <td
              key={cell.id}
              rowSpan={span?.rowSpan}
              colSpan={span?.colSpan}
              // 宽度与 sticky 合成同一个 style 对象：th/td 用同一口径，二者不可分家
              style={{
                ...colWidthStyle(cell.column, fixedLayout, declaredWidths),
                ...stickyStyle(cell.column),
              }}
              className={cn(
                cellPad,
                // 垂直对齐与换行按列可控（#194）：一旦某列允许换行，同一行的短单元格再垂直居中
                // 就会与长单元格的首行对不齐，整行读起来是散的 —— 所以这两件事总是成对出现。
                VALIGN_CLASS[(meta?.verticalAlign ?? cellVerticalAlign ?? "middle") as keyof typeof VALIGN_CLASS],
                (meta?.whitespace ?? cellWhitespace) &&
                  WHITESPACE_CLASS[
                    (meta?.whitespace ?? cellWhitespace) as keyof typeof WHITESPACE_CLASS
                  ],
                // 水平对齐（#292）：列 `meta.align` 优先，缺省落表级 `cellAlign`，都不写才不落类（左）
                (meta?.align ?? cellAlign) && ALIGN_TEXT[(meta?.align ?? cellAlign) as Align],
                meta?.ellipsis && "overflow-hidden",
                stickyClass(cell.column),
                // 指示线走 inset box-shadow 而非真 border：<table> 是 border-collapse，
                // 加 border 会与相邻行分隔线合并、把行高顶掉 1~2px（拖拽中抖动）。
                dropEdge === "before" && "shadow-[inset_0_2px_0_0_var(--color-primary)]",
                dropEdge === "after" && "shadow-[inset_0_-2px_0_0_var(--color-primary)]",
                // 按值着色（#289）：放在最后一位，消费方的底色才盖得住固定列 / 拖拽指示那几档
                cellClassName?.({
                  row: row.original,
                  rowIndex: index,
                  rows: originalRows,
                  columnId: cell.column.id,
                  columnIndex: colIndex,
                  value: cell.getValue(),
                }),
              )}
            >
              {meta?.ellipsis ? (
                <EllipsisCell value={cell.getValue()}>{content}</EllipsisCell>
              ) : (
                content
              )}
            </td>
          );
        })}
      </tr>
    );
  };

  const renderRow = (row: (typeof rows)[number], index: number) => {
    // 明细面板行不是数据行、不参与拖拽，故留在 sortable <tr> 之外
    const panel = panelMode && row.getIsExpanded() && (
      <tr className="border-b border-border last:border-0">
        <td colSpan={colCount} className="bg-surface-hover/30 px-3 py-3">
          {renderExpandedRow!(row)}
        </td>
      </tr>
    );
    // 常驻附属行（#237）：不包壳，消费方返回的裸 <tr> 原样落进 <tbody>。
    // 与明细面板一样留在 sortable <tr> 之外 —— 它们不是数据行，不参与拖拽。
    const extra = renderRowExtra?.(row, { colSpan: colCount, rowIndex: index });
    return (
      <Fragment key={row.id}>
        {dragEnabled ? (
          <DraggableRow
            id={row.id}
            disabled={!canDragRow(row, index)}
            handleMode={dragHandle}
            render={(drag) => renderTr(row, index, drag)}
          />
        ) : (
          renderTr(row, index, null)
        )}
        {panel}
        {extra}
      </Fragment>
    );
  };

  // tbody 主体：虚拟模式只渲染视口窗口 + 上下撑高占位行
  let body: React.ReactNode;
  if (rows.length === 0) {
    body = (
      <tr>
        <td colSpan={colCount} className="py-4">
          {/* 空态贴**滚动视口**居中，不贴表宽居中（#191）：colSpan 的那格宽度就是表宽，
              宽表（20+ 列 / layout=fixed）下居中点会落到视口外，用户看到的是「表头在、
              中间一片空白」，第一反应是渲染挂了。sticky left-0 把它钉在视口左缘，
              宽度取滚动容器的 clientWidth（量出来的，因为它不等于 100% 也不等于 100vw）。 */}
          <div
            className="sticky left-0"
            style={emptyViewportWidth != null ? { width: emptyViewportWidth } : undefined}
          >
            {renderEmpty ? renderEmpty() : <Empty size="sm" title={emptyText ?? loc.empty} />}
          </div>
        </td>
      </tr>
    );
  } else if (virtualEnabled) {
    const items = virtualizer.getVirtualItems();
    const padTop = items.length ? items[0].start : 0;
    const padBottom = items.length ? virtualizer.getTotalSize() - items[items.length - 1].end : 0;
    body = (
      <>
        {padTop > 0 && (
          <tr aria-hidden>
            <td colSpan={colCount} style={{ height: padTop, padding: 0 }} />
          </tr>
        )}
        {items.map((vi) => renderRow(rows[vi.index], vi.index))}
        {padBottom > 0 && (
          <tr aria-hidden>
            <td colSpan={colCount} style={{ height: padBottom, padding: 0 }} />
          </tr>
        )}
      </>
    );
  } else {
    body = rows.map((row, index) => renderRow(row, index));
  }

  // stickyHeader 要有一个**真的会滚**的祖先才锚得住（#192）：外壳平时只有 overflow-x-auto、
  // 没有高度约束，于是永远不纵向滚，sticky top-0 纹丝不动 —— 消费方在业务侧套 [&_thead]:sticky
  // 也够不到（中间隔着这层 overflow 容器）。所以开了 stickyHeader 就必须给 maxHeight。
  if (stickyMode === "self" && !virtualEnabled && maxHeight == null) {
    warnOnce(
      "table-sticky-header-without-max-height",
      "[hulian] Table: stickyHeader 需要配合 maxHeight（或 virtual）才生效 —— " +
        "表头 sticky 要锚在一个会纵向滚动的祖先上，而外壳默认没有高度约束、永远不滚。" +
        "想吸在页面/内容区滚动容器上请用 stickyHeader=\"scrollParent\"。",
    );
  }
  // scrollParent 档（#238）：外壳不能成为 scrollport，否则表头就锚死在它自己身上。
  // `overflow-x: auto` 会把另一轴的 visible 一并算成 auto —— 实测（Chromium）页面下滚时
  // 表头直接划走，而同一张表在 overflow:visible 的外壳下稳稳停在 top:0。
  // 所以这一档下横向溢出交给外部滚动容器，代理横向滚动条也就无对象可镜像。
  if (stickyToScrollParent && (virtualEnabled || maxHeight != null)) {
    warnOnce(
      "table-sticky-header-scroll-parent-with-own-scroller",
      "[hulian] Table: stickyHeader=\"scrollParent\" 与 maxHeight / virtual 同开无意义 —— " +
        "表格自己就是滚动容器时，表头只会吸在它自己身上（那正是 stickyHeader 默认档的行为）。",
    );
  }
  if (stickyToScrollParent && stickyScrollbar) {
    warnOnce(
      "table-sticky-header-scroll-parent-with-sticky-scrollbar",
      "[hulian] Table: stickyHeader=\"scrollParent\" 下外壳不再横向滚动（overflow-x 会把表头锚死在外壳上），" +
        "stickyScrollbar 没有可镜像的滚动容器，本次忽略。",
    );
  }
  const shellScrolls = virtualEnabled || maxHeight != null;
  // 表头吸顶的公共皮肤：opaque 背景遮住滚到下方的行，z-[2] 压过冻结列的 z-1。
  const headerSticks = virtualEnabled || stickyMode != null;
  const headerStickyStyle =
    headerSticks && stickyHeaderOffset != null ? { top: stickyHeaderOffset } : undefined;

  // ── 列筛选（#290）──────────────────────────────────────────────────────────
  // 开筛选的两条路：meta.filterable 要内置文本框，meta.filterRender 自带控件（写了就等于开）。
  const canColumnFilter = (column: Column<TData, unknown>) => {
    const meta = column.columnDef.meta;
    return column.getCanFilter() && Boolean(meta?.filterable || meta?.filterRender);
  };
  // 控件本体。列自带 filterRender 就用它，否则给内置文本框。
  // filterRender 是**回调**不是组件（同 ColumnDef.cell 的口径）：状态请放进你自己的组件里，
  // 不要在回调体内直接调 hooks。
  const renderColumnFilter = (column: Column<TData, unknown>) => {
    const custom = column.columnDef.meta?.filterRender;
    if (custom) {
      return custom({
        value: column.getFilterValue(),
        setValue: (next) => column.setFilterValue(next),
        column,
      });
    }
    return (
      <input
        type="text"
        value={(column.getFilterValue() as string) ?? ""}
        onChange={(e) => column.setFilterValue(e.target.value)}
        placeholder={loc.filterPlaceholder ?? "筛选…"}
        aria-label={loc.filter?.(column.id) ?? `筛选 ${column.id}`}
        className="w-full rounded-[min(var(--radius),0.375rem)] border border-border bg-surface px-2 py-1 text-xs font-normal text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
      />
    );
  };
  // 独立筛选行：贴在最末级表头之下，与**叶子列**一一对齐（多级表头下也是）。
  // 用 `<td>` 而不是 `<th>`：这一行装的是控件不是列名，落成表头单元格会被读屏当作第二层列名念。
  // 一列都不可筛选时整行不渲染 —— 否则空着的一行只是把表头凭空加厚。
  const filterRow = (() => {
    if (filterPlacement !== "row") return null;
    const leaves = table.getVisibleLeafColumns();
    if (!leaves.some(canColumnFilter)) return null;
    return (
      <tr className="border-b border-border">
        {leaves.map((column) => (
          <td
            key={column.id}
            style={{
              ...colWidthStyle(column, fixedLayout, declaredWidths),
              ...stickyStyle(column),
            }}
            className={cn(
              cellPad,
              "font-normal",
              stickyClass(column),
              headerSticks && column.getIsPinned() && "bg-bg",
            )}
          >
            {canColumnFilter(column) ? renderColumnFilter(column) : null}
          </td>
        ))}
      </tr>
    );
  })();

  const shell = (
    <div
      ref={scrollRef}
      style={
        virtualEnabled
          ? { height: virtual?.height ?? 480, overflow: "auto" }
          : maxHeight != null
          ? { maxHeight, overflow: "auto" }
          : undefined
      }
      className={cn(
        // bordered=false：去掉自身描边框（如被 ProTable 卡片包裹时，由卡片提供外框，避免双框）。
        bordered && "rounded-[var(--radius)] border border-border",
        !shellScrolls && !stickyToScrollParent && "overflow-x-auto",
        className,
      )}
    >
      <MaybeTooltipProvider enabled={hasEllipsis}>
        <table
          // fixed 布局：表宽 = 各列 getSize() 之和；窄于容器时 min-w-full 兜底撑满
          // （撑满时列宽被浏览器按比例放大，但那种情况下没有横滚，固定列 offset 也就无从体现）
          // minWidth 落在 <table> 本体而不是外壳（#193）：写进 className 的 min-w-* 钉住的是
          // **滚动容器**，于是容器再也收不窄 → scrollWidth === clientWidth → 横滚条永不出现，
          // 超出视口的列被祖先直接裁掉且滚不出来（数据不可达，且宽窗口下自查不到）。
          style={{
            ...(fixedLayout ? { tableLayout: "fixed" as const, width: table.getTotalSize() } : null),
            ...(minWidth != null ? { minWidth } : null),
          }}
          className={cn("border-collapse text-sm", fixedLayout ? "min-w-full" : "w-full")}
        >
          <thead
            style={headerStickyStyle}
            className={cn(
              // 表头：foreground 黑/白 + semibold 加粗文字 + 行底分隔线（见下 tr），透明背景。
              // 不加填充色——表格已是 surface 卡片（ProTable）或带框原语，灰底带反而割裂、压观感。
              "text-foreground",
              // 表头吸顶：虚拟滚动恒开，其余表按 stickyHeader（#192 / #238）。两者都需要 opaque
              // 背景遮住滚到下方的行；用 bg-surface 匹配卡片表面。z-[2] 压过冻结列的 z-1。
              // top-0 是默认锚点；给了 stickyHeaderOffset 时由内联 style 覆盖（避开固定页头）。
              headerSticks && "sticky top-0 z-[2] bg-surface",
            )}
          >
            {planHeaderRows(table.getHeaderGroups()).map((row, rowIndex) => (
              <tr
                key={table.getHeaderGroups()[rowIndex]!.id}
                className="border-b border-border"
              >
                {row.map(({ header, colSpan, rowSpan }) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted(); // false | "asc" | "desc"
                  const meta = header.column.columnDef.meta;
                  const canFilter =
                    filterPlacement === "header" && canColumnFilter(header.column);
                  // headerAlign 缺省跟随 align，再缺省落表级（#292：表头 → 单元格两级兜底），
                  // 都不写才维持历史默认（左）。
                  // 例外是跨列的组名：贴在最左那列的左缘会读成「这是第一列的名字」，
                  // 居中才看得出它管着下面这一段（Element Plus / Ant Design 同样如此）。
                  // 显式写了表级对齐即让位于消费方——组名要不要居中由那张表自己说了算。
                  const headerAlign = (meta?.headerAlign ??
                    meta?.align ??
                    headerAlignProp ??
                    cellAlign ??
                    (colSpan > 1 ? "center" : "left")) as Align;
                  // 内建前插列（__select__ / __expander__ / __drag__）是固定几何的图标列，恒不可调宽
                  const canResize =
                    resizable &&
                    header.column.getCanResize() &&
                    !BUILT_IN_COL.test(header.column.id);
                  const label = flexRender(header.column.columnDef.header, header.getContext());
                  const labelNode = meta?.ellipsis ? (
                    <span className="block min-w-0 truncate">{label}</span>
                  ) : (
                    label
                  );
                  return (
                    <th
                      key={header.id}
                      // 多级表头的跨度（#261）。1 时不落属性，保持单级表头的 DOM 逐字不变。
                      colSpan={colSpan > 1 ? colSpan : undefined}
                      rowSpan={rowSpan > 1 ? rowSpan : undefined}
                      style={{
                        ...colWidthStyle(header.column, fixedLayout, declaredWidths),
                        ...stickyStyle(header.column),
                      }}
                      aria-sort={
                        !canSort
                          ? undefined
                          : sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                          ? "descending"
                          : "none"
                      }
                      className={cn(
                        cellPad,
                        ALIGN_TEXT[headerAlign],
                        "font-semibold",
                        // 表头恒不换行：auto 布局下列宽收缩到 min-content，中文表头会被挤成
                        // 「拆／出／条／目」每行一个字（英文则按空格断开），列宽反而更窄。
                        // 表头是短标签，nowrap 让它成为列的宽度下界，才是正确的度量基准。
                        // 需要截断的列走 meta.ellipsis + maxWidth，不靠折行省地方。
                        "whitespace-nowrap",
                        // 拖拽手柄绝对定位在 th 右缘（sticky 列的 position:sticky 同样是包含块）
                        canResize && "relative",
                        meta?.ellipsis && "overflow-hidden",
                        // 纵向跨行的格子（独立列与分组列混排时）在两行之间居中，
                        // 否则名字吊在第一行、下半格空着
                        rowSpan > 1 && "align-middle",
                        stickyClass(header.column),
                        headerSticks && header.column.getIsPinned() && "bg-bg",
                      )}
                    >
                      {/* 这里不再判 isPlaceholder：planHeaderRows 已把占位格换成真正跨行的
                          那一格，凡渲染出来的格子都有内容，空表头不会再出现。 */}
                      {
                        <div
                          className={cn(
                            "flex flex-col gap-1",
                            // 默认 stretch（历史行为）；显式对齐时才收成 items-*，让排序按钮真正居中/靠右
                            headerAlign !== "left" && ALIGN_ITEMS[headerAlign],
                          )}
                        >
                          {canSort ? (
                            <button
                              type="button"
                              onClick={header.column.getToggleSortingHandler()}
                              className="inline-flex min-w-0 max-w-full items-center gap-1 transition-colors hover:text-foreground"
                            >
                              {labelNode}
                              {sorted === "asc" ? (
                                <ChevronUp className="size-3.5 shrink-0" />
                              ) : sorted === "desc" ? (
                                <ChevronDown className="size-3.5 shrink-0" />
                              ) : (
                                <ChevronsUpDown className="size-3.5 shrink-0 opacity-50" />
                              )}
                            </button>
                          ) : (
                            labelNode
                          )}
                          {canFilter && renderColumnFilter(header.column)}
                        </div>
                      }
                      {canResize && (
                        // 拖拽手柄：TanStack 的 getResizeHandler 自己在 document 上挂 move/up，
                        // 这里只负责起手 + 视觉。双击复位该列到 columnDef.size。
                        <div
                          role="separator"
                          aria-orientation="vertical"
                          aria-label={loc.resizeColumn ?? "调整列宽"}
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          onDoubleClick={() => header.column.resetSize()}
                          data-resizing={header.column.getIsResizing() || undefined}
                          className={cn(
                            "absolute inset-y-0 right-0 w-1.5 cursor-col-resize touch-none select-none",
                            "after:absolute after:inset-y-1 after:right-0 after:w-px after:rounded-full after:bg-transparent after:transition-colors",
                            "hover:after:bg-primary data-[resizing]:after:bg-primary data-[resizing]:after:w-0.5",
                          )}
                        />
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
            {filterRow}
          </thead>
          <tbody>
            {dragEnabled ? (
              // SortableContext 只提供 context、不产出 DOM，可直接坐在 <tbody> 里包住行
              <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
                {body}
              </SortableContext>
            ) : (
              body
            )}
          </tbody>
          {/* 表尾（#237）：口径同 EditableTable.summary —— 消费方自备 <tr><td colSpan=…>。
              与它的区别是**空表也渲染**：「+ 手动添加一条」这类常驻表尾行恰恰在空表时最需要在。 */}
          {footer != null && (
            <tfoot className="border-t border-border bg-surface-hover/50 font-medium text-foreground">
              {typeof footer === "function"
                ? footer({ rows: rows.map((r) => r.original), colSpan: colCount })
                : footer}
            </tfoot>
          )}
        </table>
      </MaybeTooltipProvider>
    </div>
  );

  // 关掉时 DOM 与加这个 prop 之前逐字节一致：不多包外壳、不多出节点。
  // 开启时这层外壳成了 flex/grid 父容器眼里的那个 item（`className` 仍落在内层滚动容器上），
  // 所以补 min-w-0：flex item 默认 min-width:auto 不可压缩，宽表会把父容器撑破而不是内部横滚。
  const framed = !stickyBarEnabled ? (
    shell
  ) : (
    <div className="min-w-0">
      {shell}
      <div
        ref={barRef}
        aria-hidden
        // 代理条本身不可聚焦、也不该被读屏念到：它只是真容器滚动位置的一面镜子。
        onScroll={() => {
          const el = scrollRef.current;
          const barEl = barRef.current;
          if (el && barEl && el.scrollLeft !== barEl.scrollLeft) el.scrollLeft = barEl.scrollLeft;
        }}
        className={cn(
          "sticky bottom-0 z-[3] h-2.5 overflow-x-auto overflow-y-hidden",
          // 显式画滚动条而不是听凭系统：macOS 默认是 overlay 滚动条（平时完全不可见，
          // 且元素 offsetHeight-clientHeight 恒为 0），那样这条就成了一道空白，
          // 与 issue 要的「常驻一条」正好相反。给 ::-webkit-scrollbar 定了尺寸即可
          // 让 WebKit/Blink 退回经典常驻滚动条；Firefox 走 scrollbar-width/color。
          "[scrollbar-width:thin] [scrollbar-color:var(--color-border)_transparent]",
          "[&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border",
          "hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground",
          !bar.visible && "hidden",
        )}
      >
        <div style={{ width: bar.width, height: 1 }} />
      </div>
    </div>
  );

  // 未开拖拽就不挂 RowDndProvider：不执行 dnd-kit 的 hook、不注册 sensor、
  // 不挂 document 级监听、不产出 a11y live region
  if (!dragEnabled) return framed;
  return (
    <RowDndProvider
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDragState(null)}
    >
      {shell}
    </RowDndProvider>
  );
}
