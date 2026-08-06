"use client";
import { memo, useCallback, useId, useMemo } from "react";
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

function FieldRow({
  field,
  labelId,
  children,
}: {
  field: InspectorField;
  labelId: string;
  children: ReactNode;
}) {
  // spacing 独占一行：四个数字框 + 链接钮塞不进右半列。
  const stacked = field.kind === "spacing" || field.kind === "color";
  return (
    <div
      data-inspector-field={field.key}
      className={cn("gap-2", stacked ? "flex flex-col" : "flex items-center")}
    >
      <div className={cn("min-w-0", stacked ? "" : "w-20 shrink-0")}>
        <span id={labelId} className="block truncate text-xs text-foreground">
          {field.label}
        </span>
        {field.hint && (
          <span className="block truncate text-[0.6875rem] text-muted">{field.hint}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function SectionBlock({
  section,
  read,
  context,
}: {
  section: InspectorSection;
  read: (path: string) => ReturnType<typeof readInspectorValue>;
  context: Omit<ControlContext, "labelId">;
}) {
  const idPrefix = useId();
  return (
    <Collapsible
      defaultOpen={section.defaultOpen ?? true}
      className="border-b border-border last:border-b-0"
    >
      <CollapsibleTrigger className="rounded-none">{section.label}</CollapsibleTrigger>
      <CollapsiblePanel>
        <div className="flex flex-col gap-3">
          {section.fields.map((field) => {
            const labelId = `${idPrefix}${field.key}`;
            return (
              <FieldRow key={field.key} field={field} labelId={labelId}>
                <InspectorControl
                  field={field}
                  value={read(field.key)}
                  read={read}
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

  const context = useMemo<Omit<ControlContext, "labelId">>(
    () => ({ commitMode, labels: text, tokens: tokenSource ?? [], emit }),
    [commitMode, text, tokenSource, emit],
  );

  const heading = title === undefined ? text.title : title;
  const empty = selectedElement === null;

  return (
    <section
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
            <span className="truncate rounded-[min(var(--radius),0.375rem)] bg-surface-hover px-1.5 py-0.5 font-mono text-xs text-muted">
              {selectedElement}
            </span>
          )}
        </header>
      )}
      {empty ? (
        <p className="px-3 py-8 text-center text-sm text-muted">{emptyText ?? text.empty}</p>
      ) : (
        resolved.map((section) => (
          <SectionBlock key={section.id} section={section} read={read} context={context} />
        ))
      )}
    </section>
  );
}

InspectorPanelImpl.displayName = "InspectorPanel";

// #89：父级稳定更新时 React 无法自己 bailout，只能靠 memo —— 与 Button/Checkbox/Chip 同一处方。
export const InspectorPanel = memo(InspectorPanelImpl);
InspectorPanel.displayName = "InspectorPanel";
