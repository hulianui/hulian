"use client";
import type { PointerEvent as ReactPointerEvent } from "react";
import { GripVertical } from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type PointerSensorOptions,
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
import { useComponentLocale } from "../config/locale-context";
import { hasInteractiveAncestorWithin } from "../lib/drag-guard";
import type { SortableProps } from "./sortable.types";

// 拖拽排序（"use client"·@dnd-kit headless + 瑚琏皮肤）：
//  · 指针拖拽(距离阈值 6px，避免误触吞掉点击) + 键盘拖拽(Space 抓起/方向键移动/Space 放下) 双通道——
//    全线键盘可达，不做"只能鼠标"的 a11y 破窗。
//  · 顺序状态由调用方掌控（受控 items + onChange(arrayMove 结果)），组件不偷存内部顺序。
//  · 不直接改 DOM（区别于 sortablejs），交还 React 对账。
//  · 行内交互元素（输入框/按钮/下拉）不劫持拖拽：守卫内置在 sensor 层，默认就安全——
//    距离阈值只挡得住「原地点一下」，挡不住「输入框里按住拖选文字」这类超阈值按压。

// 行内的交互元素按下时不该发起拖拽——否则输入框拖选文字、拖滑块、按住按钮全会变成排序，
// 而消费者只能靠读源码/读文档才知道要设 handle 规避（文档提醒 ≠ 踩不到）。组件内部统一放行。
// 判定口径与 Kanban 共用同一份实现（lib/drag-guard.ts），两个可拖容器不该有两套说法。

/**
 * 判断某次 pointerdown 是否应发起拖拽（纯函数，jsdom 里 PointerSensor 不会真激活，靠它单测）。
 * @param target 事件的 target（真实按下的最内层元素）
 * @param container activator 所在元素（整项可拖时是 `<li>`；handle 模式下是手柄按钮本身）
 */
export function shouldStartDragFrom(
  target: EventTarget | null,
  container: Element | null,
): boolean {
  if (!(target instanceof Element)) return true;
  // 双保险：手柄自身带显式标记，即使 activator 未来挂到手柄的祖先上也不会被守卫误挡。
  if (target.closest("[data-sortable-handle]")) return true;
  return !hasInteractiveAncestorWithin(target, container);
}

// 继承 PointerSensor 只重写 activator：命中交互元素直接返回 false（不进拖拽状态机），
// 其余判定（isPrimary/左键）照抄上游，避免把 sensor 的既有语义改坏。
export class InteractiveAwarePointerSensor extends PointerSensor {
  // override 不能省：本包发的是源码，这行会进每个消费方的 tsc program，
  // 开了 noImplicitOverride 的工程会直接 TS4114 编译失败（hulianui/hulian#31）。
  static override activators = [
    {
      eventName: "onPointerDown" as const,
      // 这里刻意不解构 nativeEvent：需要 React 合成事件的 currentTarget 作为向上查找的边界，
      // React 是根节点委托，nativeEvent.currentTarget 拿不到挂 listener 的那个元素。
      handler: (event: ReactPointerEvent, { onActivation }: PointerSensorOptions) => {
        const native = event.nativeEvent;
        if (!native.isPrimary || native.button !== 0) return false;
        if (!shouldStartDragFrom(event.target, event.currentTarget)) return false;
        onActivation?.({ event: native });
        return true;
      },
    },
  ];
}

function SortableRow<T>({
  id,
  item,
  index,
  renderItem,
  handle,
  handleLabel,
}: {
  id: UniqueIdentifier;
  item: T;
  index: number;
  renderItem: SortableProps<T>["renderItem"];
  handle: boolean;
  handleLabel: (index: number) => string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = { transform: CSS.Translate.toString(transform), transition };

  // 整项可拖时把 li 同时登记为 activatorNode —— 这是键盘路径的守卫开关，不是可有可无的登记。
  // dnd-kit 的 KeyboardSensor 判的是 `if (activator && event.target !== activator) return false`：
  // activatorNode 为 null 时**整条守卫被跳过**，于是行内任意元素上的 Space/Enter 都会被
  // preventDefault 并进入键盘拖拽 —— 行内的删除按钮从此按不动（读屏/键盘用户直接失能）。
  // 指到 li 之后，只有焦点确实落在 li 自身时才起拖，落在行内按钮上时 target !== li 自然放行。
  // handle 模式不走这里：那时 activator 是手柄按钮，上游守卫本就成立。
  const setItemRef = (node: HTMLLIElement | null) => {
    setNodeRef(node);
    if (!handle) setActivatorNodeRef(node);
  };

  return (
    <li
      ref={setItemRef}
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
          // 手柄自身是 <button>，会被交互元素守卫误伤；打标记让守卫无条件放行
          data-sortable-handle=""
          aria-label={handleLabel(index + 1)}
          className="-ml-1 shrink-0 cursor-grab touch-none rounded text-muted outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
        >
          <GripVertical className="size-4" aria-hidden />
        </button>
      )}
      <div className="min-w-0 flex-1">{renderItem(item, { dragging: isDragging, index })}</div>
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
  const labels = useComponentLocale().sortable ?? {
    handle: (index: number) => `拖拽排序（第 ${index} 项）`,
  };
  const sensors = useSensors(
    useSensor(InteractiveAwarePointerSensor, { activationConstraint: { distance: 6 } }),
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
        strategy={
          orientation === "horizontal" ? horizontalListSortingStrategy : verticalListSortingStrategy
        }
      >
        <ul
          className={cn(
            orientation === "horizontal" ? "flex flex-wrap gap-2" : "space-y-2",
            className,
          )}
        >
          {items.map((item, index) => (
            <SortableRow
              key={String(getId(item))}
              id={getId(item)}
              item={item}
              index={index}
              renderItem={renderItem}
              handle={handle}
              handleLabel={labels.handle}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
