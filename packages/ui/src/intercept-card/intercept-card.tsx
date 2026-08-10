"use client";
import { useState } from "react";

import { useComponentLocale } from "../config/locale-context";
import { cn } from "../lib/cn";
import type { InterceptCardProps, InterceptSeverity } from "./intercept-card.types";

// 拦截卡（"use client"·零依赖·纯 CSS）：
//
//  与既有 Alert / Result 的差异化（定位边界，勿混用）：
//   · Alert  = 一句话提示。无出处、无动作、看完即走。
//   · Result = 整页结果态（成功 / 失败 / 404）。占满视野，是页面的主体。
//   · InterceptCard = 「某个动作被规则挡下了」的完整交代：
//                     规则是什么 · 出处在哪 · 违反点在哪 · 该怎么改 · 我要不要放行。
//                     它嵌在列表 / 详情里，是一个可操作的决策单元。
//
//  设计要点：溯源(source)与放行理由是一等公民。
//  一条说不清出处的拦截，用户第一反应是关掉它而不是遵守它；
//  一次没写理由的放行，半年后没人记得当时为什么放行 —— 那等于没有治理。
//  故 onOverride 在理由为空时不会被调用（按钮禁用），这是刻意的硬约束。

// 语义色而非 chart-N（后者是图表分类色，不承载危险/正常的含义）
const BAR: Record<InterceptSeverity, string> = {
  block: "bg-danger",
  confirm: "bg-warning",
  notice: "bg-primary",
};

const BADGE: Record<InterceptSeverity, string> = {
  block: "bg-danger/12 text-danger",
  confirm: "bg-warning/12 text-warning",
  notice: "bg-primary/12 text-primary",
};

export function InterceptCard({
  severity,
  title,
  source,
  message,
  violation,
  suggestion,
  onOverride,
  overrideLabel,
  overridePlaceholder,
  overridden,
  className,
}: InterceptCardProps) {
  const locale = useComponentLocale().interceptCard ?? {
    severity: { block: "已拦截", confirm: "待确认", notice: "提醒" },
    violation: "违反点",
    suggestion: "建议改法",
    source: "依据：",
    overridden: "已放行",
    override: "放行本次",
    overridePlaceholder: "为什么这次可以放行？（必填，会进入审计记录）",
    processing: "处理中…",
    confirmOverride: "确认放行",
    cancel: "取消",
  };
  const resolvedOverrideLabel = overrideLabel ?? locale.override;
  const resolvedOverridePlaceholder = overridePlaceholder ?? locale.overridePlaceholder;
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  const canSubmit = reason.trim().length > 0 && !busy;

  const submit = async () => {
    if (!canSubmit || onOverride == null) return;
    setBusy(true);
    try {
      await onOverride(reason.trim());
      setReason("");
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <article
      data-severity={severity}
      className={cn(
        "relative overflow-hidden rounded-[calc(var(--radius)+0.25rem)] border border-border bg-surface",
        className,
      )}
    >
      {/* 左缘色条：严重度的唯一视觉锚点。不给整卡染色 —— 拦截卡常成列出现，
          整卡染色会让列表变成一片色块，反而失去分级作用。 */}
      <span aria-hidden className={cn("absolute inset-y-0 left-0 w-1", BAR[severity])} />

      <div className="flex flex-col gap-3 py-4 pl-5 pr-4">
        <header className="flex flex-wrap items-center gap-2">
          <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", BADGE[severity])}>
            {locale.severity[severity]}
          </span>
          <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{title}</h3>
        </header>

        <p className="text-sm leading-relaxed text-foreground">{message}</p>

        {violation != null && (
          // 违反点是整张卡最需要被看见的信息（组件就是为了交代它），此前却是全卡最难读的一块：
          // bg-muted-foreground 是次要**文字**色，块标题又用 text-muted-foreground，前景背景同一个 token。
          // 改用 danger 的极淡底 + danger 标题，与左侧红锚点呼应，让它自己形成焦点（#136）。
          <div className="rounded-[var(--radius)] bg-danger/10 px-3 py-2">
            <div className="mb-1 text-xs font-medium text-danger">{locale.violation}</div>
            <div className="break-all font-mono text-xs leading-relaxed text-foreground">
              {violation}
            </div>
          </div>
        )}

        {suggestion != null && (
          <div className="rounded-[var(--radius)] border border-dashed border-border px-3 py-2">
            <div className="mb-1 text-xs font-medium text-muted-foreground">{locale.suggestion}</div>
            <div className="text-xs leading-relaxed text-foreground">{suggestion}</div>
          </div>
        )}

        {source != null && (
          <div className="break-all text-xs text-muted-foreground">
            {locale.source} {source}
          </div>
        )}

        {overridden != null ? (
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-[var(--radius)] bg-subtle px-3 py-2 text-xs">
            <span className="font-medium text-foreground">{locale.overridden}</span>
            <span className="min-w-0 flex-1 text-muted-foreground">{overridden.reason}</span>
            {overridden.at != null && <span className="text-muted-foreground">{overridden.at}</span>}
          </div>
        ) : onOverride != null ? (
          open ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={resolvedOverridePlaceholder}
                rows={2}
                className="w-full resize-y rounded-[var(--radius)] border border-border bg-bg px-3 py-2 text-xs text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!canSubmit}
                  onClick={submit}
                  className="rounded-[var(--radius)] bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground outline-none transition-opacity disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {busy ? locale.processing : locale.confirmOverride}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setReason("");
                  }}
                  className="rounded-[var(--radius)] px-3 py-1.5 text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {locale.cancel}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-[var(--radius)] border border-border px-3 py-1.5 text-xs text-foreground outline-none hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring"
              >
                {resolvedOverrideLabel}
              </button>
            </div>
          )
        ) : null}
      </div>
    </article>
  );
}
