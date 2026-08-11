---
"@hulianui/ui": minor
---

`Button` 补上密集刻度的文字档，并把 `soft` 的文档口径说清楚（#204 · #205）。

- `Button` 加 `size="xs"`（24px 高 / 12px 字 / 4px 圆角 / 4px 图文间距，#204）。`iconXs` 在 #146 里补上了「密集表格行内的图标按钮」，同一条刻度上的**文字按钮**却一直没有档：消费仓实测「本该能迁」的 195 处裸 `<button>` 里有 134 处落在 20~28px 高、10~12px 字上，`sm`(32px/14px) 对它们是**大一档**而不是最小档，强行用 `sm` 迁要写 6 个覆盖类去撤销 `sm` 自己刚加的高度、内边距、字号和圆角——那种迁移只会被原样退回。尺寸取的是 `Tag` 的 md 档同一组数值（`h-6 px-2 text-xs`），密集区里两者并排上下沿对齐；圆角与 `iconXs` 同为 `rounded-sm`(4px)，这两档常在同一条工具栏里并排。`xs`(24px) 与 `iconXs`(20px) 刻意不等高：把 `iconXs` 抬到 24px 会把 `density="compact"` 的表格行撑高，而不撑高行是它存在的全部理由。特效按钮（`ShimmerButton` 等）**不开**这一档——微光/彩虹/脉冲需要面积才读得出来，且它们的底座刻意不带圆角，`xs` 的 `rounded-sm` 到那边不生效。
- `Button` 文档修掉一句会把人推向违规写法的话（#205）：「想要『浅色底的成功按钮』用 `tone="success" variant="outline"`」是错的——`outline` 给的是画布同色底 + 语义色描边，底色根本没变浅，照着做的人会发现没效果，然后转头去 `className` 里写 `bg-green-50`，正好掉进同一句话禁止的事。改成指向 0.30.0 已经发布的 `variant="soft"`，并把这一档的既定口径与代价写进文档：底色走库内既有的 `bg-{tone}/12`（hover 20%、`neutral` 用 `bg-foreground/8`），与 `Tag` / `Chip` / `Alert` 的 soft 一致，**刻意不用** `--color-*-subtle` ——换过去 brand 要新造 `--color-primary-subtle` 加四个 `*-subtle-hover`，库里会出现两套 soft 配色；已知代价是半透明底会透出所在容器的背景色。免得下一个消费方再提一次同样的 issue。
