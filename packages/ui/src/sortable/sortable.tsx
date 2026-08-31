"use client";
import { useEffect, useState } from "react";
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
  sorting,
}: {
  id: UniqueIdentifier;
  item: T;
  index: number;
  renderItem: SortableProps<T>["renderItem"];
  handle: boolean;
  handleLabel: (index: number) => string;
  /** 列表里**任意一项**正在被拖（不只是本项）——光标不能靠 :active 表达，见下方注释。 */
  sorting: boolean;
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
        "flex select-none items-center gap-3 rounded-[var(--radius)] border px-3 py-2.5 text-sm",
        // 拖拽中的那一项吃语义主色（primary = "你正在动的就是它"），静止态回中性面：
        // 只靠 shadow + 中性 ring 在长列表里认不出被抓起的是哪一行。
        isDragging
          ? "relative z-10 border-primary bg-primary-subtle shadow-lg ring-1 ring-primary"
          : "border-border bg-surface",
        // 光标：拖拽期间**不能**用 `active:` 表达抓握态。指针底下的元素每帧都在变
        // （被拖项的 transform 落后一帧、行间空隙、让位中的其他行），`:active` 随之通断，
        // 浏览器每来一个输入事件就重算一次光标 → 抓手图标持续闪烁。
        // 拖拽期间改为「与位置无关」的常量：本行、ul 与 body 三层同时钉成 grabbing。
        !handle &&
          (sorting ? "touch-none cursor-grabbing" : "cursor-grab touch-none active:cursor-grabbing"),
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
          className={cn(
            "-ml-1 shrink-0 touch-none rounded outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isDragging ? "text-primary" : "text-muted-foreground hover:text-foreground",
            sorting ? "cursor-grabbing" : "cursor-grab active:cursor-grabbing",
          )}
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

  // 拖拽中标志：只服务于「光标不许闪」这一件事（见 SortableRow 里的长注释）。
  // 顺序状态仍然完全受控，这里不缓存任何顺序。
  // 只对**指针拖拽**置真：键盘拖拽（Space 抓起 + 方向键）根本没有按下的鼠标，
  // 那时把整页光标钉成 grabbing 是在说谎。
  const [sorting, setSorting] = useState(false);

  // 指针可以被拖到列表外（往上越过第一项、往下越过最后一项、甚至甩到页面别处）。
  // 列表内的三层 grabbing 管不到那些像素，那里会翻回默认箭头 —— 于是「列表边缘来回蹭」
  // 又是一轮闪烁。拖拽期间把 body 的光标也钉住，收口整页；结束/卸载还原原值。
  useEffect(() => {
    if (!sorting) return;
    const { body } = document;
    const previous = body.style.cursor;
    body.style.cursor = "grabbing";
    return () => {
      body.style.cursor = previous;
    };
  }, [sorting]);

  function handleDragEnd(e: DragEndEvent) {
    setSorting(false);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(active.id);
    const to = ids.indexOf(over.id);
    if (from < 0 || to < 0) return;
    onChange(arrayMove(items, from, to));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(e) => setSorting(e.activatorEvent instanceof MouseEvent)}
      onDragCancel={() => setSorting(false)}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={ids}
        strategy={
          orientation === "horizontal" ? horizontalListSortingStrategy : verticalListSortingStrategy
        }
      >
        <ul
          className={cn(
            orientation === "horizontal" ? "flex flex-wrap gap-2" : "space-y-2",
            // 行间空隙属于 ul；`[&_*]` 连消费方 renderItem 里的输入框（cursor:text）、
            // 按钮一起盖住 —— 让位动画会把它们送到指针底下，漏一个就闪一下。
            sorting && "cursor-grabbing [&_*]:cursor-grabbing",
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
              sorting={sorting}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
