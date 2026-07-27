"use client";
import { useState } from "react";
import {
  Mentions,
  Comment,
  CommentAction,
  Button,
  Avatar,
  Empty,
  toast,
  type MentionOption,
} from "@hulianui/ui";
import { ThumbsUp, MessageSquare } from "lucide-react";
import type { Course, Discussion } from "../_data/types";
import { discussionsOf } from "../_data/courses";
import { usePending } from "../../lib/async";

export function DiscussionTab({ course }: { course: Course }) {
  const [list, setList] = useState<Discussion[]>(() => discussionsOf(course.id));
  const [draft, setDraft] = useState("");
  const [liked, setLiked] = useState<string[]>([]);
  const [pending, run] = usePending();

  const mentionOptions: MentionOption[] = [
    { value: course.instructor.name, label: course.instructor.name, description: "讲师" },
    { value: "助教-小研", label: "助教-小研", description: "课程助教" },
    { value: "夏小满", label: "夏小满", description: "同学" },
    { value: "陈起", label: "陈起", description: "同学" },
  ];

  const publish = () => {
    if (!draft.trim()) {
      toast({ title: "说点什么再发布吧", tone: "danger" });
      return;
    }
    void run(() => {
      setList((prev) => [
        {
          id: `new-${prev.length}-${draft.length}`,
          author: "我",
          role: "学员",
          datetime: "刚刚",
          content: draft,
          likes: 0,
        },
        ...prev,
      ]);
      setDraft("");
      toast({ title: "已发布讨论", tone: "success" });
    });
  };

  const toggleLike = (id: string) =>
    setLiked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const renderComment = (d: Discussion) => (
    <Comment
      key={d.id}
      author={
        <span className="flex items-center gap-1.5">
          {d.author}
          {d.role === "讲师" && (
            <span className="rounded bg-primary/12 px-1.5 py-0.5 text-[11px] font-medium text-primary">讲师</span>
          )}
        </span>
      }
      avatar={{ fallback: d.author.slice(0, 1) }}
      datetime={d.datetime}
      content={<p className="text-sm text-foreground">{d.content}</p>}
      connector
      actions={
        <>
          <CommentAction
            onClick={() => toggleLike(d.id)}
            className={liked.includes(d.id) ? "text-primary" : ""}
          >
            <ThumbsUp className="mr-1 inline size-3" />
            {liked.includes(d.id) ? d.likes + 1 : d.likes}
          </CommentAction>
          <CommentAction onClick={() => toast({ title: "回复功能为演示占位", tone: "neutral" })}>
            回复
          </CommentAction>
        </>
      }
    >
      {d.replies?.map(renderComment)}
    </Comment>
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <Avatar fallback="我" />
        <div className="flex-1">
          <Mentions
            value={draft}
            onChange={setDraft}
            options={mentionOptions}
            placeholder="参与讨论，输入 @ 提及讲师或同学…"
            aria-label="发布讨论"
          />
          <div className="mt-2 flex justify-end">
            <Button onClick={publish} loading={pending} size="sm">
              <MessageSquare className="mr-1.5 size-4" aria-hidden />
              发布
            </Button>
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <Empty size="sm" title="还没有讨论" description="来做第一个提问的人吧" />
      ) : (
        <div className="space-y-1">{list.map(renderComment)}</div>
      )}
    </div>
  );
}
