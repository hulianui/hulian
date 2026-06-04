"use client";
import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "../lib/cn";
import type { KanbanColumn, KanbanMoveEvent, KanbanProps } from "./kanban.types";

// 看板（"use client"·@dnd-kit headless 多容器 + 瑚琏皮肤）：
//  · 列 = droppable 容器 + 列内 SortableContext；卡片 = sortable。跨列/列内拖拽统一回吐 onMove。
//  · 指针拖拽(距离阈值 6px) + 键盘拖拽双通道，全线键盘可达。
//  · 列布局状态由调用方掌控（受控 items + getColumnId 分桶），组件不偷改业务字段，只回 onMove 让消费者对账。

// 列 droppable id 加前缀，避免与卡片 id（无前缀）撞车 —— 拖到空列/列尾空白时 over.id 是列 id。
const COL_PREFIX = "kbcol:";

/** 解析拖拽落点为 KanbanMoveEvent（纯函数，便于单测）。over 可能是卡片 id 或带前缀的列 id。 */
export function resolveKanbanMove<T>(
  activeId: string,
  overId: string | null,
  columns: KanbanColumn[],
  items: T[],
  getId: (i: T) => string,
  getColumnId: (i: T) => string,
): KanbanMoveEvent | null {
  if (!overId || overId === activeId) return null;
  const active = items.find((i) => getId(i) === activeId);
  if (!active) return null;
  const fromColumn = getColumnId(active);

  let toColumn: string;
  if (overId.startsWith(COL_PREFIX)) {
    toColumn = overId.slice(COL_PREFIX.length);
  } else {
    const overItem = items.find((i) => getId(i) === overId);
    if (!overItem) return null;
    toColumn = getColumnId(overItem);
  }
  if (!columns.some((c) => c.id === toColumn)) return null;

  // 目标列卡片（剔除被拖卡片后，保持数组原序）
  const targetIds = items.filter((i) => getColumnId(i) === toColumn && getId(i) !== activeId).map(getId);
  let toIndex = targetIds.length; // 落到列空白/列尾 → 追加
  if (!overId.startsWith(COL_PREFIX)) {
    const idx = targetIds.indexOf(overId);
    if (idx >= 0) toIndex = idx; // 插入到悬停卡片之前
  }
  return { id: activeId, fromColumn, toColumn, toIndex };
}

function KanbanCard<T>({
  id,
  item,
  renderItem,
}: {
  id: string;
  item: T;
  renderItem: KanbanProps<T>["renderItem"];
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Translate.toString(transform), transition };
  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab touch-none select-none rounded-[var(--radius)] outline-none active:cursor-grabbing",
        "focus-visible:ring-2 focus-visible:ring-ring",
        isDragging && "opacity-40",
      )}
    >
      {renderItem(item, { dragging: isDragging })}
    </li>
  );
}

function KanbanColumnView<T>({
  column,
  items,
  getId,
  renderItem,
  renderColumnHeader,
  columnClassName,
}: {
  column: KanbanColumn;
  items: T[];
  getId: (i: T) => string;
  renderItem: KanbanProps<T>["renderItem"];
  renderColumnHeader?: KanbanProps<T>["renderColumnHeader"];
  columnClassName?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `${COL_PREFIX}${column.id}` });
  const ids = items.map(getId);
  return (
    <section
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-[calc(var(--radius)+0.25rem)] border border-border bg-muted/30",
        columnClassName,
      )}
    >
      <header className="px-3 pt-3">{renderColumnHeader ? renderColumnHeader(column, items) : (column.header ?? column.title)}</header>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul
          ref={setNodeRef}
          data-column={column.id}
          className={cn(
            "flex min-h-24 flex-1 flex-col gap-2.5 p-3 transition-colors",
            isOver && "bg-primary/5",
          )}
        >
          {items.length === 0 ? (
            <li className="grid flex-1 place-items-center rounded-[var(--radius)] border border-dashed border-border py-6 text-xs text-muted">
              拖拽卡片到此
            </li>
          ) : (
            items.map((item) => (
              <KanbanCard key={getId(item)} id={getId(item)} item={item} renderItem={renderItem} />
            ))
          )}
        </ul>
      </SortableContext>
      {column.footer != null && <footer className="px-3 pb-3">{column.footer}</footer>}
    </section>
  );
}

export function Kanban<T>({
  columns,
  items,
  getId,
  getColumnId,
  onMove,
  renderItem,
  renderColumnHeader,
  className,
  columnClassName,
}: KanbanProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // 按列分桶（保持 items 原序）
  const buckets = useMemo(() => {
    const map = new Map<string, T[]>();
    for (const c of columns) map.set(c.id, []);
    for (const it of items) {
      const col = getColumnId(it);
      if (map.has(col)) map.get(col)!.push(it);
    }
    return map;
  }, [columns, items, getColumnId]);

  const activeItem = activeId != null ? items.find((i) => getId(i) === activeId) ?? null : null;

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }
  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const move = resolveKanbanMove(String(e.active.id), e.over ? String(e.over.id) : null, columns, items, getId, getColumnId);
    if (move) onMove(move);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className={cn("flex gap-4 overflow-x-auto pb-2", className)}>
        {columns.map((column) => (
          <KanbanColumnView
            key={column.id}
            column={column}
            items={buckets.get(column.id) ?? []}
            getId={getId}
            renderItem={renderItem}
            renderColumnHeader={renderColumnHeader}
            columnClassName={columnClassName}
          />
        ))}
      </div>
      <DragOverlay>{activeItem ? <div className="cursor-grabbing">{renderItem(activeItem, { dragging: true })}</div> : null}</DragOverlay>
    </DndContext>
  );
}
