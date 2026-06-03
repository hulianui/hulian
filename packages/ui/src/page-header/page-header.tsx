// 中后台页面顶部骨架：返回 + 面包屑 + 标题 + 副标题 + 状态标签 + 右侧操作区 + 底部附加区。
// 纯皮肤布局件、只消费语义 token，dogfood 复用瑚琏 Breadcrumb/Button/Separator。
// 无 "use client"：本体无 hook/无浏览器 API → 可 RSC；返回按钮的 onClick 由 onBack 守卫，
// 仅在传入 onBack（消费侧必为 client）时渲染，server 用法下不产出事件处理器（同 Breadcrumb 纯皮肤范式）。
import { ArrowLeft } from "../_icons";
import { Button } from "../button";
import { Separator } from "../separator";
import { cn } from "../lib/cn";
import type { PageHeaderProps } from "./page-header.types";

export function PageHeader({
  title,
  subTitle,
  onBack,
  backLabel = "返回",
  breadcrumb,
  tags,
  extra,
  footer,
  bordered = false,
  className,
  ...props
}: PageHeaderProps) {
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
              size="sm"
              className="size-9 shrink-0 px-0"
              aria-label={backLabel}
              onClick={onBack}
            >
              <ArrowLeft className="size-4" aria-hidden />
            </Button>
          )}
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            {subTitle && <span className="text-sm text-muted">{subTitle}</span>}
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
