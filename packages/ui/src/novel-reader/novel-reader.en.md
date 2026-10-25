---
slug: novel-reader
name: NovelReader
category: data-display
group: collection
tags: []
exports: [NovelReader]
status: enriched
---

# NovelReader

> Long-form reader. Chrome stays hidden, and progress is a chapter plus a character offset. · data-display/collection

## When to Use

Use it for fiction, columns, and manuscripts that should open on the prose. Page turn, type size, line height, measure, and paper live in one settings sheet. The catalog and settings are bottom drawers, not a permanent rail beside the text.

Edit chapters with [NovelEditor](../novel-editor/novel-editor.md). Render Markdown with [Markdown](../markdown/markdown.md).

## Import
```ts
import { NovelReader } from "@hulianui/ui"
```

## Props

Inherits `HTMLAttributes<HTMLDivElement>` except the native `title`. The root needs a height, such as `h-dvh` or `h-[28rem]`.

| Name | Type | Default | Description |
|------|------|------|------|
| title | `string` | — | Book title, shown once above the chapter and again in the summoned top bar |
| author | `ReactNode` | — | Author |
| chapters | `NovelChapter[]` | — | Chapters. `content` is Markdown |
| chapterId | `string` | — | Controlled current chapter |
| defaultChapterId | `string` | First chapter | Uncontrolled initial chapter. Stored progress wins |
| onChapterChange | `(id: string) => void` | — | Called when the chapter changes |
| turn | `"scroll" \| "cover" \| "simulation"` | — | Controlled page turn: scroll, cover, or simulation. All three share one forward and back |
| defaultTurn | `"scroll" \| "cover" \| "simulation"` | `"scroll"` | Uncontrolled page turn. Scroll is the default |
| onTurnChange | `(turn: NovelTurn) => void` | — | Called when the page turn changes |
| mode | `"scroll" \| "paginated"` | — | Legacy alias. `paginated` means cover and `scroll` means scroll. `turn` wins when both are set |
| fontSize | `"sm" \| "md" \| "lg" \| "xl"` | — | Controlled type size, mapped to `text-sm` through `text-xl` |
| defaultFontSize | `"sm" \| "md" \| "lg" \| "xl"` | `"md"` | Uncontrolled type size |
| onFontSizeChange | `(size: NovelFontSize) => void` | — | Called when the type size changes |
| lineHeight | `"snug" \| "normal" \| "relaxed" \| "loose"` | — | Controlled line height |
| defaultLineHeight | `"snug" \| "normal" \| "relaxed" \| "loose"` | `"relaxed"` | Uncontrolled line height |
| onLineHeightChange | `(lineHeight: NovelLineHeight) => void` | — | Called when the line height changes |
| measure | `"narrow" \| "normal" \| "wide"` | — | Controlled measure: `max-w-xl`, `max-w-2xl`, or `max-w-3xl` |
| defaultMeasure | `"narrow" \| "normal" \| "wide"` | `"normal"` | Uncontrolled measure |
| onMeasureChange | `(measure: NovelMeasure) => void` | — | Called when the measure changes |
| paper | `"default" \| "day" \| "eye" \| "night" \| "oled"` | — | Controlled paper. It wraps the article only; chrome follows the system theme |
| defaultPaper | `"default" \| "day" \| "eye" \| "night" \| "oled"` | `"default"` | Uncontrolled paper |
| onPaperChange | `(paper: NovelPaper) => void` | — | Called when the paper changes |
| persistKey | `string` | — | Stores `{ chapterId, charOffset }` in `localStorage`. Page index is not stored |
| onProgressChange | `(progress: NovelProgress) => void` | — | Progress callback. Progress is only a chapter id and a character offset |
| leading | `ReactNode` | — | Top-left slot inside the summoned bar, for back and shelf |
| trailing | `ReactNode` | — | Top-right slot inside the summoned bar |

### NovelChapter

| Name | Type | Default | Description |
|------|------|------|------|
| id | `string` | — | Stable chapter id |
| title | `string` | — | Chapter title, without a "Chapter N" prefix |
| content | `string` | — | Markdown body |
| wordCount | `number` | Estimated from non-space characters | Display count |

### NovelProgress

| Name | Type | Default | Description |
|------|------|------|------|
| chapterId | `string` | — | Current chapter |
| charOffset | `number` | — | Offset into the rendered text of the chapter |

## Examples
```tsx
<NovelReader
  className="h-dvh"
  title="The Ferry Light"
  author="Shen Wan"
  chapters={chapters}
  persistKey="ferry-light"
/>
```

Edge taps, swipes, the wheel, and arrow keys share one forward and back. The center only summons the menu. That menu changes simulation, cover, and scroll, plus type size, line height, measure, and paper. Type size, line height, and paper use type tokens. While the menu is hidden, the bottom edge keeps a book bar, a chapter bar, and the in-chapter percent, with no buttons. The summoned footer labels both bars. Closing the catalog or settings returns focus to the prose and keeps the character offset.

The chapter start has a previous-chapter button, except the first chapter, which opens on the prose. The chapter end is a card. When another chapter follows, next chapter sits on that card. Both controls are in the text flow and stay when the menu is hidden. They are not a page-level top or bottom bar. Arrow keys still turn the view. Alt plus an arrow, or `[` and `]`, still change the chapter.

## Pitfalls

- The root has no height of its own. Without `h-dvh` or `h-[28rem]`, the scroller and the page viewport cannot be measured.
- Progress is `(chapterId, charOffset)`, not a page index. Changing type size, line height, or measure changes the page count and would miss the sentence.
- Do not wrap the reader in another sticky app bar. The menu is out of flow until summoned.
- Night paper is not system dark and not pure black. `night` uses dark `bg-surface`; `oled` uses dark `bg-bg`. Use tokens.
- The reader has no annotation or chapter-comment layer. Do not cover it with a splash, an app install prompt, a promotion, or a task modal.
- The center hotspot only toggles the menu. Put back and shelf in `leading` or `trailing`.
- Catalog and settings are bottom drawers. Do not pin a gear to the left edge.
- Chapter buttons say previous chapter and next chapter. Do not reuse Pagination, whose labels mean previous page and next page.
- Do not pin a page-level header or footer for previous and next chapter. Previous chapter stays at the chapter start. Next chapter stays at the chapter end, in the text flow, including while the menu is hidden. Chapter controls in the top bar may hide with the menu.

## Related
[NovelEditor](../novel-editor/novel-editor.md) · [Markdown](../markdown/markdown.md) · [Drawer](../drawer/drawer.md) · [Empty](../empty/empty.md)
