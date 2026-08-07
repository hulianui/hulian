"use client";
import { useState, memo } from "react";

import { useComponentLocale } from "../config/locale-context";
import { cn } from "../lib/cn";
import type { ScopeMatrixProps } from "./scope-matrix.types";

// 允许/禁止模式矩阵（"use client"·零依赖·纯 CSS）：
//
//  与既有 Transfer / TagInput 的差异化（定位边界，勿混用）：
//   · Transfer  = 从固定候选池左右搬运。候选是封闭集合，用户只能选不能造。
//   · TagInput  = 自由输入的一维标签集。没有"两个对立的桶"这层语义。
//   · ScopeMatrix = 两个语义对立的模式桶（允许 / 禁止），值是自由输入的模式串。
//                   核心不是搬运，而是让人看清"最终有效范围"这件容易想错的事。
//
//  两条被刻意做进组件的语义提示（它们是这类配置最常见的两个误解）：
//   1. 禁止优先于允许 —— 同时命中时以禁止为准。
//   2. 允许为空 ≠ 全部禁止 —— 而是"不启用白名单"，只受禁止列表约束。
//      这一条极易写反，写反的后果是配好之后一切都被拦，用户会以为工具坏了。
//
//  模式语法不做内置校验：glob / 正则 / ant 风格 / 自定义 DSL 差异很大，
//  组件猜错比不猜更糟。需要校验就传 validate。

function Bucket({
  kind,
  label,
  hint,
  values,
  onAdd,
  onRemove,
  suggestions,
  editable,
  validate,
  placeholder,
}: {
  kind: "allow" | "deny";
  label: React.ReactNode;
  hint: React.ReactNode;
  values: string[];
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
  suggestions: string[];
  editable: boolean;
  validate: ScopeMatrixProps["validate"];
  placeholder: string;
}) {
  const locale = useComponentLocale().scopeMatrix ?? {
    duplicate: "已存在相同模式",
    count: (count) => `${count} 条`,
    emptyAllow: "未设置（不启用白名单）",
    empty: "未设置",
    remove: (value) => `移除 ${value}`,
    add: "添加",
    allow: "允许",
    deny: "禁止",
    placeholder: "输入模式后回车",
    allowHint: "留空表示不启用白名单，此时只受「禁止」约束",
    denyHint: "命中即拒绝，优先级高于「允许」",
    unrestricted: "当前未设置任何范围限制。",
    denyOnly: (denyLabel, count) =>
      `未启用白名单：除命中「${String(denyLabel)}」的 ${count} 条模式外，其余全部允许。`,
    allowOnly: (allowLabel, count) =>
      `仅允许命中「${String(allowLabel)}」的 ${count} 条模式，其余全部拒绝。`,
    combined: (denyLabel, denyCount, allowLabel, allowCount) =>
      `先看「${String(denyLabel)}」（${denyCount} 条）：命中即拒绝；未命中的再看「${String(
        allowLabel,
      )}」（${allowCount} 条），命中才允许。`,
  };
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const commit = () => {
    const v = draft.trim();
    if (v === "") return;
    if (values.includes(v)) {
      setError(locale.duplicate);
      return;
    }
    const err = validate?.(v) ?? null;
    if (err !== null) {
      setError(err);
      return;
    }
    onAdd(v);
    setDraft("");
    setError(null);
  };

  // 语义色：允许=success / 禁止=danger。用 chart-N 会让"禁止"渲染成
  // 一个没有危险含义的分类色，削弱它的警示作用。
  const tone = kind === "allow" ? "var(--color-success)" : "var(--color-danger)";

  return (
    <section
      data-bucket={kind}
      className="flex min-w-0 flex-1 flex-col rounded-[calc(var(--radius)+0.25rem)] bg-subtle"
    >
      <header className="relative px-3 pt-3">
        <span
          aria-hidden
          className="absolute inset-y-2.5 left-0 w-1 rounded-full"
          style={{ background: tone }}
        />
        <div className="flex items-center justify-between gap-2 pl-2">
          <span className="text-sm font-semibold text-foreground">{label}</span>
          <span className="tabular-nums text-xs text-muted">{locale.count(values.length)}</span>
        </div>
        <p className="mt-0.5 pl-2 text-xs leading-relaxed text-muted">{hint}</p>
      </header>

      <ul className="flex flex-1 flex-col gap-1.5 p-3">
        {values.length === 0 ? (
          <li className="grid flex-1 place-items-center rounded-[var(--radius)] border border-dashed border-border py-5 text-xs text-muted">
            {kind === "allow" ? locale.emptyAllow : locale.empty}
          </li>
        ) : (
          values.map((v) => (
            <li
              key={v}
              className="flex items-center gap-2 rounded-[var(--radius)] border border-border bg-bg px-2.5 py-1.5"
            >
              <code className="min-w-0 flex-1 break-all font-mono text-xs text-foreground">
                {v}
              </code>
              {editable && (
                <button
                  type="button"
                  aria-label={locale.remove(v)}
                  onClick={() => onRemove(v)}
                  className="shrink-0 rounded-[var(--radius)] px-1 text-xs text-muted outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  ✕
                </button>
              )}
            </li>
          ))
        )}
      </ul>

      {editable && (
        <div className="flex flex-col gap-1.5 px-3 pb-3">
          <div className="flex gap-1.5">
            <input
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commit();
                }
              }}
              placeholder={placeholder}
              className="min-w-0 flex-1 rounded-[var(--radius)] border border-border bg-bg px-2.5 py-1.5 font-mono text-xs text-foreground outline-none placeholder:font-sans placeholder:text-muted focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="button"
              onClick={commit}
              className="shrink-0 rounded-[var(--radius)] border border-border px-2.5 py-1.5 text-xs text-foreground outline-none hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring"
            >
              {locale.add}
            </button>
          </div>

          {error != null && <p className="text-xs text-danger">{error}</p>}

          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {suggestions
                .filter((s) => !values.includes(s))
                .slice(0, 6)
                .map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setDraft(s)}
                    className="rounded-full border border-dashed border-border px-2 py-0.5 font-mono text-[11px] text-muted outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {s}
                  </button>
                ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function ScopeMatrixImpl({
  allow,
  deny,
  onChange,
  suggestions: suggestionsProp,
  readOnly = false,
  validate,
  allowLabel,
  denyLabel,
  allowHint,
  denyHint,
  placeholder,
  className,
}: ScopeMatrixProps) {
  const suggestions = suggestionsProp ?? [];
  const locale = useComponentLocale().scopeMatrix ?? {
    duplicate: "已存在相同模式",
    count: (count) => `${count} 条`,
    emptyAllow: "未设置（不启用白名单）",
    empty: "未设置",
    remove: (value) => `移除 ${value}`,
    add: "添加",
    allow: "允许",
    deny: "禁止",
    placeholder: "输入模式后回车",
    allowHint: "留空表示不启用白名单，此时只受「禁止」约束",
    denyHint: "命中即拒绝，优先级高于「允许」",
    unrestricted: "当前未设置任何范围限制。",
    denyOnly: (denyLabel, count) =>
      `未启用白名单：除命中「${String(denyLabel)}」的 ${count} 条模式外，其余全部允许。`,
    allowOnly: (allowLabel, count) =>
      `仅允许命中「${String(allowLabel)}」的 ${count} 条模式，其余全部拒绝。`,
    combined: (denyLabel, denyCount, allowLabel, allowCount) =>
      `先看「${String(denyLabel)}」（${denyCount} 条）：命中即拒绝；未命中的再看「${String(
        allowLabel,
      )}」（${allowCount} 条），命中才允许。`,
  };
  const resolvedAllowLabel = allowLabel ?? locale.allow;
  const resolvedDenyLabel = denyLabel ?? locale.deny;
  const resolvedPlaceholder = placeholder ?? locale.placeholder;
  const editable = !readOnly && onChange != null;

  const emit = (next: { allow: string[]; deny: string[] }) => onChange?.(next);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Bucket
          kind="allow"
          label={resolvedAllowLabel}
          hint={allowHint ?? locale.allowHint}
          values={allow}
          onAdd={(v) => emit({ allow: [...allow, v], deny })}
          onRemove={(v) => emit({ allow: allow.filter((x) => x !== v), deny })}
          suggestions={suggestions}
          editable={editable}
          validate={validate}
          placeholder={resolvedPlaceholder}
        />
        <Bucket
          kind="deny"
          label={resolvedDenyLabel}
          hint={denyHint ?? locale.denyHint}
          values={deny}
          onAdd={(v) => emit({ allow, deny: [...deny, v] })}
          onRemove={(v) => emit({ allow, deny: deny.filter((x) => x !== v) })}
          suggestions={suggestions}
          editable={editable}
          validate={validate}
          placeholder={resolvedPlaceholder}
        />
      </div>

      {/* 有效范围小结：这类配置最容易想错的就是空白名单与优先级，直接写出来。 */}
      <p className="rounded-[var(--radius)] bg-subtle px-3 py-2 text-xs leading-relaxed text-muted">
        {allow.length === 0 && deny.length === 0
          ? locale.unrestricted
          : allow.length === 0
          ? locale.denyOnly(resolvedDenyLabel, deny.length)
          : deny.length === 0
          ? locale.allowOnly(resolvedAllowLabel, allow.length)
          : locale.combined(resolvedDenyLabel, deny.length, resolvedAllowLabel, allow.length)}
      </p>
    </div>
  );
}

ScopeMatrixImpl.displayName = "ScopeMatrix";

// ScopeMatrix 常挂在设置页表单里，父级每敲一个字都重渲；props 稳定时应整棵跳过
// —— 与 Button/Checkbox/Chip 同一处方（hulianui/hulian#89）。
export const ScopeMatrix = memo(ScopeMatrixImpl);
ScopeMatrix.displayName = "ScopeMatrix";
