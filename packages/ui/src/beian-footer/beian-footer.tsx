"use client";
import { cn } from "../lib/cn";
import { PoliceBadge } from "../_icons";

import { useComponentLocale } from "../config/locale-context";
import type { BeianFooterProps } from "./beian-footer.types";

const MIIT = "https://beian.miit.gov.cn/";
const MPS = "https://beian.mps.gov.cn/";

const linkClass =
  "font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline";

/**
 * 备案页脚 —— ICP 备案号（可多个）+ 公网安备（警徽）。
 * 中国大陆站点底部合规条；外链统一新窗 + noreferrer，配色走语义 token，暗色自适应。
 */
export function BeianFooter({
  icp = [],
  police,
  icpLabel,
  copyright,
  className,
}: BeianFooterProps) {
  const locale = useComponentLocale().beianFooter ?? { icp: "ICP备案" };
  const resolvedIcpLabel = icpLabel === undefined ? locale.icp : icpLabel;
  return (
    <div
      className={cn(
        "rounded-2xl border border-hairline bg-surface px-6 py-5 text-center text-sm text-muted shadow-sm",
        className,
      )}
    >
      {icp.length > 0 && (
        <p className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
          <span>{resolvedIcpLabel}</span>
          {icp.map((r) => (
            <a
              key={r.number}
              href={r.href ?? MIIT}
              target="_blank"
              rel="noreferrer"
              className={linkClass}
            >
              {r.number}
            </a>
          ))}
        </p>
      )}
      {police && (
        <p className="mt-1.5 flex flex-wrap items-center justify-center">
          <a
            href={police.href ?? MPS}
            target="_blank"
            rel="noreferrer"
            className={cn(linkClass, "inline-flex items-center gap-1.5 hover:no-underline")}
          >
            <PoliceBadge className="size-4 shrink-0 text-primary" aria-hidden />
            <span className="underline-offset-4 hover:underline">{police.number}</span>
          </a>
        </p>
      )}
      {copyright && <p className="mt-2 text-muted">{copyright}</p>}
    </div>
  );
}
