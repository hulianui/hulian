---
"@hulianui/ui": minor
---

feat(flow): 连线可以带一段可选文案 `FlowEdge.label`。不传，或去掉空白后为空，画布、点击、删除和读屏结果与现在一样。有文案时，标签放在它自己这条贝塞尔离开中点的外侧，并用短引线连回曲线上的那个点，给两端连接桩、两端节点和选中后的删除钮让位；长文案最多按 10rem 换行，不截断。交叉或贴得很近的连线不会互相避让，标签仍可能叠在一起。连线路径仍画在 `aria-hidden` 的 SVG 里，标签名挂在这层外面的分组上，辅助技术读得到这段文字。这一步只补名称，没有键盘逐条选中、删除或焦点恢复。尚未发版，文档站生产环境还没有这项。

<!-- changelog-en:start -->
feat(flow): an edge can carry optional text, `FlowEdge.label`. Omitting it, or leaving only whitespace, keeps the canvas, pointer, delete, and screen-reader behavior unchanged. When text is present, the chip sits on the outside of its own bezier, off the midpoint, and a short leader joins it back to that point on the curve. It stays clear of both connector ports, both endpoint nodes, and the selected edge's delete button. Long text wraps at a maximum of 10rem and is not truncated. Labels on crossing or tightly packed edges do not avoid each other and can still overlap. The path stays in an `aria-hidden` SVG, and the label name hangs on a group outside that layer so assistive technology can read the text. This step only adds the name. It does not add per-edge keyboard selection, deletion, or focus restoration. It is not released yet, and the production docs site does not have it yet.
<!-- changelog-en:end -->
