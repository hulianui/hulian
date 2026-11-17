---
"@hulianui/tokens": minor
"@hulianui/ui": patch
---

feat(tokens): 新增衬线字体变量 `--hl-font-serif`，经主张层映射给 `--font-serif`，`font-serif` 工具类改由它驱动。默认值与 Tailwind 的衬线栈逐字一致，不设它的项目渲染不变；汉字经末尾的 `serif` 通用族落到系统宋体。`Paper` 的正文字体栈改为 `var(--paper-font, "STIX Two Text", "Times New Roman", var(--hl-font-serif, serif))`：西文仍先用 STIX Two Text / Times New Roman，中文与兜底回落到 `--hl-font-serif`，因此设它就能一并换掉论文里的中文衬线；`--paper-font` 照旧整个替换。

<!-- changelog-en:start -->
feat(tokens): adds the serif font variable `--hl-font-serif`, mapped to `--font-serif` in the opinionated layer so the `font-serif` utility now follows it. The default matches Tailwind's serif stack exactly, so projects that do not set it render the same; Chinese text reaches the system Song face through the trailing `serif` generic family. The `Paper` body font stack becomes `var(--paper-font, "STIX Two Text", "Times New Roman", var(--hl-font-serif, serif))`: Latin text still uses STIX Two Text or Times New Roman first, while Chinese and fallbacks come from `--hl-font-serif`, so setting it also changes the Chinese serif in papers. `--paper-font` still replaces the whole stack.
<!-- changelog-en:end -->
