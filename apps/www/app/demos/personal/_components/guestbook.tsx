"use client";

import { useState } from "react";
import {
  Alert,
  AvatarCircles,
  Button,
  Comment,
  CommentAction,
  Empty,
  Input,
  ListSkeleton,
  Markdown,
  MarkdownEditor,
  Popconfirm,
  Rating,
  Spinner,
  Tag,
  Text,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  toast,
} from "@hulian/ui";
import { AlertCircle, RotateCw, Send, Trash2 } from "lucide-react";
import { guestbookSeed, recentVisitors, type GuestEntry } from "../_data/guestbook";
import { avatarArt } from "../_lib/art";
import { useMockData, usePending } from "../../lib/async";

// 留言骨架：铁律——chromeless，不裹 Card，直接几条骨架行（头像+两行文字 × 4）
function GuestbookSkeleton() {
  return <ListSkeleton rows={4} />;
}

// 单条留言（含嵌套回复）
function GuestItem({
  entry,
  onDelete,
}: {
  entry: GuestEntry;
  onDelete: (id: string) => void;
}) {
  const deleteAction = entry.own ? (
    <Popconfirm
      title="确定删除这条留言？"
      danger
      onConfirm={() => {
        onDelete(entry.id);
        toast({ title: "留言已删除", tone: "info" });
      }}
    >
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              aria-label="删除留言"
              className="flex size-7 items-center justify-center rounded text-muted transition-colors hover:bg-danger/10 hover:text-danger"
            >
              <Trash2 className="size-3.5" aria-hidden />
            </button>
          }
        />
        <TooltipContent>删除留言</TooltipContent>
      </Tooltip>
    </Popconfirm>
  ) : null;

  const ratingNode = (
    <Rating value={entry.rating} readOnly size="sm" color="var(--color-warning)" />
  );

  return (
    <Comment
      author={
        <span className="flex items-center gap-2">
          <span className="font-medium">{entry.author}</span>
          {ratingNode}
          {entry.own && (
            <Tag tone="brand" size="sm">
              我
            </Tag>
          )}
        </span>
      }
      avatar={{ src: avatarArt(entry.author, entry.hue) }}
      datetime={entry.createdAt}
      content={<Markdown>{entry.content}</Markdown>}
      actions={
        deleteAction ? (
          <CommentAction>{deleteAction}</CommentAction>
        ) : undefined
      }
      connector={Boolean(entry.replies?.length)}
    >
      {entry.replies?.map((reply) => (
        <Comment
          key={reply.id}
          author={
            <span className="flex items-center gap-2">
              <span className="font-medium">{reply.author}</span>
              {reply.byOwner && (
                <Tag tone="success" size="sm">
                  作者
                </Tag>
              )}
            </span>
          }
          avatar={{ src: avatarArt(reply.author, reply.hue) }}
          datetime={reply.createdAt}
          content={<Markdown>{reply.content}</Markdown>}
        />
      ))}
    </Comment>
  );
}

export function GuestbookClient() {
  // 加载态：首次 failOnce=true，演示失败+重试完整链路
  const { data: rawData, loading, error, reload } = useMockData(guestbookSeed, {
    delay: 600,
    failOnce: true,
  });

  // 本地列表状态（成功加载后从 rawData 初始化；optimistic insert/delete 直接操作此态）
  const [entries, setEntries] = useState<GuestEntry[] | null>(null);

  // rawData 就绪时同步一次（避免每次 rawData 变化都重置用户操作）
  if (rawData !== null && entries === null) {
    setEntries(rawData);
  }

  // 表单状态
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState<number | null>(5);
  const [content, setContent] = useState("");

  const [pending, run] = usePending();

  // 发布留言
  function handleSubmit() {
    const trimmedAuthor = authorName.trim();
    const trimmedContent = content.trim();
    if (!trimmedAuthor || !trimmedContent) {
      toast({ title: "昵称和内容不能为空", tone: "danger" });
      return;
    }
    void run(async () => {
      const hue = Math.floor(Math.random() * 360);
      const newEntry: GuestEntry = {
        id: `guest-${Date.now()}`,
        author: trimmedAuthor,
        hue,
        rating: rating ?? 5,
        content: trimmedContent,
        createdAt: "刚刚",
        own: true,
      };
      setEntries((prev) => (prev ? [newEntry, ...prev] : [newEntry]));
      setAuthorName("");
      setRating(5);
      setContent("");
      toast({ title: "留言已发布 🎉", tone: "info" });
    });
  }

  // 删除自己的留言
  function handleDelete(id: string) {
    setEntries((prev) => (prev ? prev.filter((e) => e.id !== id) : prev));
  }

  // 访客头像
  const avatarItems = recentVisitors.map((v) => ({
    src: avatarArt(v.name, v.hue),
    alt: v.name,
  }));

  return (
    <div className="mx-auto w-full max-w-2xl space-y-10 px-4 py-12">
      {/* 顶部标题区 */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">留言板</h1>
          <Text tone="muted" className="mt-2">
            留下你的想法、建议或问候，我看到了都会回复。
          </Text>
        </div>
        <div className="flex items-center gap-3">
          <AvatarCircles avatars={avatarItems.slice(0, 6)} extraCount={recentVisitors.length - 6} />
          <Text size="sm" tone="muted">
            {recentVisitors.length} 位访客到过这里
          </Text>
        </div>
      </div>

      {/* 写留言表单 */}
      <div className="space-y-4 rounded-[var(--radius)] border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-base font-semibold text-foreground">写留言</h2>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            昵称 <span className="text-danger" aria-hidden>*</span>
          </label>
          <Input
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="你的名字"
            disabled={pending}
            aria-required
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">评分</label>
          <Rating
            value={rating ?? 0}
            onValueChange={(v) => setRating(v)}
            size="lg"
            color="var(--color-warning)"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">内容</label>
          <MarkdownEditor
            value={content}
            onChange={(md) => setContent(md)}
            placeholder="支持 Markdown…"
            minRows={4}
            disabled={pending}
          />
        </div>
        <Button
          onClick={handleSubmit}
          disabled={pending}
          className="gap-2"
        >
          {pending ? (
            <>
              <Spinner size="sm" />
              发布中…
            </>
          ) : (
            <>
              <Send className="size-4" aria-hidden />
              发布留言
            </>
          )}
        </Button>
      </div>

      {/* 留言列表区 */}
      <div className="space-y-2">
        <h2 className="text-base font-semibold text-foreground">
          留言 {entries ? `（${entries.length}）` : ""}
        </h2>

        {/* 加载骨架 */}
        {loading && <GuestbookSkeleton />}

        {/* 失败态 */}
        {!loading && error && (
          <Alert
            tone="danger"
            icon={<AlertCircle className="size-4" aria-hidden />}
            title="加载失败"
            action={
              <Button size="sm" variant="outline" onClick={reload} className="gap-1.5">
                <RotateCw className="size-3.5" aria-hidden />
                重试
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* 空态 */}
        {!loading && !error && entries !== null && entries.length === 0 && (
          <Empty description="还没有留言，来抢沙发" />
        )}

        {/* 留言列表 */}
        {!loading && !error && entries !== null && entries.length > 0 && (
          <div className="space-y-6 pt-2">
            {entries.map((entry) => (
              <GuestItem key={entry.id} entry={entry} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
