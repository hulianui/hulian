import { cn } from "../lib/cn";
import { GitBranch, GitCommit as GitCommitIcon } from "../_icons";
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
  layout = "inline",
  size = "md",
  className,
}: GitCommitProps) {
  const iconSize = size === "sm" ? "size-3.5" : "size-4";
  const text = size === "sm" ? "text-xs" : "text-sm";
  const short = shortSha(sha, shaLength);

  const branchChip = branch != null && (
    <span className="inline-flex min-w-0 items-center gap-1 text-muted-foreground">
      <GitBranch className={cn(iconSize, "shrink-0")} />
      <span className="truncate font-medium text-foreground">{branch}</span>
    </span>
  );

  const shaNode = (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono font-semibold tabular-nums text-foreground",
        href && "rounded-[var(--radius-sm)] transition-colors hover:text-primary hover:underline",
      )}
    >
      <GitCommitIcon className={cn(iconSize, "shrink-0 text-muted-foreground")} />
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
    <span className="inline-flex shrink-0 items-center gap-1.5 text-muted-foreground">
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
        <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
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
        <span className="truncate text-muted-foreground" title={typeof message === "string" ? message : undefined}>
          {message}
        </span>
      )}
      {authorNode}
    </span>
  );
}
