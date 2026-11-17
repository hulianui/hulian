---
"@hulianui/ui": minor
---

Paper 新增标题区与参考文献。`PaperHeader` 排题目（上粗下细两条线）、作者与单位、说明行和摘要；`Bibliography` 按 `entries` 顺序编号，`Cite` 按 id 取号，多条引用排序去重、连续三条及以上压成 `[1–3]`，点击滚到条目并描边，打印形态下去掉链接色。「摘要」「参考文献」标题跟随 `Paper` 的 `labels`（新增可选的 `abstract`、`references`）。

<!-- changelog-en:start -->
feat(paper): adds a title block and references. `PaperHeader` lays out the title (between a thick and a thin rule), authors with affiliations, a line of details, and the abstract. `Bibliography` numbers `entries` in order and `Cite` takes numbers by id: several citations are sorted and deduplicated, three or more in a row collapse to `[1–3]`, a click scrolls to the entry and outlines it, and print mode drops the link color. The Abstract and References headings follow the `labels` of `Paper` (new optional `abstract` and `references`).
<!-- changelog-en:end -->
