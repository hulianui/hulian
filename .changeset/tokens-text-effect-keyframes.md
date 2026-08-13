---
"@hulianui/tokens": minor
---

preset 补两组文字特效所需的关键帧与规则（`FlipText` / `TextReveal`）

- `hulian-text-flip-top` / `-bottom` / `-left` / `-right`：四档方向各一条，只有 `to`（起点取元素静息的 transform），刻意不带 `forwards`——正反两面渲染的是同一个字，一轮播完容器自动回到 0°，观众看不出切换。
- `hulian-text-reveal`：一条元素宽 3 倍的渐变从最右滑到最左。配 `fill-mode: both` 用，于是未开扫停在「整串透明」、扫完停在「整串实色」，而减弱动效下动画整条不存在、落回静态的 `background-position` = 整串实色。
- `[data-hulian-flip-back]::after` / `[data-hulian-ghost-text]::after`：用 `content: attr(…)` 承载「不该进 DOM 文本」的那份文字（翻面件的背面、轮换件的占位串）。写成真节点会让标题的 `textContent` 出现双份或把所有候选串连在一起，框选复制与爬虫读到的文案一起被污染。写成 Tailwind 任意值类则要赌扫描器生成得出来，而它失手的表现是「翻到一半变空白」，所以落成真 CSS 规则。
