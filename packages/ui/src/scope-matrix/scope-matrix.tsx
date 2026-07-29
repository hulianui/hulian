"use client";
import { useState } from "react";
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
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const commit = () => {
    const v = draft.trim();
    if (v === "") return;
    if (values.includes(v)) {
      setError("已存在相同模式");
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

  const tone =
    kind === "allow" ? "var(--color-chart-1)" : "var(--color-chart-3)";

  return (
    <section
      data-bucket={kind}
      className="flex min-w-0 flex-1 flex-col rounded-[calc(var(--radius)+0.25rem)] bg-muted/40"
    >
      <header className="relative px-3 pt-3">
        <span
          aria-hidden
          className="absolute inset-y-2.5 left-0 w-1 rounded-full"
          style={{ background: tone }}
        />
        <div className="flex items-center justify-between gap-2 pl-2">
          <span className="text-sm font-semibold text-foreground">{label}</span>
          <span className="tabular-nums text-xs text-muted">{values.length} 条</span>
        </div>
        <p className="mt-0.5 pl-2 text-xs leading-relaxed text-muted">{hint}</p>
      </header>

      <ul className="flex flex-1 flex-col gap-1.5 p-3">
        {values.length === 0 ? (
          <li className="grid flex-1 place-items-center rounded-[var(--radius)] border border-dashed border-border py-5 text-xs text-muted">
            {kind === "allow" ? "未设置（不启用白名单）" : "未设置"}
          </li>
        ) : (
          values.map((v) => (
            <li
              key={v}
              className="flex items-center gap-2 rounded-[var(--radius)] border border-border bg-background px-2.5 py-1.5"
            >
              <code className="min-w-0 flex-1 break-all font-mono text-xs text-foreground">{v}</code>
              {editable && (
                <button
                  type="button"
                  aria-label={`移除 ${v}`}
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
              className="min-w-0 flex-1 rounded-[var(--radius)] border border-border bg-background px-2.5 py-1.5 font-mono text-xs text-foreground outline-none placeholder:font-sans placeholder:text-muted focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="button"
              onClick={commit}
              className="shrink-0 rounded-[var(--radius)] border border-border px-2.5 py-1.5 text-xs text-foreground outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring"
            >
              添加
            </button>
          </div>

          {error != null && <p className="text-xs text-[var(--color-chart-3)]">{error}</p>}

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

export function ScopeMatrix({
  allow,
  deny,
  onChange,
  suggestions = [],
  readOnly = false,
  validate,
  allowLabel = "允许",
  denyLabel = "禁止",
  allowHint,
  denyHint,
  placeholder = "输入模式后回车",
  className,
}: ScopeMatrixProps) {
  const editable = !readOnly && onChange != null;

  const emit = (next: { allow: string[]; deny: string[] }) => onChange?.(next);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Bucket
          kind="allow"
          label={allowLabel}
          hint={allowHint ?? "留空表示不启用白名单，此时只受「禁止」约束"}
          values={allow}
          onAdd={(v) => emit({ allow: [...allow, v], deny })}
          onRemove={(v) => emit({ allow: allow.filter((x) => x !== v), deny })}
          suggestions={suggestions}
          editable={editable}
          validate={validate}
          placeholder={placeholder}
        />
        <Bucket
          kind="deny"
          label={denyLabel}
          hint={denyHint ?? "命中即拒绝，优先级高于「允许」"}
          values={deny}
          onAdd={(v) => emit({ allow, deny: [...deny, v] })}
          onRemove={(v) => emit({ allow, deny: deny.filter((x) => x !== v) })}
          suggestions={suggestions}
          editable={editable}
          validate={validate}
          placeholder={placeholder}
        />
      </div>

      {/* 有效范围小结：这类配置最容易想错的就是空白名单与优先级，直接写出来。 */}
      <p className="rounded-[var(--radius)] bg-muted/50 px-3 py-2 text-xs leading-relaxed text-muted">
        {allow.length === 0 && deny.length === 0
          ? "当前未设置任何范围限制。"
          : allow.length === 0
            ? `未启用白名单：除命中「${denyLabel}」的 ${deny.length} 条模式外，其余全部允许。`
            : deny.length === 0
              ? `仅允许命中「${allowLabel}」的 ${allow.length} 条模式，其余全部拒绝。`
              : `先看「${denyLabel}」（${deny.length} 条）：命中即拒绝；未命中的再看「${allowLabel}」（${allow.length} 条），命中才允许。`}
      </p>
    </div>
  );
}
