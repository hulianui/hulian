"use client";
import { copy } from "./discussion-tab.content";
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
    {
      value: course.instructor.name,
      label: course.instructor.name,
      description: copy("instructor"),
    },
    {
      value: "助教-小研",
      label: copy("assistantTeacherXiaoyan"),
      description: copy("courseAssistant"),
    },
    { value: "夏小满", label: copy("xiaXiaoman"), description: copy("classmates") },
    { value: "陈起", label: copy("chenQi"), description: copy("classmates") },
  ];

  const publish = () => {
    if (!draft.trim()) {
      toast({ title: copy("saySomethingBeforeYouPublish"), tone: "danger" });
      return;
    }
    void run(() => {
      setList((prev) => [
        {
          id: `new-${prev.length}-${draft.length}`,
          author: copy("me"),
          role: copy("learners"),
          datetime: copy("justNow"),
          content: draft,
          likes: 0,
        },
        ...prev,
      ]);
      setDraft("");
      toast({ title: copy("discussionPublished"), tone: "success" });
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
          {d.role === copy("instructor") && (
            <span className="rounded bg-primary/12 px-1.5 py-0.5 text-[11px] font-medium text-primary">
              {copy("instructor")}
            </span>
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
          <CommentAction
            onClick={() =>
              toast({ title: copy("theReplyFunctionIsThePlaceholderOfTheDemo"), tone: "neutral" })
            }
          >
            {copy("reply")}
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
        <Avatar fallback={copy("me")} />
        <div className="flex-1">
          <Mentions
            value={draft}
            onChange={setDraft}
            options={mentionOptions}
            placeholder={copy("joinTheDiscussionTypeMentionAnInstructorOrClassmate")}
            aria-label={copy("postDiscussion")}
          />
          <div className="mt-2 flex justify-end">
            <Button onClick={publish} loading={pending} size="sm">
              <MessageSquare className="mr-1.5 size-4" aria-hidden />
              {copy("publish")}
            </Button>
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <Empty
          size="sm"
          title={copy("noDiscussionsYet")}
          description={copy("beTheFirstToAskAQuestion")}
        />
      ) : (
        <div className="space-y-1">{list.map(renderComment)}</div>
      )}
    </div>
  );
}
