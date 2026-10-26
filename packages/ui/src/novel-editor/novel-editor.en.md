---
slug: novel-editor
name: NovelEditor
category: forms
group: advanced
tags: []
exports: [NovelEditor]
status: enriched
---

# NovelEditor

> Chapter outline, Markdown body, and preview on one screen. · forms/advanced

## When to Use

Write serial fiction: manage chapters on the left (create, rename, delete, drag to reorder), edit Markdown on the right, and keep a preview open. Read the result with [NovelReader](../novel-reader/novel-reader.md).

## Import
```ts
import { NovelEditor } from "@hulianui/ui"
```

## Props

Inherits `HTMLAttributes<HTMLDivElement>` except `onChange`. The root needs a height, such as `h-dvh`.

| Name | Type | Default | Description |
|------|------|------|------|
| chapters | `NovelChapter[]` | — | Controlled chapters, paired with `onChaptersChange` |
| defaultChapters | `NovelChapter[]` | `[]` | Uncontrolled initial chapters |
| onChaptersChange | `(chapters: NovelChapter[]) => void` | — | Called when chapters or body text change |
| activeChapterId | `string` | — | Controlled chapter being edited |
| defaultActiveChapterId | `string` | First chapter | Uncontrolled initial chapter |
| onActiveChapterChange | `(id: string) => void` | — | Called when the edited chapter changes |
| onSave | `(chapters: NovelChapter[]) => void` | — | Shows a save button when provided |
| disabled | `boolean` | `false` | Disables editing, reordering, and deletion |

Above 40 chapters the sidebar switches to a virtual list with move buttons, instead of combining drag-and-drop with virtualization.

## Examples
```tsx
<NovelEditor
  className="h-dvh"
  defaultChapters={chapters}
  onSave={(next) => save(next)}
/>
```

## Pitfalls

- Without a height on the root, the chapter list and the editor grow the page, and the preview cannot scroll on its own.
- In controlled mode, ignoring `onChaptersChange` makes typing look broken.
- Delete removes the chapter immediately after the built-in confirm. Do not add another modal over the manuscript.

## Related
[NovelReader](../novel-reader/novel-reader.md) · [MarkdownEditor](../markdown-editor/markdown-editor.md) · [Sortable](../sortable/sortable.md) · [Popconfirm](../popconfirm/popconfirm.md)
