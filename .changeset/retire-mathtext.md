---
"@hulianui/ui": minor
---

**破坏性变更：MathText 退役，QuestionCard 迁到 `@hulianui/ui/math`。**

MathText 用 CSS 拼行内数学版式（`inline-flex` 叠分数、`border-t` 当根号横线），排出来的东西是错的：`√` 是定高字符而横线是兄弟盒的 border，被开方数一含上标（`\sqrt{a^{2}+b^{2}}`）横线就接不上根号、末尾指数顶到线外；弧与帽子不跟随内容宽度，中文教材里跨 AB 的弧被排成 A 头上一顶帽子。这是 CSS 拼贴的固有极限，修一处还有下一处。它当初的卖点「零依赖换不撑乱中文行高」实测在 KaTeX 下同样成立 —— 那个差异一直是假的。

数学渲染统一走 KaTeX 驱动的 `Formula`。

迁移：

| 原来 | 现在 |
|---|---|
| `import { MathText } from "@hulianui/ui"` | `import { Formula } from "@hulianui/ui/math"` |
| `import { QuestionCard } from "@hulianui/ui"` | `import { QuestionCard } from "@hulianui/ui/math"` |
| `<MathText>{stem}</MathText>` | `<Formula>{stem}</Formula>` |
| `mathToPlain(src)` | 同名同义，改从 `@hulianui/ui/math` 引 |
| `parseMath` / `parseMathDocument` | 不再导出（排版已由 KaTeX 接管） |
| `delimiters={true}` | 不需要：`mixed` 默认认 `$`，没有 `$` 时自动退到裸记号切分 |
| `scriptScale` | 移除（上下标尺寸由 TeX 排版规则决定） |

QuestionCard 换 subpath 是因为它的题干/选项内部就是 Formula，留在主 barrel 会把 KaTeX 拖进每一个 `@hulianui/ui` 消费者的包。主入口仍然一分 KaTeX 体积都不付。

Formula 为接管题库场景补了两项能力：

- **裸记号回退** —— 整串没有成对分隔符时自动切分出 `\frac{3}{8}`、`x^{2}`、`\angle ABC` 交给 KaTeX，其余按文本输出。PDF/Word/OCR 直出的题面不必先包 `$` 才能排。判据是「没有 `\` / `^` / `_` 就不是公式」，所以 `P(2,3)`、选项标号 `A.` 一律留作文本。新增纯函数 `splitBareMath` / `hasBareMath`。
- **填空槽** —— `____` 渲染成可书写的空位（新 prop `blankWidth`，默认 2.5em），分隔符内外都认，读屏读到的是「填空」而不是一串下划线。

视觉上有两处变化，都是改对了而非回归：变量按 TeX 规矩显示为斜体；公式比周围正文约大 1.21 倍。
