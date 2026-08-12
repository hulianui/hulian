// 中后台页面顶部骨架：返回 + 面包屑 + 标题 + 副标题 + 状态标签 + 右侧操作区 + 底部附加区。
// 纯皮肤布局件、只消费语义 token，dogfood 复用瑚琏 Breadcrumb/Button/Separator。
"use client";
import { Fragment } from "react";
import { ArrowLeft } from "../_icons";
import { Button } from "../button";
import { Separator } from "../separator";
import { cn } from "../lib/cn";
import { useComponentLocale } from "../config/locale-context";
import type { PageHeaderProps } from "./page-header.types";

export function PageHeader({
  title,
  subTitle,
  onBack,
  backLabel,
  breadcrumb,
  tags,
  meta,
  metaSeparator = "·",
  extra,
  footer,
  bordered = false,
  className,
  ...props
}: PageHeaderProps) {
  const locale = useComponentLocale();
  const resolvedBackLabel = backLabel ?? locale.pageHeader?.back ?? "返回";
  // 空项在这里就被丢掉，分隔符只插在**留下来的**项之间：某一项缺值时不会剩下一个孤零零的中点
  // （#240 —— 消费方用 `span + span::before` 拼点，绕的正是这件事）。
  // `0` 是事实值（0 家公司），不算空。
  const metaItems = meta?.filter((item) => item != null && item !== false && item !== "");
  return (
    <header className={cn("w-full", className)} {...props}>
      {breadcrumb && <div className="mb-2">{breadcrumb}</div>}

      {/* 主行：左侧标题群 / 右侧操作区垂直居中对齐；窄屏 extra 自动换行到下方 */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="flex min-w-0 items-center gap-3">
          {onBack && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              aria-label={resolvedBackLabel}
              onClick={onBack}
            >
              <ArrowLeft className="size-4" aria-hidden />
            </Button>
          )}
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            {subTitle && <span className="text-sm text-muted-foreground">{subTitle}</span>}
            {tags && <div className="flex items-center gap-1.5">{tags}</div>}
          </div>
        </div>

        {extra && <div className="flex flex-wrap items-center gap-2">{extra}</div>}
      </div>

      {/* 元信息行：一串并列的事实值 → 真列表语义（ul/li），分隔符落独立 aria-hidden 装饰位，
          读屏读到的是「5 项列表」而不是一串被中点粘住的文本（照 Breadcrumb 的分隔符范式）。 */}
      {metaItems && metaItems.length > 0 && (
        <ul
          data-slot="page-header-meta"
          className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground"
        >
          {metaItems.map((item, i) => (
            <Fragment key={i}>
              {i > 0 && (
                <li aria-hidden="true" className="select-none [&>svg]:size-3.5">
                  {metaSeparator}
                </li>
              )}
              <li className="min-w-0">{item}</li>
            </Fragment>
          ))}
        </ul>
      )}

      {footer && <div className="mt-3">{footer}</div>}

      {bordered && <Separator className="mt-4" />}
    </header>
  );
}
