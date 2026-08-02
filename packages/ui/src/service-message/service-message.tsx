"use client";
import { Avatar } from "../avatar/avatar";
import { ChevronRight, Ellipsis } from "../_icons";
import { useComponentLocale, zhCN } from "../config/locale";
import { cn } from "../lib/cn";
import type { ServiceMessageField, ServiceMessageProps } from "./service-message.types";

// 微信「服务通知」会话内消息卡片（模板/订阅消息形态）。
// 区别于 Notification（命令式四角 toast）：这是静态嵌入消息流的富卡片——
// 头部(头像 + 来源 + ⋯) / 正文(标题 + 键值字段，或自定义 children) / 底部(引导文字 + 小程序入口)。
// 纯皮肤 · 零依赖 · 全吃语义 token(明暗自适配) · 复用瑚琏 Avatar 与 _icons(Ellipsis · ChevronRight)。
// 标 "use client" 仅因对外暴露 onMore/onAction 交互回调（内部无状态），便于任意父级直接传处理函数。

function FieldRow({ label, value }: ServiceMessageField) {
  return (
    <div className="flex gap-3 text-sm leading-relaxed">
      <span className="w-20 shrink-0 text-muted">{label}</span>
      <span className="min-w-0 flex-1 font-medium text-foreground">{value}</span>
    </div>
  );
}

export function ServiceMessage({
  avatar,
  source,
  onMore,
  title,
  fields,
  footer,
  action,
  onAction,
  className,
  children,
  ...props
}: ServiceMessageProps) {
  const locale = useComponentLocale().serviceMessage ?? zhCN.components!.serviceMessage!;
  const resolvedFooter = footer === undefined ? locale.footer : footer;
  const hasHeader = avatar != null || source != null || onMore != null;
  const showFooter = resolvedFooter !== null; // 默认字符串显示；显式传 null 才隐藏
  const actionLabel = action?.label ?? locale.action;

  // 底部右侧「小程序入口」：图标 + 文字 + chevron
  const cta = (
    <span className="inline-flex shrink-0 items-center gap-1 text-sm text-muted">
      {action?.icon != null && <span className="inline-flex">{action.icon}</span>}
      {actionLabel !== "" && <span>{actionLabel}</span>}
      <ChevronRight className="size-4" />
    </span>
  );

  return (
    <div
      className={cn(
        "w-full max-w-sm overflow-hidden rounded-[var(--radius)] border border-hairline bg-surface text-foreground shadow-sm",
        className,
      )}
      {...props}
    >
      {/* 头部：头像 + 来源 + 更多 */}
      {hasHeader && (
        <>
          <div className="flex items-center gap-2 px-5 py-3.5">
            {avatar != null && (
              <Avatar size="sm" {...avatar} className={cn("size-5 text-[10px]", avatar.className)} />
            )}
            {source != null && (
              <span className="min-w-0 flex-1 truncate text-sm text-muted">{source}</span>
            )}
            {onMore != null && (
              <button
                type="button"
                aria-label={locale.more}
                onClick={onMore}
                className="-mr-1 shrink-0 rounded-sm p-1 text-muted outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                <Ellipsis className="size-5" />
              </button>
            )}
          </div>
          <div className="mx-5 border-t border-border" />
        </>
      )}

      {/* 正文：标题 + 键值字段 / 自定义 */}
      <div className="px-5 py-4">
        {title != null && (
          <div className="mb-3 text-base font-semibold leading-snug text-foreground">{title}</div>
        )}
        {children ??
          (fields != null && fields.length > 0 ? (
            <div className="space-y-2.5">
              {fields.map((f, i) => (
                <FieldRow key={i} label={f.label} value={f.value} />
              ))}
            </div>
          ) : null)}
      </div>

      {/* 底部：引导文字 + 小程序入口（onAction 时整行可点击） */}
      {showFooter && (
        <>
          <div className="mx-5 border-t border-border" />
          {onAction != null ? (
            <button
              type="button"
              onClick={onAction}
              className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left outline-none transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover"
            >
              <span className="min-w-0 truncate text-sm text-foreground">{resolvedFooter}</span>
              {cta}
            </button>
          ) : (
            <div className="flex items-center justify-between gap-3 px-5 py-3">
              <span className="min-w-0 truncate text-sm text-foreground">{resolvedFooter}</span>
              {cta}
            </div>
          )}
        </>
      )}
    </div>
  );
}
