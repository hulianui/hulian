"use client";
import { copy } from "./notes-tab.content";
import { useState } from "react";
import { MarkdownEditor, Markdown, Button, Popconfirm, Empty, Tag, toast } from "@hulianui/ui";
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
      toast({ title: copy("noteContentCannotBeEmpty"), tone: "danger" });
      return;
    }
    void run(() => {
      addNote({ lessonId: currentLesson.id, lessonTitle: currentLesson.title, body: draft });
      setDraft("");
      toast({ title: copy("notesSaved"), description: currentLesson.title, tone: "success" });
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm text-muted">
          <NotebookPen className="size-4" aria-hidden />
          {copy("recording")}{" "}
          <span className="font-medium text-foreground">{currentLesson.title}</span>
        </div>
        <MarkdownEditor
          value={draft}
          onChange={setDraft}
          placeholder={copy("documentTheMainPointsOfThisSectionToSupportMarkdown")}
          minRows={4}
          aria-label={copy("notesEditor")}
        />
        <div className="mt-3 flex justify-end">
          <Button onClick={save} loading={pending}>
            {copy("saveNotes")}
          </Button>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          {copy("myNotesCount", courseNotes.length)}
        </h3>
        {courseNotes.length === 0 ? (
          <Empty
            size="sm"
            title={copy("noNotesYet")}
            description={copy("knowledgeCanOnlyBeRetainedByLookingAtNotes")}
          />
        ) : (
          <ul className="space-y-3">
            {courseNotes.map((n) => (
              <li
                key={n.id}
                className="rounded-[var(--radius)] border border-border bg-surface p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Tag tone="neutral" variant="soft" size="sm">
                    {n.lessonTitle}
                  </Tag>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">{n.createdAt}</span>
                    <Popconfirm
                      title={copy("deleteThisNote")}
                      description={copy("deletionCannotBeUndone")}
                      danger
                      onConfirm={() => {
                        deleteNote(n.id);
                        toast({ title: copy("noteDeleted"), tone: "info" });
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        tone="danger"
                        aria-label={copy("deleteNote")}
                      >
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
