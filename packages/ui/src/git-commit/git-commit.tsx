import { cn } from "../lib/cn";
import { resolveTone } from "../lib/tone";
import { GitBranch, GitCommit as GitCommitIcon } from "../_icons";
import { branchTone } from "./branch-tone";
import type { GitCommitProps } from "./git-commit.types";

// GitCommit = git 提交引用原语：分支 chip + 短哈希(等宽) + 提交信息 + 作者。
// 部署列表 / PR 列表 / 活动流的「Source」列刚需——把散落在各处手搓的
// 「branch · sha · message」组合收成一个语义件。纯皮肤零依赖，吃主题 token。

/** 纯函数：把任意长度 SHA 截成短哈希（可单测）。 */
export function shortSha(sha: string, length = 7): string {
  return sha.trim().slice(0, Math.max(1, length));
}

export function GitCommit({
  sha,
  message,
  branch,
  author,
  avatar,
  href,
  shaLength = 7,
  colorBranch = true,
  layout = "inline",
  size = "md",
  className,
}: GitCommitProps) {
  const iconSize = size === "sm" ? "size-3.5" : "size-4";
  const text = size === "sm" ? "text-xs" : "text-sm";
  const short = shortSha(sha, shaLength);

  // 分支着色：按类型/名称稳定取色，渲染成 soft badge（彩色文字 + 同色 12% 底）。
  const branchColor =
    branch != null && colorBranch ? resolveTone(branchTone(branch)) : undefined;

  const branchChip =
    branch != null &&
    (branchColor ? (
      <span
        className="inline-flex min-w-0 items-center gap-1 rounded-[var(--radius-sm)] px-1.5 py-0.5 font-medium leading-none"
        style={{
          color: branchColor,
          // 12% 同色底（color-mix 让任意 chart token 也能得到柔和填充）。
          backgroundColor: `color-mix(in oklab, ${branchColor} 12%, transparent)`,
        }}
        title={branch}
      >
        <GitBranch className={cn(iconSize, "shrink-0")} />
        <span className="truncate">{branch}</span>
      </span>
    ) : (
      <span className="inline-flex min-w-0 items-center gap-1 text-muted">
        <GitBranch className={cn(iconSize, "shrink-0")} />
        <span className="truncate font-medium text-foreground">{branch}</span>
      </span>
    ));

  const shaNode = (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono font-semibold tabular-nums text-foreground",
        href && "rounded-[var(--radius-sm)] transition-colors hover:text-primary hover:underline",
      )}
    >
      <GitCommitIcon className={cn(iconSize, "shrink-0 text-muted")} />
      {short}
    </span>
  );

  const shaEl = href ? (
    <a href={href} className="min-w-0">
      {shaNode}
    </a>
  ) : (
    shaNode
  );

  const authorNode = (author != null || avatar != null) && (
    <span className="inline-flex shrink-0 items-center gap-1.5 text-muted">
      {avatar}
      {author != null && <span className="truncate">{author}</span>}
    </span>
  );

  if (layout === "stacked") {
    return (
      <span className={cn("flex min-w-0 flex-col gap-0.5", text, className)}>
        {message != null && (
          <span className="truncate font-medium text-foreground" title={typeof message === "string" ? message : undefined}>
            {message}
          </span>
        )}
        <span className="flex min-w-0 items-center gap-2 text-muted">
          {branchChip}
          {branch != null && <span className="text-border">·</span>}
          {shaEl}
          {authorNode != null && <span className="text-border">·</span>}
          {authorNode}
        </span>
      </span>
    );
  }

  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2", text, className)}>
      {branchChip}
      {shaEl}
      {message != null && (
        <span className="truncate text-muted" title={typeof message === "string" ? message : undefined}>
          {message}
        </span>
      )}
      {authorNode}
    </span>
  );
}
