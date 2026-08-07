"use client";
import { useState, type PointerEvent as ReactPointerEvent } from "react";
import { cn } from "../lib/cn";
import { Input } from "../input";
import { Segmented } from "../segmented";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../select";
import { Slider } from "../slider";
import { Switch } from "../switch";
import { ColorPicker } from "../colorpicker";
import { ColorSwatchPicker } from "../color-swatch-picker";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { Link } from "../_icons";
import {
  fieldTokens,
  formatLength,
  isLiteralColor,
  isMixed,
  matchToken,
  parseLength,
  spacingSides,
  tokenColor,
} from "./inspector-schema";
import type {
  InspectorChange,
  InspectorColorField,
  InspectorCommitMode,
  InspectorEnumField,
  InspectorField,
  InspectorLengthField,
  InspectorNumberField,
  InspectorPanelLabels,
  InspectorSpacingField,
  InspectorTextField,
  InspectorToken,
  InspectorValue,
} from "./inspector-panel.types";

// 控件层：每个 kind 一个受控小部件，全部从既有表单件换皮而来（不自造 input/滑杆/开关）。
// 共同约定：
//   · 值只从 props 流入，改动只经 emit 流出，组件自身不持久化业务值
//   · commitMode==="commit" 时才有内部草稿态（拖动/输入中的中间值），松手/失焦即清空
//   · 混合值（MIXED）一律渲染成占位而不是「第一个元素的值」

export interface ControlContext {
  commitMode: InspectorCommitMode;
  labels: InspectorPanelLabels;
  tokens: readonly InspectorToken[];
  /** 可见标签的 DOM id，供 Slider 这类把名字下发给内部 input 的控件用。 */
  labelId: string;
  /** 面板自身宽度低于阈值。窄栏下枚举字段自动从分段控件降级为下拉（#114）。 */
  narrow: boolean;
  emit: (changes: InspectorChange[]) => void;
}

const iconButtonClass = cn(
  "grid size-8 shrink-0 place-items-center rounded-[var(--radius)] border border-border text-muted outline-none transition-colors",
  "hover:bg-surface-hover",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
  "aria-pressed:border-primary aria-pressed:text-primary",
  "disabled:opacity-50 disabled:pointer-events-none",
);

// ===== 数字输入（number / length / spacing 共用）=====

interface NumericInputProps {
  ariaLabel: string;
  value: InspectorValue;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  mixedText: string;
  commitMode: InspectorCommitMode;
  /** 拖动滑杆时的外部覆盖值（有值就优先显示，让数字框跟着滑块走）。 */
  override?: number | null;
  className?: string;
  prefix?: string;
  /**
   * 前缀标签变成「拖拽调值」的抓手（Sketch / Figma 的 scrubbing）。
   * 只在有 prefix 时可用——没有可见抓手的拖拽是不可发现的，也没法给它无障碍语义。
   */
  scrub?: boolean;
  onCommit: (value: InspectorValue) => void;
}

function NumericInput({
  ariaLabel,
  value,
  unit,
  min,
  max,
  step,
  disabled,
  mixedText,
  commitMode,
  override,
  className,
  prefix,
  scrub,
  onCommit,
}: NumericInputProps) {
  const mixed = isMixed(value);
  const [draft, setDraft] = useState<string | null>(null);
  const parsed = override ?? parseLength(value);
  const shown = draft ?? (mixed || parsed === null ? "" : String(parsed));

  // 清空 = 删除该属性（回吐 null），而不是回吐 0——设计工具里「没设置」和「设成 0」不是一回事。
  const commit = (raw: string) => {
    if (raw.trim() === "") {
      onCommit(null);
      return;
    }
    const next = parseLength(raw);
    if (next === null) return;
    onCommit(formatLength(next, unit));
  };

  const clamp = (n: number) => {
    let next = n;
    if (min != null) next = Math.max(min, next);
    if (max != null) next = Math.min(max, next);
    return next;
  };

  // 拖拽调值：横向每 1px 走一个 step（按住 Shift 走 10 倍，与设计工具惯例一致）。
  // 用 setPointerCapture 而不是挂 window 监听：指针移出抓手后事件仍回到这里，
  // 松手时浏览器自动释放，不必自己清理（拖到一半切标签页也不会漏解绑）。
  const onScrubStart = (event: ReactPointerEvent<HTMLSpanElement>) => {
    if (!scrub || disabled || mixed) return;
    const unitStep = step ?? 1;
    const startX = event.clientX;
    const startValue = parsed ?? 0;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
    const onMove = (move: PointerEvent) => {
      const delta = (move.clientX - startX) * unitStep * (move.shiftKey ? 10 : 1);
      onCommit(formatLength(clamp(startValue + Math.round(delta / unitStep) * unitStep), unit));
    };
    const target = event.currentTarget;
    const onUp = () => {
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerup", onUp);
      target.removeEventListener("pointercancel", onUp);
    };
    target.addEventListener("pointermove", onMove);
    // pointercancel 必须一起解绑：系统手势 / 触控笔离开会只发 cancel 不发 up，漏掉就永久跟手。
    target.addEventListener("pointerup", onUp);
    target.addEventListener("pointercancel", onUp);
  };

  const prefixNode =
    prefix == null ? undefined : scrub ? (
      <span
        // 抓手本身不进无障碍树也不进 tab 顺序：调值的可达通路是输入框自己（方向键 / 直接输入），
        // 拖拽只是给鼠标用户的加速方式，不该多出一个屏幕阅读器要念的控件。
        aria-hidden
        onPointerDown={onScrubStart}
        className="-mx-1 cursor-ew-resize select-none px-1 touch-none"
      >
        {prefix}
      </span>
    ) : (
      prefix
    );

  return (
    <Input
      size="sm"
      type="number"
      inputMode="decimal"
      aria-label={ariaLabel}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      prefix={prefixNode}
      placeholder={mixed ? mixedText : undefined}
      className={className}
      value={shown}
      onChange={(event) => {
        const next = event.target.value;
        if (commitMode === "commit") setDraft(next);
        else commit(next);
      }}
      onBlur={() => {
        if (draft === null) return;
        commit(draft);
        setDraft(null);
      }}
      onKeyDown={(event) => {
        if (event.key !== "Enter" || draft === null) return;
        commit(draft);
        setDraft(null);
      }}
    />
  );
}

// ===== spacing：四联 + 链接锁定 =====

function SpacingControl({
  field,
  read,
  context,
}: {
  field: InspectorSpacingField;
  read: (path: string) => InspectorValue;
  context: ControlContext;
}) {
  const { labels, commitMode, emit } = context;
  // 链接态是「面板的编辑偏好」而不是元素属性，所以留在组件内部，不进受控值。
  const [linked, setLinked] = useState(false);
  const sides = spacingSides(field.key, field.sides);
  const order: Array<[keyof typeof sides, string]> = [
    ["top", labels.sideTop],
    ["right", labels.sideRight],
    ["bottom", labels.sideBottom],
    ["left", labels.sideLeft],
  ];

  return (
    <div className="flex items-center gap-1.5">
      <div className="grid min-w-0 flex-1 grid-cols-4 gap-1.5">
        {order.map(([side, sideLabel]) => (
          <NumericInput
            key={side}
            ariaLabel={`${field.label} ${sideLabel}`}
            prefix={sideLabel}
            value={read(sides[side])}
            unit={field.unit}
            min={field.min}
            max={field.max}
            step={field.step}
            disabled={field.disabled}
            mixedText={labels.mixed}
            commitMode={commitMode}
            scrub
            className="px-1.5"
            onCommit={(next) => {
              if (!linked) {
                emit([{ path: sides[side], value: next }]);
                return;
              }
              emit(order.map(([target]) => ({ path: sides[target], value: next })));
            }}
          />
        ))}
      </div>
      <button
        type="button"
        aria-label={labels.linkSides}
        aria-pressed={linked}
        disabled={field.disabled}
        onClick={() => setLinked((previous) => !previous)}
        className={iconButtonClass}
      >
        <Link className="size-4" />
      </button>
    </div>
  );
}

// ===== length：滑杆 + 数字框 =====

function LengthControl({
  field,
  value,
  context,
}: {
  field: InspectorLengthField;
  value: InspectorValue;
  context: ControlContext;
}) {
  const { labels, commitMode, emit, labelId } = context;
  const mixed = isMixed(value);
  // 拖动中的中间值：change 模式下也留着，这样非受控（父级不回写）的消费方滑块照样跟手。
  const [dragging, setDragging] = useState<number | null>(null);
  const min = field.min ?? 0;
  const max = field.max ?? 100;
  const parsed = parseLength(value);
  const current = dragging ?? parsed ?? min;
  const commit = (next: InspectorValue) => emit([{ path: field.key, value: next }]);
  const pick = (raw: number | readonly number[]) => (Array.isArray(raw) ? raw[0] : (raw as number));

  return (
    <div className="flex min-w-0 items-center gap-2">
      {/* 混合值下不画滑杆：滑块必须停在某个具体位置，那等于替用户挑了一个值。 */}
      {mixed ? (
        <span className="min-w-0 flex-1 truncate text-xs text-muted">{labels.mixed}</span>
      ) : (
        <Slider
          aria-labelledby={labelId}
          className="min-w-0 flex-1"
          disabled={field.disabled}
          min={min}
          max={max}
          step={field.step ?? 1}
          value={current}
          onValueChange={(raw) => {
            const next = pick(raw);
            setDragging(next);
            if (commitMode === "change") commit(formatLength(next, field.unit));
          }}
          onValueCommitted={(raw) => {
            const next = pick(raw);
            setDragging(null);
            if (commitMode === "commit") commit(formatLength(next, field.unit));
          }}
        />
      )}
      <NumericInput
        ariaLabel={field.label}
        value={value}
        override={dragging}
        unit={field.unit}
        min={field.min}
        max={field.max}
        step={field.step}
        disabled={field.disabled}
        mixedText={labels.mixed}
        commitMode={commitMode}
        className="w-16 shrink-0"
        onCommit={commit}
      />
    </div>
  );
}

// ===== enum：Segmented（少选项）/ Select（多选项）=====

function EnumControl({
  field,
  value,
  context,
}: {
  field: InspectorEnumField;
  value: InspectorValue;
  context: ControlContext;
}) {
  const { labels, emit } = context;
  const mixed = isMixed(value);
  const current = mixed || value == null ? "" : String(value);
  const commit = (next: string) => emit([{ path: field.key, value: next }]);
  // 显式传了 display 就尊重消费方；只有「未指定」时才由组件自适应。
  // 窄栏下四段中文一定超宽，分段控件末段会被裁掉且不可点 —— 那是「存在但不可达的选项」，
  // 比换个形态严重得多，所以自动降级为下拉（#114）。
  const display =
    field.display ??
    (context.narrow ? "select" : field.options.length <= 4 ? "segmented" : "select");

  if (display === "segmented") {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <Segmented
          size="sm"
          aria-label={field.label}
          disabled={field.disabled}
          className="min-w-0 flex-1"
          items={field.options.map((option) => ({
            value: option.value,
            label: option.label ?? option.value,
          }))}
          // 空串不命中任何段 → 全部未选中，这正是「混合值/未设置」该有的视觉。
          value={current}
          onValueChange={commit}
        />
        {mixed && <span className="shrink-0 text-xs text-muted">{labels.mixed}</span>}
      </div>
    );
  }

  return (
    <Select
      items={field.options.map((option) => ({
        value: option.value,
        label: option.label ?? option.value,
      }))}
      placeholder={mixed ? labels.mixed : undefined}
      value={current === "" ? null : current}
      onValueChange={(next: unknown) => commit(next == null ? "" : String(next))}
      disabled={field.disabled}
    >
      <SelectTrigger size="sm" aria-label={field.label} />
      <SelectContent>
        {field.options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label ?? option.value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ===== toggle =====

function ToggleControl({
  field,
  value,
  context,
}: {
  field: InspectorField;
  value: InspectorValue;
  context: ControlContext;
}) {
  const { labels, emit } = context;
  const mixed = isMixed(value);
  return (
    <div className="flex items-center gap-2">
      <Switch
        size="sm"
        aria-label={field.label}
        disabled={field.disabled}
        checked={mixed ? false : value === true}
        onCheckedChange={(next) => emit([{ path: field.key, value: next }])}
      />
      {/* Switch 没有第三态，混合值只能在旁边说明白，不能假装它是「关」。 */}
      {mixed && <span className="text-xs text-muted">{labels.mixed}</span>}
    </div>
  );
}

// ===== text =====

function TextControl({
  field,
  value,
  context,
}: {
  field: InspectorTextField;
  value: InspectorValue;
  context: ControlContext;
}) {
  const { labels, commitMode, emit } = context;
  const mixed = isMixed(value);
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? (mixed || value == null ? "" : String(value));
  const commit = (next: string) => emit([{ path: field.key, value: next }]);

  return (
    <Input
      size="sm"
      aria-label={field.label}
      disabled={field.disabled}
      placeholder={mixed ? labels.mixed : field.placeholder}
      value={shown}
      onChange={(event) => {
        const next = event.target.value;
        if (commitMode === "commit") setDraft(next);
        else commit(next);
      }}
      onBlur={() => {
        if (draft === null) return;
        commit(draft);
        setDraft(null);
      }}
      onKeyDown={(event) => {
        if (event.key !== "Enter" || draft === null) return;
        commit(draft);
        setDraft(null);
      }}
    />
  );
}

// ===== color：token 色板 + 自由文本 + 取色器浮层 =====

function ColorControl({
  field,
  value,
  context,
}: {
  field: InspectorColorField;
  value: InspectorValue;
  context: ControlContext;
}) {
  const { labels, commitMode, emit, tokens } = context;
  const mixed = isMixed(value);
  const available = fieldTokens(tokens, field.tokenGroup);
  const matched = matchToken(value, available);
  const literal = typeof value === "string" && !mixed ? value : "";
  const commit = (next: string) => emit([{ path: field.key, value: next }]);
  // ColorPicker 只认 hex/rgb/hsl；值是 var(--x) 时不给它，避免它把 token 解析成黑色。
  const pickerValue = isLiteralColor(value) ? value : undefined;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex min-w-0 items-center gap-1.5">
        <Popover>
          <PopoverTrigger
            aria-label={`${field.label} ${labels.pickColor}`}
            disabled={field.disabled}
            className={cn(iconButtonClass, "overflow-hidden p-0.5", mixed && "border-dashed")}
          >
            <span
              aria-hidden
              // 任意用户色值只能走内联 backgroundColor（token 名不可枚举成工具类）；
              // 颜色本身来自 tokenSource / 用户输入，不是组件写死的皮肤。
              style={{ backgroundColor: mixed ? "transparent" : literal }}
              className="block size-full rounded-[min(var(--radius),0.25rem)]"
            />
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[min(88vw,15rem)]">
            <ColorPicker
              // commit 模式下拖动中父级收不到值也就不会回写，此时若还受控就把色板钉死在原处，
              // 所以换成非受控 + key：只有外部值真的变了（换选中元素 / 点了 token）才重挂同步。
              key={commitMode === "commit" ? pickerValue : undefined}
              {...(pickerValue === undefined
                ? {}
                : commitMode === "commit"
                ? { defaultValue: pickerValue }
                : { value: pickerValue })}
              onValueChange={commitMode === "change" ? commit : undefined}
              onValueCommitted={commitMode === "commit" ? commit : undefined}
            />
          </PopoverContent>
        </Popover>
        <Input
          size="sm"
          aria-label={field.label}
          disabled={field.disabled}
          placeholder={mixed ? labels.mixed : undefined}
          value={literal}
          onChange={(event) => commit(event.target.value)}
        />
      </div>
      {available.length > 0 && (
        <ColorSwatchPicker
          size="sm"
          aria-label={`${field.label} ${labels.colorTokens}`}
          disabled={field.disabled}
          // 色块的无障碍名走 label，否则读屏念的是 "var(--color-primary)" 这串变量名。
          colors={available.map((token) => ({
            color: tokenColor(token),
            label: token.label ?? token.token,
          }))}
          value={matched ? tokenColor(matched) : ""}
          onValueChange={commit}
        />
      )}
      {/* 视觉用户的「当前是哪个 token」读数：色块只有一圈 ring，相近色分不出选中的是哪个。
          不是无障碍兜底——那条已由色块自己的 label 承担。 */}
      {matched && (
        <span className="truncate text-xs text-muted">{matched.label ?? matched.token}</span>
      )}
    </div>
  );
}

// ===== 派发 =====

export function InspectorControl({
  field,
  value,
  read,
  columns = 1,
  context,
}: {
  field: InspectorField;
  value: InspectorValue;
  read: (path: string) => InspectorValue;
  /** 所在分组的列数。多列网格里数值字段的标签自动内联（#115）。 */
  columns?: number;
  context: ControlContext;
}) {
  switch (field.kind) {
    case "spacing":
      return <SpacingControl field={field} read={read} context={context} />;
    case "color":
      return <ColorControl field={field} value={value} context={context} />;
    case "length":
      return <LengthControl field={field} value={value} context={context} />;
    case "number":
      return <NumberControl field={field} value={value} columns={columns} context={context} />;
    case "enum":
      return <EnumControl field={field} value={value} context={context} />;
    case "toggle":
      return <ToggleControl field={field} value={value} context={context} />;
    default:
      return <TextControl field={field} value={value} context={context} />;
  }
}

function NumberControl({
  field,
  value,
  columns,
  context,
}: {
  field: InspectorNumberField;
  value: InspectorValue;
  columns?: number;
  context: ControlContext;
}) {
  const { labels, commitMode, emit } = context;
  // 多列网格里标签一律内联（那正是「一行三格」排布的意义）；单列时由字段自己声明。
  const inline = field.inlineLabel ?? (columns ?? 1) > 1;
  return (
    <NumericInput
      ariaLabel={field.label}
      value={value}
      prefix={inline ? field.label : undefined}
      scrub={inline}
      unit={field.unit}
      min={field.min}
      max={field.max}
      step={field.step}
      disabled={field.disabled}
      mixedText={labels.mixed}
      commitMode={commitMode}
      className={inline ? "px-1.5" : undefined}
      onCommit={(next) => emit([{ path: field.key, value: next }])}
    />
  );
}
