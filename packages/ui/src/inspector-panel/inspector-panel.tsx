"use client";
import { memo, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "../collapsible";
import { zhCN } from "../config/locale";
import { useComponentLocale } from "../config/locale-context";
import { InspectorControl } from "./inspector-control";
import type { ControlContext } from "./inspector-control";
import { inspectorSections, readInspectorValue } from "./inspector-schema";
import type {
  InspectorChange,
  InspectorField,
  InspectorPanelLabels,
  InspectorPanelProps,
  InspectorSection,
} from "./inspector-panel.types";

const NARROW_PANEL_PX = 260;

// 设计工具属性检查器。核心不是「五个写死的分类」，而是**字段 schema 驱动**：
// 消费方给一份 `{ key, label, kind }` 描述，面板按 kind 派生控件、按 path 读值、按 path 回吐。
// issue 里那 5 类只是内置预设（inspectorSections()），换一套业务属性不用回库改组件。
//
// 三条边界：
//   1. 面板不持有业务值——值只从 `props` 流入，改动只经 `onChange` 流出（唯一例外是 commit 模式的输入草稿）
//   2. 控件全部换皮自既有表单件（Input / Slider / Segmented / Select / Switch / ColorPicker / ColorSwatchPicker）
//   3. 分类折叠态由 Collapsible 自持，不进受控值——它是查看偏好，不是元素属性

// 内置兜底：没包 ConfigProvider 时 useComponentLocale() 取不到字典，仍要有可用的中文文案。
const FALLBACK_LABELS: InspectorPanelLabels = {
  presets: zhCN.components!.inspectorPanel!.presets,
  title: "属性",
  empty: "未选中元素",
  mixed: "多个值",
  linkSides: "链接四边",
  sideTop: "上",
  sideRight: "右",
  sideBottom: "下",
  sideLeft: "左",
  pickColor: "取色器",
  colorTokens: "主题色",
};

/** 标签内联进控件里的字段：外层不再画标签列，整格让给控件（Sketch 的 X/Y/W/H 排布）。 */
function isInlineLabelled(field: InspectorField, columns: number): boolean {
  return field.kind === "number" && (field.inlineLabel ?? columns > 1);
}

/** 多列网格里仍然独占整行的字段（放不进一格）。 */
function spansFullRow(field: InspectorField): boolean {
  return field.kind === "spacing" || field.kind === "color";
}

function FieldRow({
  field,
  labelId,
  columns,
  compact,
  children,
}: {
  field: InspectorField;
  labelId: string;
  columns: number;
  compact: boolean;
  children: ReactNode;
}) {
  // 标签已经内联进输入框里，外层就不该再画一遍——否则同一个名字出现两次。
  if (isInlineLabelled(field, columns)) {
    return (
      <div data-inspector-field={field.key} className={cn("min-w-0", spansFullRow(field) && "col-span-full")}>
        {children}
      </div>
    );
  }
  // spacing 独占一行：四个数字框 + 链接钮塞不进右半列。
  const stacked = field.kind === "spacing" || field.kind === "color";
  return (
    <div
      data-inspector-field={field.key}
      className={cn(
        compact ? "gap-1.5" : "gap-2",
        stacked ? "flex flex-col" : "flex items-center",
        columns > 1 && "col-span-full",
      )}
    >
      <div className={cn("min-w-0", stacked ? "" : compact ? "w-16 shrink-0" : "w-20 shrink-0")}>
        <span id={labelId} className="block truncate text-xs text-foreground">
          {field.label}
        </span>
        {field.hint && (
          <span className="block truncate text-[0.6875rem] text-muted-foreground">{field.hint}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

const GRID_COLS = { 1: "", 2: "grid grid-cols-2", 3: "grid grid-cols-3" } as const;

function SectionBlock({
  section,
  read,
  context,
  compact,
}: {
  section: InspectorSection;
  read: (path: string) => ReturnType<typeof readInspectorValue>;
  context: Omit<ControlContext, "labelId">;
  compact: boolean;
}) {
  const idPrefix = useId();
  // 窄栏下网格再分列就没有可用宽度了（每格不足 70px），统一退回单列。
  const columns = context.narrow ? 1 : (section.columns ?? 1);
  return (
    <Collapsible
      defaultOpen={section.defaultOpen ?? true}
      className="border-b border-border last:border-b-0"
    >
      <CollapsibleTrigger className="rounded-none">{section.label}</CollapsibleTrigger>
      <CollapsiblePanel>
        <div
          className={cn(
            columns > 1 ? GRID_COLS[columns] : "flex flex-col",
            compact ? "gap-1.5" : "gap-3",
          )}
        >
          {section.fields.map((field) => {
            const labelId = `${idPrefix}${field.key}`;
            return (
              <FieldRow
                key={field.key}
                field={field}
                labelId={labelId}
                columns={columns}
                compact={compact}
              >
                <InspectorControl
                  field={field}
                  value={read(field.key)}
                  read={read}
                  columns={columns}
                  context={{ ...context, labelId }}
                />
              </FieldRow>
            );
          })}
        </div>
      </CollapsiblePanel>
    </Collapsible>
  );
}

function InspectorPanelImpl({
  selectedElement,
  props: values,
  onChange,
  onBatchChange,
  sections,
  categories,
  tokenSource,
  commitMode = "change",
  density = "comfortable",
  title,
  emptyText,
  labels,
  className,
}: InspectorPanelProps) {
  // 优先级：labels prop > ConfigProvider 的 locale > 内置中文兜底。
  // title / emptyText 两个独立 prop 同理，见下方 heading / empty 分支。
  const localeLabels = useComponentLocale().inspectorPanel ?? FALLBACK_LABELS;
  const text = useMemo<InspectorPanelLabels>(
    () => ({ ...localeLabels, ...labels }),
    [localeLabels, labels],
  );
  const resolved = useMemo(
    () =>
      sections ?? inspectorSections(categories, localeLabels.presets ?? FALLBACK_LABELS.presets),
    [sections, categories, localeLabels],
  );
  const read = useCallback((path: string) => readInspectorValue(values, path), [values]);

  // 单 path 走 onChange；一次交互改多个 path（链接锁定的 spacing）优先走 onBatchChange，
  // 不传 onBatchChange 才退化成同 tick 连续 onChange——那时消费方必须用函数式 setState。
  const emit = useCallback(
    (changes: InspectorChange[]) => {
      if (changes.length > 1 && onBatchChange) {
        onBatchChange(changes);
        return;
      }
      for (const change of changes) onChange(change.path, change.value);
    },
    [onChange, onBatchChange],
  );

  // 窄栏判定：面板经常被塞进 240px 上下的侧栏，而中文的四段分段控件在那个宽度下必然超宽。
  // 观察面板自身的宽度而不是视口宽度 —— 决定控件形态的是「它有多宽」，不是「屏幕有多宽」。
  const rootRef = useRef<HTMLElement | null>(null);
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      // 阈值取 260px：label 列 w-20(80px) + 两侧内距后，控件可用宽约 150px，
      // 再窄就装不下四段中文（每段最少约 44px）。
      setNarrow(entry.contentRect.width < NARROW_PANEL_PX);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const context = useMemo<Omit<ControlContext, "labelId">>(
    () => ({ commitMode, labels: text, tokens: tokenSource ?? [], emit, narrow }),
    [commitMode, text, tokenSource, emit, narrow],
  );

  const heading = title === undefined ? text.title : title;
  const empty = selectedElement === null;

  return (
    <section
      ref={rootRef}
      aria-label={typeof heading === "string" ? heading : text.title}
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-surface text-foreground",
        className,
      )}
    >
      {heading !== null && (
        <header className="flex min-w-0 items-center justify-between gap-2 border-b border-border px-3 py-2.5">
          <span className="truncate text-sm font-medium">{heading}</span>
          {selectedElement && (
            <span className="truncate rounded-[min(var(--radius),0.375rem)] bg-surface-hover px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
              {selectedElement}
            </span>
          )}
        </header>
      )}
      {empty ? (
        <p className="px-3 py-8 text-center text-sm text-muted-foreground">{emptyText ?? text.empty}</p>
      ) : (
        resolved.map((section) => (
          <SectionBlock
            key={section.id}
            section={section}
            read={read}
            context={context}
            compact={density === "compact"}
          />
        ))
      )}
    </section>
  );
}

InspectorPanelImpl.displayName = "InspectorPanel";

// #89：父级稳定更新时 React 无法自己 bailout，只能靠 memo —— 与 Button/Checkbox/Chip 同一处方。
export const InspectorPanel = memo(InspectorPanelImpl);
InspectorPanel.displayName = "InspectorPanel";
