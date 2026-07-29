"use client";
import { useState } from "react";
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

const BAR: Record<InterceptSeverity, string> = {
  block: "bg-[var(--color-chart-3)]",
  confirm: "bg-[var(--color-chart-4)]",
  notice: "bg-[var(--color-chart-2)]",
};

const BADGE: Record<InterceptSeverity, string> = {
  block: "bg-[var(--color-chart-3)]/12 text-[var(--color-chart-3)]",
  confirm: "bg-[var(--color-chart-4)]/12 text-[var(--color-chart-4)]",
  notice: "bg-[var(--color-chart-2)]/12 text-[var(--color-chart-2)]",
};

const LABEL: Record<InterceptSeverity, string> = {
  block: "已拦截",
  confirm: "待确认",
  notice: "提醒",
};

export function InterceptCard({
  severity,
  title,
  source,
  message,
  violation,
  suggestion,
  onOverride,
  overrideLabel = "放行本次",
  overridePlaceholder = "为什么这次可以放行？（必填，会进入审计记录）",
  overridden,
  className,
}: InterceptCardProps) {
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
        "relative overflow-hidden rounded-[calc(var(--radius)+0.25rem)] border border-border bg-card",
        className,
      )}
    >
      {/* 左缘色条：严重度的唯一视觉锚点。不给整卡染色 —— 拦截卡常成列出现，
          整卡染色会让列表变成一片色块，反而失去分级作用。 */}
      <span aria-hidden className={cn("absolute inset-y-0 left-0 w-1", BAR[severity])} />

      <div className="flex flex-col gap-3 py-4 pl-5 pr-4">
        <header className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              BADGE[severity],
            )}
          >
            {LABEL[severity]}
          </span>
          <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{title}</h3>
        </header>

        <p className="text-sm leading-relaxed text-foreground">{message}</p>

        {violation != null && (
          <div className="rounded-[var(--radius)] bg-muted/60 px-3 py-2">
            <div className="mb-1 text-xs font-medium text-muted">违反点</div>
            <div className="break-all font-mono text-xs leading-relaxed text-foreground">{violation}</div>
          </div>
        )}

        {suggestion != null && (
          <div className="rounded-[var(--radius)] border border-dashed border-border px-3 py-2">
            <div className="mb-1 text-xs font-medium text-muted">建议改法</div>
            <div className="text-xs leading-relaxed text-foreground">{suggestion}</div>
          </div>
        )}

        {source != null && (
          <div className="break-all text-xs text-muted">依据：{source}</div>
        )}

        {overridden != null ? (
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-[var(--radius)] bg-muted/50 px-3 py-2 text-xs">
            <span className="font-medium text-foreground">已放行</span>
            <span className="min-w-0 flex-1 text-muted">{overridden.reason}</span>
            {overridden.at != null && <span className="text-muted">{overridden.at}</span>}
          </div>
        ) : onOverride != null ? (
          open ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={overridePlaceholder}
                rows={2}
                className="w-full resize-y rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-xs text-foreground outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-ring"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!canSubmit}
                  onClick={submit}
                  className="rounded-[var(--radius)] bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground outline-none transition-opacity disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {busy ? "处理中…" : "确认放行"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setReason("");
                  }}
                  className="rounded-[var(--radius)] px-3 py-1.5 text-xs text-muted outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-[var(--radius)] border border-border px-3 py-1.5 text-xs text-foreground outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring"
              >
                {overrideLabel}
              </button>
            </div>
          )
        ) : null}
      </div>
    </article>
  );
}
