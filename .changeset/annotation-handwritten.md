---
"@hulianui/ui": minor
"@hulianui/tokens": minor
---

新增 Annotation 手写风格标注

**Annotation（新增 · data-display/info）**

给一段行内内容画上荧光笔底色 + 手绘箭头 + 手写小标签，用来在文档、演示、组件解剖图里就地讲解「这一块是什么」。与 Callout 互补：Callout 是打断正文的块级提示框，Annotation 是不占布局位置的旁注。

`side` 说的是**标签在哪**（与 Tooltip / Popover 同义），箭头自动从标签指回目标。八个方位共用两条定位规则 —— 箭头的头端贴目标、标签接在箭头尾端外侧 —— 所以换方位不需要各自调偏移量，几何算在 `annotationGeometry` 纯函数里。

与同类的纯 CSS 方案相比有三处不同：标签是**真实 DOM 节点**而非 `::after` + `content: attr()`，因此能放 ReactNode（内嵌 Code、链接）且读屏能读到；箭头是**真实 SVG 元素**而非 `mask: url(data:...)`，直接吃颜色变量、省掉一层遮罩合成；配色走语义 token，暗色下荧光笔自动提亮，且只染标注自身 —— 被标注的正文保持原色。

荧光笔底色向左右外扩模仿马克笔涂过头，量走 `--hl-ann-spread`（默认 `0.3em`）。同一行里几条标注紧挨着时底色会连成一片，`className="[--hl-ann-spread:0.1em]"` 即可收窄。

**tokens：新增 `--hl-annotation-font` 手写字体栈 + `--hl-ann-hue` 注册属性**

字体栈刻意很短，只列经实测确认默认可用的：macOS 走翩翩体、Windows 走楷体。原因是 macOS 把「手札体 / 行楷 / 报隶 / 魏碑」这类字体登记为**可下载字体** —— 字体名在系统里注册着但字形默认不在本地，浏览器的逐字符回落会在这种名字上停住（认为已命中）却拿不到字形，画成默认黑体，于是把排在后面、真正装了的字体永远挡在门外。往这个栈里「多加几个备选」会让效果变差而不是变好。

`@property --hl-ann-hue` 让色相可插值，供 `tone="rainbow"` 循环换色；`inherits: true` 是必须的 —— 箭头与标签是宿主的子元素，靠继承拿到动画中的色相。
