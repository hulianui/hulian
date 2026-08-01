"use client";
import { memo, useState } from "react";
import { Bot, Check, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "../lib/cn";
import { Avatar } from "../avatar";
import { Tag } from "../tag";
import { Button } from "../button";
import { Textarea } from "../textarea";
import { CodeDiff } from "../code-diff";
import { severityStyle } from "./code-review-thread.severity";
import type { CodeReviewThreadProps, ReviewComment, ReviewThreadStatus } from "./code-review-thread.types";

// 代码审查评论线程：行锚定批注卡。可塞进 CodeDiff 的 annotations.content 槽，也可独立列用。
// severity 左边色条 + AI/人类作者 + 内嵌建议修改 diff(可采纳) + 回复 + 标记已解决/误报 + 折叠。
// 复用 Avatar/Tag/Button/Textarea/CodeDiff，severity 映射纯函数可测。

function CommentRow({
  c,
  onAdoptSuggestion,
}: {
  c: ReviewComment;
  onAdoptSuggestion?: (id: string) => void;
}) {
  const sev = severityStyle(c.severity);
  return (
    <div className="flex gap-3">
      <Avatar size="sm" src={c.author.avatar} alt={c.author.name} fallback={c.author.name.slice(0, 1)} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium text-foreground">{c.author.name}</span>
          {c.author.kind === "ai" && (
            <Tag tone="brand" size="sm" icon={<Bot className="size-3" />}>
              AI
            </Tag>
          )}
          {c.severity && (
            <Tag tone={sev.tagTone} size="sm">
              {sev.label}
            </Tag>
          )}
          {c.time != null && <span className="text-xs text-muted">{c.time}</span>}
        </div>
        <div className="mt-1 text-sm text-foreground">{c.body}</div>
        {c.suggestion && (
          <div className="mt-2 space-y-1">
            <div className="text-xs text-muted">建议修改</div>
            <CodeDiff oldText={c.suggestion.oldText ?? ""} newText={c.suggestion.newText} />
            <Button
              variant="outline"
              size="sm"
              onClick={onAdoptSuggestion ? () => onAdoptSuggestion(c.id) : undefined}
            >
              <Check className="size-3.5" /> 采纳建议
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function CodeReviewThreadImpl({
  comments,
  status,
  onStatusChange,
  onReply,
  onAdoptSuggestion,
  replyable = true,
  defaultCollapsed = false,
  collapsed,
  onCollapsedChange,
  className,
}: CodeReviewThreadProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const [internalStatus, setInternalStatus] = useState<ReviewThreadStatus>("open");
  const [reply, setReply] = useState("");

  const isCollapsed = collapsed ?? internalCollapsed;
  const curStatus = status ?? internalStatus;
  const first = comments[0];
  const sev = severityStyle(first?.severity);

  const setCollapsed = (v: boolean) => {
    setInternalCollapsed(v);
    onCollapsedChange?.(v);
  };
  const changeStatus = (s: ReviewThreadStatus) => {
    setInternalStatus(s);
    onStatusChange?.(s);
  };
  const submitReply = () => {
    const text = reply.trim();
    if (!text) return;
    onReply?.(text);
    setReply("");
  };

  return (
    <div className={cn("rounded-[var(--radius)] border border-l-4 border-border bg-surface", sev.border, className)}>
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <button
          type="button"
          onClick={() => setCollapsed(!isCollapsed)}
          className="flex min-w-0 items-center gap-1 text-xs text-muted hover:text-foreground"
        >
          {isCollapsed ? <ChevronRight className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          <span className="truncate">
            {comments.length} 条批注{first?.author ? ` · ${first.author.name}` : ""}
          </span>
        </button>
        <div className="flex shrink-0 items-center gap-1.5">
          {curStatus === "resolved" && <Tag tone="success" size="sm" dot>已解决</Tag>}
          {curStatus === "wontfix" && <Tag tone="neutral" size="sm">误报</Tag>}
          {curStatus === "open" ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => changeStatus("resolved")}>
                标记已解决
              </Button>
              <Button variant="ghost" size="sm" onClick={() => changeStatus("wontfix")}>
                误报
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => changeStatus("open")}>
              重新打开
            </Button>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <div className="space-y-4 border-t border-border px-3 py-3">
          {comments.map((c) => (
            <CommentRow key={c.id} c={c} onAdoptSuggestion={onAdoptSuggestion} />
          ))}
          {replyable && (
            <div className="flex flex-col gap-2">
              <Textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="回复这条批注…"
                rows={2}
                autoResize
              />
              <div className="flex justify-end">
                <Button size="sm" onClick={submitReply}>
                  回复
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const CodeReviewThread = memo(CodeReviewThreadImpl);
CodeReviewThread.displayName = "CodeReviewThread";
