// 中后台页面顶部骨架：返回 + 面包屑 + 标题 + 副标题 + 状态标签 + 右侧操作区 + 底部附加区。
// 纯皮肤布局件、只消费语义 token，dogfood 复用瑚琏 Breadcrumb/Button/Separator。
"use client";
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
  extra,
  footer,
  bordered = false,
  className,
  ...props
}: PageHeaderProps) {
  const locale = useComponentLocale();
  const resolvedBackLabel = backLabel ?? locale.pageHeader?.back ?? "返回";
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

      {footer && <div className="mt-3">{footer}</div>}

      {bordered && <Separator className="mt-4" />}
    </header>
  );
}
