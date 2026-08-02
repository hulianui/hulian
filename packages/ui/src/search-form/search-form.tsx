"use client";
import { useState, type FormEvent, type ReactNode } from "react";
import { cn } from "../lib/cn";
import { Button } from "../button";
import { Field } from "../field";
import { Input } from "../input";
import { RemoteSelect } from "../remote-select";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../select";
import { canCollapse, planLayout } from "./search-form.layout";
import type { SearchField, SearchFormProps } from "./search-form.types";
import { useComponentLocale } from "../config/locale-context";

const ChevronDown = ({ className }: { className?: string }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <path
      d="M4 6l4 4 4-4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** 区间类字段：值恒为二元组 [start, end]。 */
const RANGE_TYPES = new Set(["date-range", "datetime-range", "number-range"]);
/** 多值字段：值恒为数组。 */
const MULTI_TYPES = new Set(["multi-select"]);

/** 空值形状：区间 → ["",""]，多值 → []，其余 → ""（字段自带 defaultValue 时以它为准）。 */
function emptyValue(f: SearchField): unknown {
  if (f.type && RANGE_TYPES.has(f.type)) return ["", ""];
  if (f.type && MULTI_TYPES.has(f.type)) return [];
  if (f.type === "remote-select" && f.multiple) return [];
  return "";
}

function seedDefaults(fields: SearchField[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) out[f.name] = f.defaultValue ?? emptyValue(f);
  return out;
}

/** 读区间值的两端（脏数据兜底成 ["",""]）。 */
function rangePair(value: unknown): [string, string] {
  const arr = Array.isArray(value) ? value : ["", ""];
  return [String(arr[0] ?? ""), String(arr[1] ?? "")];
}

/** 区间输入的两个格子 + 中间的 ~ 分隔。三种区间类型共用这一套骨架。 */
function RangeInputs({
  type,
  value,
  onChange,
  numberProps,
}: {
  type: string;
  value: unknown;
  onChange: (v: unknown) => void;
  numberProps?: { min?: number; max?: number; step?: number };
}) {
  const [start, end] = rangePair(value);
  return (
    <div className="flex items-center gap-2">
      <Input
        type={type}
        {...numberProps}
        value={start}
        onChange={(e) => onChange([e.target.value, end])}
        className="flex-1"
      />
      <span className="shrink-0 text-muted">~</span>
      <Input
        type={type}
        {...numberProps}
        value={end}
        onChange={(e) => onChange([start, e.target.value])}
        className="flex-1"
      />
    </div>
  );
}

function renderControl(
  field: SearchField,
  value: unknown,
  setValue: (name: string, v: unknown) => void,
  selectPlaceholder: string,
): ReactNode {
  const onChange = (v: unknown) => setValue(field.name, v);

  if (field.render) return field.render({ name: field.name, value, onChange });

  if (field.type === "select") {
    const v = (value as string) ?? "";
    return (
      <Select
        items={field.options}
        placeholder={field.placeholder ?? selectPlaceholder}
        value={v === "" ? null : v}
        onValueChange={(val: unknown) => onChange(val == null ? "" : String(val))}
      >
        <SelectTrigger />
        <SelectContent>
          {field.options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (field.type === "multi-select") {
    const arr = Array.isArray(value) ? (value as string[]) : [];
    return (
      <Select
        items={field.options}
        multiple
        placeholder={field.placeholder ?? selectPlaceholder}
        value={arr}
        onValueChange={(val: unknown) => onChange(Array.isArray(val) ? val.map(String) : [])}
      >
        <SelectTrigger />
        <SelectContent>
          {field.options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (field.type === "remote-select") {
    // 查询区的远程字典（门店/会员/商品这类几万条的）：过滤权在服务端，
    // 不能像 select 那样要求先把全量选项落到前端。
    // RemoteSelect 的受控回调叫 onChange（第二参给完整选项），与本组件的 select 分支不同名，
    // 这里只取第一参喂回查询区的 values。
    return field.multiple === true ? (
      <RemoteSelect
        multiple
        fetcher={field.fetcher}
        resolveValue={field.resolveValue}
        placeholder={field.placeholder ?? selectPlaceholder}
        value={Array.isArray(value) ? (value as string[]) : []}
        onChange={(v) => onChange(v ?? [])}
      />
    ) : (
      <RemoteSelect
        fetcher={field.fetcher}
        resolveValue={field.resolveValue}
        placeholder={field.placeholder ?? selectPlaceholder}
        value={value == null || value === "" ? null : String(value)}
        onChange={(v) => onChange(v ?? "")}
      />
    );
  }

  if (field.type === "date-range") {
    return <RangeInputs type="date" value={value} onChange={onChange} />;
  }

  if (field.type === "datetime-range") {
    return <RangeInputs type="datetime-local" value={value} onChange={onChange} />;
  }

  if (field.type === "number-range") {
    return (
      <RangeInputs
        type="number"
        value={value}
        onChange={onChange}
        numberProps={{ min: field.min, max: field.max, step: field.step }}
      />
    );
  }

  if (field.type === "number") {
    return (
      <Input
        type="number"
        min={field.min}
        max={field.max}
        step={field.step}
        value={String(value ?? "")}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  // 其余落到单个 Input：date / datetime 走原生控件类型，缺省是文本。
  const type =
    field.type === "date"
      ? "date"
      : field.type === "datetime"
      ? "datetime-local"
      : field.inputType ?? "text";
  return (
    <Input
      type={type}
      value={String(value ?? "")}
      placeholder={field.placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function SearchForm({
  fields,
  values,
  onChange,
  onSearch,
  onReset,
  columns = 3,
  gap = 4,
  collapsible = true,
  defaultCollapsed = true,
  submitText,
  resetText,
  loading = false,
  className,
}: SearchFormProps) {
  const labels = useComponentLocale().searchForm ?? {
    selectPlaceholder: "请选择",
    submit: "查询",
    reset: "重置",
    expand: "展开",
    collapse: "收起",
  };
  const isControlled = values !== undefined;
  const [internal, setInternal] = useState<Record<string, unknown>>(() => seedDefaults(fields));
  const current = isControlled ? values : internal;

  const setValue = (name: string, v: unknown) => {
    const next = { ...current, [name]: v };
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  const collapsibleActive = collapsible && canCollapse(fields, columns);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const isCollapsed = collapsibleActive && collapsed;

  const { visible, actionStart } = planLayout(fields, columns, isCollapsed);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(current);
  };

  const handleReset = () => {
    const defaults = seedDefaults(fields);
    if (!isControlled) setInternal(defaults);
    onChange?.(defaults);
    onReset?.(defaults);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("rounded-[var(--radius)] border border-border bg-surface p-4", className)}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gap: `${gap * 0.25}rem`,
        }}
      >
        {visible.map((field) => (
          <div
            key={field.name}
            style={
              field.colSpan ? { gridColumn: `span ${Math.min(field.colSpan, columns)}` } : undefined
            }
          >
            <Field label={field.label}>
              {renderControl(field, current[field.name], setValue, labels.selectPlaceholder)}
            </Field>
          </div>
        ))}
        <div
          className="flex items-end justify-end gap-2"
          style={{ gridColumn: `${actionStart} / -1` }}
        >
          <Button type="submit" loading={loading}>
            {submitText ?? labels.submit}
          </Button>
          <Button type="button" variant="ghost" onClick={handleReset}>
            {resetText ?? labels.reset}
          </Button>
          {collapsibleActive && (
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className="inline-flex h-10 shrink-0 items-center gap-1 text-sm text-primary hover:underline"
            >
              {collapsed ? labels.expand : labels.collapse}
              <ChevronDown className={cn("transition-transform", !collapsed && "rotate-180")} />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
