"use client";
import { GripVertical } from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "../lib/cn";
import type { SortableProps } from "./sortable.types";

// 拖拽排序（"use client"·@dnd-kit headless + 瑚琏皮肤）：
//  · 指针拖拽(距离阈值 6px，避免误触吞掉点击) + 键盘拖拽(Space 抓起/方向键移动/Space 放下) 双通道——
//    全线键盘可达，不做"只能鼠标"的 a11y 破窗。
//  · 顺序状态由调用方掌控（受控 items + onChange(arrayMove 结果)），组件不偷存内部顺序。
//  · 不直接改 DOM（区别于 sortablejs），交还 React 对账。

function SortableRow<T>({
  id,
  item,
  renderItem,
  handle,
}: {
  id: UniqueIdentifier;
  item: T;
  renderItem: SortableProps<T>["renderItem"];
  handle: boolean;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = { transform: CSS.Translate.toString(transform), transition };

  return (
    <li
      ref={setNodeRef}
      style={style}
      // 整项可拖时，activator(attributes+listeners)落在 li 自身；触屏须 touch-none 防滚动劫持
      {...(handle ? {} : { ...attributes, ...listeners })}
      className={cn(
        "flex select-none items-center gap-3 rounded-[var(--radius)] border border-border bg-surface px-3 py-2.5 text-sm",
        !handle && "cursor-grab touch-none active:cursor-grabbing",
        isDragging && "relative z-10 shadow-lg ring-1 ring-border",
      )}
    >
      {handle && (
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label="拖拽排序"
          className="-ml-1 shrink-0 cursor-grab touch-none rounded text-muted outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
        >
          <GripVertical className="size-4" aria-hidden />
        </button>
      )}
      <div className="min-w-0 flex-1">{renderItem(item, { dragging: isDragging })}</div>
    </li>
  );
}

export function Sortable<T>({
  items,
  getId = (item) => (item as { id: UniqueIdentifier }).id,
  onChange,
  renderItem,
  orientation = "vertical",
  handle = false,
  className,
}: SortableProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ids = items.map(getId);

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(active.id);
    const to = ids.indexOf(over.id);
    if (from < 0 || to < 0) return;
    onChange(arrayMove(items, from, to));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={ids}
        strategy={orientation === "horizontal" ? horizontalListSortingStrategy : verticalListSortingStrategy}
      >
        <ul className={cn(orientation === "horizontal" ? "flex flex-wrap gap-2" : "space-y-2", className)}>
          {items.map((item) => (
            <SortableRow
              key={String(getId(item))}
              id={getId(item)}
              item={item}
              renderItem={renderItem}
              handle={handle}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
