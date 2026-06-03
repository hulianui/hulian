"use client";
import { useState, type FormEvent, type ReactNode } from "react";
import { cn } from "../lib/cn";
import { Button } from "../button";
import { Field } from "../field";
import { Input } from "../input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../select";
import { canCollapse, planLayout } from "./search-form.layout";
import type { SearchField, SearchFormProps } from "./search-form.types";

const ChevronDown = ({ className }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** 非受控初始值：date-range → ["",""]，其余 → ""（或字段 defaultValue）。 */
function seedDefaults(fields: SearchField[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    out[f.name] = f.defaultValue ?? (f.type === "date-range" ? ["", ""] : "");
  }
  return out;
}

function renderControl(
  field: SearchField,
  value: unknown,
  setValue: (name: string, v: unknown) => void,
): ReactNode {
  const onChange = (v: unknown) => setValue(field.name, v);

  if (field.render) return field.render({ name: field.name, value, onChange });

  if (field.type === "select") {
    const v = (value as string) ?? "";
    return (
      <Select
        items={field.options}
        placeholder={field.placeholder ?? "请选择"}
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

  if (field.type === "date-range") {
    const arr = Array.isArray(value) ? value : ["", ""];
    const start = String(arr[0] ?? "");
    const end = String(arr[1] ?? "");
    return (
      <div className="flex items-center gap-2">
        <Input type="date" value={start} onChange={(e) => onChange([e.target.value, end])} className="flex-1" />
        <span className="shrink-0 text-muted">~</span>
        <Input type="date" value={end} onChange={(e) => onChange([start, e.target.value])} className="flex-1" />
      </div>
    );
  }

  const type = field.type === "date" ? "date" : (field.inputType ?? "text");
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
  submitText = "查询",
  resetText = "重置",
  loading = false,
  className,
}: SearchFormProps) {
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
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: `${gap * 0.25}rem` }}
      >
        {visible.map((field) => (
          <div
            key={field.name}
            style={field.colSpan ? { gridColumn: `span ${Math.min(field.colSpan, columns)}` } : undefined}
          >
            <Field label={field.label}>{renderControl(field, current[field.name], setValue)}</Field>
          </div>
        ))}
        <div className="flex items-end justify-end gap-2" style={{ gridColumn: `${actionStart} / -1` }}>
          <Button type="submit" loading={loading}>
            {submitText}
          </Button>
          <Button type="button" variant="ghost" onClick={handleReset}>
            {resetText}
          </Button>
          {collapsibleActive && (
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className="inline-flex shrink-0 items-center gap-1 text-sm text-primary hover:underline"
            >
              {collapsed ? "展开" : "收起"}
              <ChevronDown className={cn("transition-transform", !collapsed && "rotate-180")} />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
