"use client";
import { useState } from "react";
import {
  MarkdownEditor,
  Markdown,
  Button,
  Popconfirm,
  Empty,
  Tag,
  toast,
} from "@hulian/ui";
import { Trash2, NotebookPen } from "lucide-react";
import type { Course, Lesson } from "../_data/types";
import { useLearn } from "../_lib/learn-store";
import { allLessons } from "../_data/courses";
import { usePending } from "../../lib/async";

export function NotesTab({ course, currentLesson }: { course: Course; currentLesson: Lesson }) {
  const { notes, addNote, deleteNote } = useLearn();
  const [draft, setDraft] = useState("");
  const [pending, run] = usePending();

  // 只显示本课程相关的笔记。
  const lessonIds = new Set(allLessons(course).map((l) => l.id));
  const courseNotes = notes.filter((n) => lessonIds.has(n.lessonId));

  const save = () => {
    if (!draft.trim()) {
      toast({ title: "笔记内容不能为空", tone: "danger" });
      return;
    }
    void run(() => {
      addNote({ lessonId: currentLesson.id, lessonTitle: currentLesson.title, body: draft });
      setDraft("");
      toast({ title: "笔记已保存", description: currentLesson.title, tone: "info" });
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm text-muted">
          <NotebookPen className="size-4" aria-hidden />
          正在记录 · <span className="font-medium text-foreground">{currentLesson.title}</span>
        </div>
        <MarkdownEditor
          value={draft}
          onChange={setDraft}
          placeholder="记录这一节的要点，支持 Markdown…"
          minRows={4}
          aria-label="笔记编辑器"
        />
        <div className="mt-3 flex justify-end">
          <Button onClick={save} loading={pending}>
            保存笔记
          </Button>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">我的笔记（{courseNotes.length}）</h3>
        {courseNotes.length === 0 ? (
          <Empty size="sm" title="还没有笔记" description="边看边记，知识才留得住" />
        ) : (
          <ul className="space-y-3">
            {courseNotes.map((n) => (
              <li key={n.id} className="rounded-[var(--radius)] border border-border bg-surface p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Tag tone="neutral" variant="soft" size="sm">
                    {n.lessonTitle}
                  </Tag>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">{n.createdAt}</span>
                    <Popconfirm
                      title="删除这条笔记？"
                      description="删除后无法恢复。"
                      danger
                      onConfirm={() => {
                        deleteNote(n.id);
                        toast({ title: "笔记已删除", tone: "info" });
                      }}
                    >
                      <Button variant="ghost" size="sm" tone="danger" aria-label="删除笔记">
                        <Trash2 className="size-4" />
                      </Button>
                    </Popconfirm>
                  </div>
                </div>
                <div className="text-sm">
                  <Markdown>{n.body}</Markdown>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
