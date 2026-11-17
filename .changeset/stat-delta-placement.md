---
"@hulianui/ui": minor
---

feat(stat): 新增 `deltaPlacement`，`"inline"` 时趋势（`delta` + `deltaLabel`）排在数值同一行右侧、图表独占卡底。默认 `"below"` 与此前一致（数值下方、图表之后）。带 `chart` 的 KPI 卡推荐 `"inline"`：读数 → 涨跌 → 走势一路向下，不用隔着一张图去找涨跌修饰的那个数。

<!-- changelog-en:start -->
feat(stat): adds `deltaPlacement`. `"inline"` places the trend (`delta` + `deltaLabel`) on the same row as the value, on the right, and the chart occupies the bottom of the card by itself. The default `"below"` matches the previous layout (under the value, after the chart). A KPI card with a `chart` should use `"inline"`: the reading, then the change, then the trend, top to bottom, without looking past a chart for the number the change describes.
<!-- changelog-en:end -->
