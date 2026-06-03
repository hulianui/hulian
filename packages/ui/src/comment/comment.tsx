import { cva } from "class-variance-authority";
import { Avatar } from "../avatar/avatar";
import { Link } from "../link/link";
import { cn } from "../lib/cn";
import type {
  CommentActionProps,
  CommentActionsProps,
  CommentProps,
} from "./comment.types";

// 操作区小按钮皮肤：text-muted、hover 提亮、与 Link/Button 一致的 focus 环。
export const commentActionVariants = cva(
  "inline-flex items-center gap-1 rounded-sm text-xs font-medium text-muted outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
);

/** 操作区容器：横向小按钮排列（点赞/回复/更多）。 */
export function CommentActions({ className, children, ...props }: CommentActionsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)} {...props}>
      {children}
    </div>
  );
}

/** 单个操作：默认 <button>（onClick 交互）；传 href 则 dogfood 瑚琏 Link（链接型）。 */
export function CommentAction({ href, className, children, ...props }: CommentActionProps) {
  const cls = cn(commentActionVariants(), className);
  if (href != null) {
    return (
      <Link href={href} tone="foreground" underline="none" className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...props}>
      {children}
    </button>
  );
}

/**
 * 评论（工单/讨论·嵌套回复）。纯皮肤·零依赖·可 RSC（内部 Avatar 为 client 岛，组合无新增状态）。
 * 复用瑚琏 Avatar（头像）/ Link（链接型操作）。嵌套子评论经 children 递归，自动缩进。
 */
export function Comment({
  author,
  avatar,
  datetime,
  content,
  actions,
  children,
  type = "comment",
  connector = false,
  className,
  ...props
}: CommentProps) {
  const isLog = type === "log";
  return (
    <article
      data-type={type}
      className={cn("flex gap-3", isLog ? "items-center" : "items-start", className)}
      {...props}
    >
      {/* 头像 / 系统标记列 */}
      {isLog ? (
        <span
          aria-hidden
          className="flex size-8 shrink-0 items-center justify-center"
        >
          <span className="size-2 rounded-full bg-muted" />
        </span>
      ) : (
        <Avatar size="sm" {...avatar} />
      )}

      {/* 正文列 */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className={cn("text-foreground", isLog ? "text-sm" : "text-sm font-medium")}>
            {author}
          </span>
          {isLog && content != null && <span className="text-sm text-muted">{content}</span>}
          {datetime != null && <span className="text-xs text-muted">{datetime}</span>}
        </div>

        {!isLog && content != null && (
          <div className="mt-1 text-sm leading-relaxed text-foreground">{content}</div>
        )}

        {actions != null && <CommentActions className="mt-1.5">{actions}</CommentActions>}

        {children != null && (
          <div
            className={cn(
              "mt-3 space-y-4",
              connector ? "border-l border-border pl-4" : "pl-0",
            )}
          >
            {children}
          </div>
        )}
      </div>
    </article>
  );
}
