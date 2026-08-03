import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    noteContentCannotBeEmpty: "笔记内容不能为空",
    notesSaved: "笔记已保存",
    recording: "正在记录 ·",
    documentTheMainPointsOfThisSectionToSupportMarkdown: "记录这一节的要点，支持 Markdown…",
    notesEditor: "笔记编辑器",
    saveNotes: "保存笔记",
    myNotesCount: "我的笔记（{0}）",
    noNotesYet: "还没有笔记",
    knowledgeCanOnlyBeRetainedByLookingAtNotes: "边看边记，知识才留得住",
    deleteThisNote: "删除这条笔记？",
    deletionCannotBeUndone: "删除后无法恢复。",
    noteDeleted: "笔记已删除",
    deleteNote: "删除笔记",
  },
  en: {
    noteContentCannotBeEmpty: "Note content cannot be empty",
    notesSaved: "Notes saved",
    recording: "Recording ·",
    documentTheMainPointsOfThisSectionToSupportMarkdown:
      "Capture the key points from this lesson. Markdown is supported.",
    notesEditor: "Notes editor",
    saveNotes: "Save notes",
    myNotesCount: "My notes ({0})",
    noNotesYet: "No notes yet",
    knowledgeCanOnlyBeRetainedByLookingAtNotes: "Review your notes to reinforce what you learned.",
    deleteThisNote: "Delete this note?",
    deletionCannotBeUndone: "Deletion cannot be undone.",
    noteDeleted: "Note deleted",
    deleteNote: "Delete note",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>(
    (text, value, index) => text.replaceAll(`{${index}}`, String(value)),
    content[DOCS_LOCALE][key],
  );
}

const dictionary: Dictionary = {
  key: "demo-learn-components-notes-tab",
  content: t(content),
};

export default dictionary;
