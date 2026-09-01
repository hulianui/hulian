---
"@hulianui/ui": minor
---

`AuthPanel` 新增 `contentAlign?: "start" | "center"`（#338）。

面板原本是上块贴顶、下块贴底：分屏认证页右半边的表单按示例是 `place-items-center` 垂直居中，高一点的视口里左侧标语在 y≈128、表单从 y≈284 起，中间隔着一大段空白。消费方只能用 `[&>div:first-child]:flex-1` 猜内部 DOM 去撑，那不是契约。`contentAlign="center"` 时面板改为三行 grid `1fr auto 1fr`：brand 仍贴顶、highlights / footer 仍贴底，中部（title / description / children）相对**整块面板**居中——上下两行等分剩余空间，品牌位与底部区高矮不同也不会把中部推偏（`flex-1 + justify-center` 会）。默认 `start`，现有页面 DOM 不变。

<!-- changelog-en:start -->
`AuthPanel` gains `contentAlign?: "start" | "center"` (#338).

The panel used to pin its top block to the top and its bottom block to the bottom. The form on the other half of a split auth page is vertically centered (`place-items-center` in the docs example), so on a taller viewport the headline sat at y≈128 while the form started around y≈284, with a large gap between them. Consumers could only stretch the internal layout with `[&>div:first-child]:flex-1`, which guesses at the DOM and is not a contract. With `contentAlign="center"` the panel becomes a three-row grid `1fr auto 1fr`: the brand still sits at the top, highlights / footer still sit at the bottom, and the middle content (title / description / children) is centered relative to the whole panel. The two outer rows share the remaining space equally, so a brand slot and a footer of different heights do not push the middle off center (a `flex-1 + justify-center` layout would). The default is `start`, so existing pages render the same DOM as before.
<!-- changelog-en:end -->
