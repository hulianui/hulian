---
"@hulianui/ui": minor
---

feat(tabs / segmented)!: `TabsList` 与 `Segmented` 的 `tone` 默认值由 `neutral` 改为 `brand` —— 选中文字默认吃品牌色（solid 即「白药丸 + 品牌蓝字」），underline 下划线同色。**视觉变更**：不传 `tone` 的存量 tab 条与分段控件选中色会从前景色变成品牌色；要旧观感显式传 `tone="neutral"`（与改动前逐字相同）。

<!-- changelog-en:start -->
feat(tabs / segmented)!: the default `tone` on `TabsList` and `Segmented` changes from `neutral` to `brand`. The selected label now takes the brand colour by default (a white pill with a brand-blue label on `solid`), and the underline indicator matches it. **Visual change**: existing tab bars and segmented controls that pass no `tone` switch their selected colour from the foreground colour to the brand colour; pass `tone="neutral"` for the previous look, which renders byte for byte as before.
<!-- changelog-en:end -->
