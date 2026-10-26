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

> 章节大纲、Markdown 正文和预览放在同一屏 · forms/advanced

## 何时用

写网文或连载文稿：左侧管理章节（新建、改名、删除、拖动排序），右侧用 Markdown 编辑正文，并可以同时看预览。阅读端用 [NovelReader](../novel-reader/novel-reader.md)。

## 导入
```ts
import { NovelEditor } from "@hulianui/ui"
```

## Props

继承 `HTMLAttributes<HTMLDivElement>`（不含 `onChange`）。根节点需要高度，例如 `h-dvh`。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| chapters | `NovelChapter[]` | — | 受控章节。和 `onChaptersChange` 一起用 |
| defaultChapters | `NovelChapter[]` | `[]` | 非受控初始章节 |
| onChaptersChange | `(chapters: NovelChapter[]) => void` | — | 章节或正文变化 |
| activeChapterId | `string` | — | 受控正在编辑的章 |
| defaultActiveChapterId | `string` | 第一章 | 非受控初始章 |
| onActiveChapterChange | `(id: string) => void` | — | 切换正在编辑的章 |
| onSave | `(chapters: NovelChapter[]) => void` | — | 传入后显示保存按钮 |
| disabled | `boolean` | `false` | 禁止编辑、排序和删除 |

章节超过 40 时，左侧改为虚拟列表加上下移动，避免和拖拽虚拟化叠在一起。

## 示例
```tsx
<NovelEditor
  className="h-dvh"
  defaultChapters={chapters}
  onSave={(next) => save(next)}
/>
```

## 禁忌 / 坑

- 根节点不带高度时，章节栏和编辑区会把页面撑长，预览也无法自己滚动。
- `chapters` 受控时，忽略 `onChaptersChange` 会让输入看起来无效。
- 删除会立刻从列表里拿掉该章。需要确认时用组件自带的 Popconfirm，不要再套一层会挡住正文的全局弹窗。

## 相关
[NovelReader](../novel-reader/novel-reader.md) · [MarkdownEditor](../markdown-editor/markdown-editor.md) · [Sortable](../sortable/sortable.md) · [Popconfirm](../popconfirm/popconfirm.md)
