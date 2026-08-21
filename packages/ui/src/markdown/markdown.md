---
slug: markdown
name: Markdown
category: typography
group: text
tags: []
exports: [Markdown, parseBlocks, slugifyHeading, extractHeadings]
status: enriched
---

# Markdown

> 把 Markdown 字符串渲染成只读的富文本内容 · typography/text

## 何时用

把一段 Markdown 源字符串只读渲染成排版好的富文本（标题/围栏代码块/列表/引用/行内粗斜码链）。需要可编辑用 [MarkdownEditor]；已经是 HTML/JSX 而非 Markdown 源用 [Prose](../prose/prose.md) 直接包裹；单段原子文本用 [Text](../text/text.md)。`parseBlocks` 导出供需要拿块级 AST 自定义渲染的场景；长文要目录 / 深链时开 `headingIds`，目录项用 `extractHeadings` 抽（见下）。

## 导入
```ts
import { Markdown, parseBlocks, extractHeadings, slugifyHeading } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| size | `"sm" \| "base"` | `"base"` | 排版尺寸基准，透传给内部 Prose |
| headingIds | `boolean \| string` | `false` | 给渲染出的标题挂锚点 id（slug 规则见「标题锚点与目录」），使长文可做目录与 `#片段` 深链。默认关闭：id 是全局命名空间，默认生成会让存量调用点凭空多出一批可能与页面已有 id 撞车的锚点。传字符串则同时开启并把它当 id 前缀（`headingIds="doc-"` → `doc-props`），用于把这批 id 关进自己的命名空间 |
| className | `string` | — | 透传容器类名 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `string` | Markdown 源文本（只读渲染；编辑用 MarkdownEditor） |

## 示例
```tsx
<div className="max-w-2xl">
  <Markdown>{`## 快速排序

\`\`\`js
function quickSort(arr) { /* ... */ }
\`\`\`

平均复杂度 **O(n log n)**，行内 \`代码\` 与[外链](https://mdn.io)正常渲染。

> 引用块整体排版吃 Prose 语义 token。`}</Markdown>
</div>
```

## 标题锚点与目录

开 `headingIds` 让标题带上 id，再用 `extractHeadings` 从**同一份源文本**抽目录项，两侧共用一套 slug 规则，锚点不会错位：

```tsx
const md = "## 安装\n\n### 一行接入\n\n## 铁律";
const toc = extractHeadings(md).map((h) => ({ href: `#${h.id}`, title: h.plainText, level: h.level }));

<article className="[&_h2]:scroll-mt-20 [&_h3]:scroll-mt-20">
  <Markdown headingIds>{md}</Markdown>
</article>
<Anchor items={toc.filter((t) => t.level === 2)} offsetTop={88} />
```

宿主页面别处也可能有 id（页面自己的分节、某个示例渲染出的元素）时，改传前缀：`<Markdown headingIds="doc-">` 配 `extractHeadings(md, "doc-")`，两侧前缀必须一致。

`extractHeadings` 每项给 `{ level, text, plainText, id }`：`text` 是标题原文（含行内标记），目录标签用 `plainText`（已剥掉标记）—— 目录项是纯字符串，摆 `text` 会把反引号、星号原样显示出来。

slug 规则：剥掉行内标记（`` `代码` `` / `**粗**` / `*斜*` / `[文字](链接)`）→ 转小写（只影响 ASCII）→ 空白折成连字符 → 只保留 Unicode 字母数字与 `-` `_`（故中文标题原样保留）→ 连字符去重去首尾。全部字符被剔掉的标题（空标题 / 纯符号）回落为 `section`。同名标题按出现顺序追加 `-1` / `-2`。单个标题的规则可用 `slugifyHeading(text)` 单独取用。

## 禁忌 / 坑

- 零依赖块级解析输出 JSX（非 `dangerouslySetInnerHTML`/`innerHTML`），不走原生 HTML sink，故无 [[dompurify-vhtml-markdown-sanitize]] 那类存储型 XSS 风险；但若后续改造成「直接注入 HTML」或扩展支持原始 HTML 标签，必须经 DOMPurify 等清洗后再渲染，不要把不可信源直接喂进 innerHTML。
- 只读组件，不接受编辑回调；需要双向编辑改用 MarkdownEditor。
- 抽目录与渲染必须喂**同一份源文本**：页面若只渲染剥掉页头之后的正文，却拿完整原文抽 TOC，目录会多出页面上并不存在的顶级条目，点它跳不动。
- 组件不替你留 `scroll-mt-*`：跳转落点被 sticky 顶栏盖住时，在外层容器上按顶栏高度补 `[&_h2]:scroll-mt-20` 这类后代类，并与 `Anchor` 的 `offsetTop` 取同一档，否则高亮总慢一格。
- 页面真正的滚动体不是 window（如内层 `overflow-y-auto` 的 `<main>`）时，`Anchor` 要传 `getContainer` 指向它，否则点击目录不动。

## 相关
[Anchor](../anchor/anchor.md) · [Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md) · [AnimatedGradientText](../animated-gradient-text/animated-gradient-text.md)
