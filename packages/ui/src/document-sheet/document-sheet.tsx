"use client";
//
// DocumentSheet —— A4 单据纸张容器 + 打印态。
//
// 用途：报价单 / 发票 / 合同等「单据」的纸面容器，屏幕上像一张居中的白纸，
// 打印时只剩纸面内容。库里此前缺失「单据/打印」品类，本组件补齐。
//
// 打印态隔离思路（全部用 Tailwind `print:` 变体，组件自包含，不改全局 CSS）：
//   1. 工具栏（toolbar + 打印按钮）挂 `print:hidden` —— 打印时整条工具栏消失，
//      只留纸面，避免把「打印」按钮等屏幕态控件印到纸上。
//   2. 纸面根节点打印时去掉阴影 / 外边距 / 圆角 / 最大宽度（`print:shadow-none
//      print:m-0 print:rounded-none print:max-w-none`），让内容铺满打印纸张，
//      不被屏幕态的视觉包装干扰。
//   3. 纸面根节点带 `data-document-sheet` 属性，方便消费方按需写自己的全局
//      `@media print` 规则（如 `[data-document-sheet]{ ... }` 控制分页），
//      本组件不强加任何全局样式。
//   4. 暗色下纸面仍保持「纸」的观感：浅色用纯白，暗色用 zinc-900 近黑纸，
//      正文走 token 的 `text-foreground`，随主题自适应。
//
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { useComponentLocale } from "../config/locale-context";
import { cn } from "../lib/cn";

export interface DocumentSheetProps extends HTMLAttributes<HTMLDivElement> {
  /** 纸张尺寸：a4 锁定 210mm 宽（高度由内容撑开），auto 自适应宽度 */
  size?: "a4" | "auto";
  /** 工具栏区内容（屏幕态显示，打印时隐藏） */
  toolbar?: ReactNode;
  /** 点击打印回调，缺省时调用 window.print() */
  onPrint?: () => void;
  /** 是否展示内置「打印」按钮（默认 true） */
  printable?: boolean;
  children: ReactNode;
}

/**
 * A4 单据纸张容器。渲染一张居中、带阴影的「纸」，顶部一条打印时自动隐藏的工具栏。
 */
export const DocumentSheet = forwardRef<HTMLDivElement, DocumentSheetProps>(
  ({ size = "a4", toolbar, onPrint, printable = true, children, className, ...props }, ref) => {
    const locale = useComponentLocale().documentSheet ?? { print: "打印" };
    const handlePrint = () => {
      if (onPrint) onPrint();
      else if (typeof window !== "undefined") window.print();
    };

    return (
      <div className="flex flex-col items-center gap-3">
        {/* 工具栏区：屏幕态显示，打印时整条隐藏 */}
        {(toolbar || printable) && (
          <div
            className={cn(
              "flex w-full items-center justify-end gap-2 print:hidden",
              size === "a4" ? "max-w-[210mm]" : "max-w-none",
            )}
          >
            {toolbar}
            {printable && (
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex h-8 items-center gap-1.5 rounded-[var(--radius)] border border-hairline bg-surface px-3 text-sm font-medium text-foreground shadow-sm outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M6 9V2h12v7" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" rx="1" />
                </svg>
                {locale.print}
              </button>
            )}
          </div>
        )}

        {/* 纸面：屏幕态白纸 + 阴影 + 内边距；打印态去包装铺满 */}
        <div
          ref={ref}
          data-document-sheet=""
          className={cn(
            "w-full bg-white text-foreground shadow-lg dark:bg-zinc-900",
            "rounded-[var(--radius)] p-[16mm]",
            size === "a4" ? "max-w-[210mm]" : "max-w-none",
            "print:m-0 print:max-w-none print:rounded-none print:p-0 print:shadow-none",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  },
);
DocumentSheet.displayName = "DocumentSheet";

/**
 * 单据抬头区：左右两栏（我方/标题 vs 对方/单号），两端对齐。
 */
export const DocumentSheetHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-start justify-between gap-6 pb-6", className)}
      {...props}
    />
  ),
);
DocumentSheetHeader.displayName = "DocumentSheetHeader";

export interface DocumentSheetSectionProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** 可选小标题 */
  title?: ReactNode;
}

/**
 * 单据段落块：带可选小标题的语义段。
 */
export const DocumentSheetSection = forwardRef<HTMLDivElement, DocumentSheetSectionProps>(
  ({ title, children, className, ...props }, ref) => (
    <section ref={ref} className={cn("py-4 text-sm", className)} {...props}>
      {title && (
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      )}
      {children}
    </section>
  ),
);
DocumentSheetSection.displayName = "DocumentSheetSection";

/**
 * 单据页脚：签章位 / 备注，含顶部分隔线。
 */
export const DocumentSheetFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <footer
      ref={ref}
      className={cn("mt-6 border-t border-border pt-6 text-sm text-muted-foreground", className)}
      {...props}
    />
  ),
);
DocumentSheetFooter.displayName = "DocumentSheetFooter";

export interface DocumentSheetSignatureProps extends HTMLAttributes<HTMLDivElement> {
  /** 签名线下方的角色/说明（如「授权代表（签章）」）。 */
  label?: ReactNode;
  /** 签名线宽度（数字按 px，或任意 CSS 长度）。默认 11rem。 */
  lineWidth?: number | string;
}

/**
 * 签章/签名块：上方留出物理签字空间，一条签名线，线下居中角色文字。
 * 替代消费方手搓的 `mb-8` 魔数 + 错位 flex，给出对齐稳定的标准签章位。
 */
export const DocumentSheetSignature = forwardRef<HTMLDivElement, DocumentSheetSignatureProps>(
  ({ label, lineWidth = "11rem", className, ...props }, ref) => {
    const w = typeof lineWidth === "number" ? `${lineWidth}px` : lineWidth;
    return (
      <div ref={ref} className={cn("text-xs text-muted-foreground", className)} {...props}>
        {/* 物理签字 / 盖章留白 */}
        <div className="h-12" aria-hidden />
        <div className="border-t border-foreground/40 pt-1.5 text-center" style={{ width: w }}>
          {label}
        </div>
      </div>
    );
  },
);
DocumentSheetSignature.displayName = "DocumentSheetSignature";
