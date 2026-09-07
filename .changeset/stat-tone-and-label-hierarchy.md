---
"@hulianui/ui": minor
---

feat(stat): 此前 label 与 hint 同为 muted 灰、只差 2px 字号，一眼分不出哪行是卡片标题哪行是注脚，icon 底座又写死中性灰，一排 4 张同构卡没法按颜色定位；现在 label 归 text-foreground（注脚仍是 muted，主次由色阶而非字号硬撑），并新增 `tone`（neutral/brand/info/success/warning/danger，默认 neutral 与此前完全一致）只给 icon 底座上浅底 + 语义色，value 与趋势颜色不动，消费方不必再往 label 里塞 span、也不必自己叠一层同尺寸底座去盖住组件的 (#348)
