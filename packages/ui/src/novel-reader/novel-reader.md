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

> 长文阅读器：菜单默认收起，进度按章节和字符偏移记住 · data-display/collection

## 何时用

网文、专栏、文稿这类「打开就要读」的正文。翻页、字号、行距、栏宽和纸色收在同一套阅读设置里；目录和设置走底部抽屉，不在左侧常驻一块挡字的面板。

正文编辑用 [NovelEditor](../novel-editor/novel-editor.md)。渲染 Markdown 用 [Markdown](../markdown/markdown.md)。

## 导入
```ts
import { NovelReader } from "@hulianui/ui"
```

## Props

继承 `HTMLAttributes<HTMLDivElement>`（不含原生 `title`）。根节点必须有高度，例如 `h-dvh` 或 `h-[28rem]`。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| title | `string` | — | 书名。写在正文开头，并在唤出的顶栏里重复 |
| author | `ReactNode` | — | 作者 |
| chapters | `NovelChapter[]` | — | 章节。`content` 是 Markdown |
| chapterId | `string` | — | 受控当前章 |
| defaultChapterId | `string` | 第一章 | 非受控初始章。本地进度优先于它 |
| onChapterChange | `(id: string) => void` | — | 切章回调 |
| turn | `"scroll" \| "cover" \| "simulation"` | — | 受控翻页：滚动 / 覆盖 / 仿真。三者共用一套向前、向后 |
| defaultTurn | `"scroll" \| "cover" \| "simulation"` | `"scroll"` | 非受控翻页。默认滚动连读 |
| onTurnChange | `(turn: NovelTurn) => void` | — | 翻页方式变化 |
| mode | `"scroll" \| "paginated"` | — | 旧入口。`paginated` 视为覆盖，`scroll` 视为滚动。与 `turn` 同时传时以 `turn` 为准 |
| fontSize | `"sm" \| "md" \| "lg" \| "xl"` | — | 受控字号，对应 `text-sm` 到 `text-xl` |
| defaultFontSize | `"sm" \| "md" \| "lg" \| "xl"` | `"md"` | 非受控字号 |
| onFontSizeChange | `(size: NovelFontSize) => void` | — | 字号变化 |
| lineHeight | `"snug" \| "normal" \| "relaxed" \| "loose"` | — | 受控行距 |
| defaultLineHeight | `"snug" \| "normal" \| "relaxed" \| "loose"` | `"relaxed"` | 非受控行距 |
| onLineHeightChange | `(lineHeight: NovelLineHeight) => void` | — | 行距变化 |
| measure | `"narrow" \| "normal" \| "wide"` | — | 受控栏宽，对应 `max-w-xl` / `2xl` / `3xl` |
| defaultMeasure | `"narrow" \| "normal" \| "wide"` | `"normal"` | 非受控栏宽 |
| onMeasureChange | `(measure: NovelMeasure) => void` | — | 栏宽变化 |
| paper | `"default" \| "day" \| "eye" \| "night" \| "oled"` | — | 受控纸色。只包住正文，菜单仍跟系统主题 |
| defaultPaper | `"default" \| "day" \| "eye" \| "night" \| "oled"` | `"default"` | 非受控纸色 |
| onPaperChange | `(paper: NovelPaper) => void` | — | 纸色变化 |
| persistKey | `string` | — | 把 `{ chapterId, charOffset }` 写入 `localStorage`。不记页码 |
| onProgressChange | `(progress: NovelProgress) => void` | — | 进度变化。进度只有章节和字符偏移 |
| leading | `ReactNode` | — | 唤出菜单后放在顶栏左上角，例如返回和书架 |
| trailing | `ReactNode` | — | 唤出菜单后放在顶栏右侧 |

### NovelChapter

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| id | `string` | — | 稳定章节 id |
| title | `string` | — | 章名，不含「第 N 章」前缀 |
| content | `string` | — | Markdown 正文 |
| wordCount | `number` | 按去空白字符数估算 | 展示用字数 |

### NovelProgress

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| chapterId | `string` | — | 当前章 |
| charOffset | `number` | — | 相对本章已渲染正文的字符偏移 |

## 示例
```tsx
<NovelReader
  className="h-dvh"
  title="渡口的灯"
  author="沈晚"
  chapters={chapters}
  persistKey="ferry-light"
/>
```

点正文左右边缘、滑动、滚轮、方向键是同一套向前 / 向后。点正中只唤出菜单。菜单里可以改仿真、覆盖、滚动，以及字号、行距、栏宽和纸色。字号、行距和纸色都用排版 token。未唤出菜单时，底部只留全书章条、本章章条和章内百分比，不放按钮。唤出后的底栏再用文字标出全书和本章。关掉目录或设置后，焦点回到正文，字符偏移不变。

章首有一枚轻量「上一章」，第一章不放，正文直接开始。章末是一张章尾卡片，有下一章时「下一章」就在卡片上，最后一章不放。这两处在正文流里，菜单收起时也在，不做成整页顶栏或底栏。唤出菜单后，顶栏和底栏里的上一章、下一章跟着菜单一起藏。键盘仍可用：方向键翻页，Alt + 方向键或 `[` `]` 切章。

## 禁忌 / 坑

- 根节点不带高度。不写 `h-dvh` 或 `h-[28rem]` 时，滚动区和翻页视口都量不到。
- 进度是 `(chapterId, charOffset)`，不是页码。字号、行距、栏宽一变，页数会变，页码会对不上原来那一句。
- 不要在外面再套一条吸顶顶栏。菜单默认不占位，自己再加一条就会把正文顶下去。
- 夜间纸色不是系统 Dark，也不是纯黑。`night` 用暗色 `bg-surface` 和更软的 `text-muted-foreground`，chrome 仍跟页面 token。`oled` 才用暗色 `bg-bg`。颜色走 token，不要写死色值。
- 组件不提供批注或本章说。不要在阅读器打开时叠开屏、下载、促销或任务弹层。
- 正中热区只负责唤出或收起菜单。返回、书架放在 `leading` / `trailing`，不要放在正文正中。
- 目录和阅读设置是底部抽屉。不要在左侧做一枚常驻齿轮。
- 章内的「上一章 / 下一章」用按钮文案，不要拿 Pagination 的「上一页 / 下一页」来切章。
- 不要做整页常驻的顶栏和底栏来放上一章、下一章。上一章只留在章首，第一章不放；下一章只留在章末，最后一章不放。章末的下一章在菜单收起时也在。顶栏和底栏里的切章跟着菜单一起藏。

## 相关
[NovelEditor](../novel-editor/novel-editor.md) · [Markdown](../markdown/markdown.md) · [Drawer](../drawer/drawer.md) · [Empty](../empty/empty.md)
