---
"@hulianui/ui": minor
---

新增 MathText / QuestionCard，外加 Image 与 Table 两处真 bug 修复

**MathText（新增 · typography/text）**

行内数学排版。零依赖解析 LaTeX 子集（分数 / 根号 / 上下标 / 填空槽）并渲染成真数学版式。分数用 `inline-flex` 竖排，不撑乱中文行高。需要可检索的朴素文本时走 `mathToPlain`。RSC 安全。

**QuestionCard（新增 · data-display/collection）**

教辅题库的标准展示件：题号 / 题型 / 分层 / 题干 / 选项 / 小问 / 附图 / 章节 / 出处。题干与选项走 MathText 的真数学版式；待复核题亮左侧警示边条，不与正常题混排。dogfood Card / Tag / Chip / Image。

**fix(image)：命中缓存的图片永久停在 `opacity-0`**

只靠 `onLoad` 翻转淡入态是不够的 —— 图片命中缓存（或 SSR 出的 HTML 在 hydration 之前就解完码）时，`load` 事件早在 React 挂上处理器之前就烧完了，`onLoad` 永不触发。

现象极具迷惑性：**网络面板 200、`naturalWidth` 正常，页面上却是一块空白**，很容易被误判成图片本身挂了。改为挂载后经 ref 补查一次 `img.complete && naturalWidth > 0`。

**fix(table)：表头恒不换行**

`table-layout: auto` 下列宽会收缩到 `min-content`，中文表头因此被挤成「拆／出／条／目」每行一个字（英文则按空格断开），列宽反而更窄。表头是短标签，`nowrap` 让它成为列的宽度下界，才是正确的度量基准。需要截断的列继续走 `meta.ellipsis` + `maxWidth`，不靠折行省地方。
