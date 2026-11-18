---
"@hulianui/ui": patch
---

fix(code-block): 标题栏有自己的底色，与代码区分开。

有 `lang` 时标题栏（左侧语言名、右侧复制等操作）此前与代码区同色（`--hl-cb-bg`），短块上几乎看不出哪一条是外壳、哪一条是内容 —— 整块只剩一片灰。现在标题栏吃 `--hl-cb-head-bg`：亮色下比代码区再深一档，暗色下比代码区更亮一档（亮暗的「沉」本来方向相反），两态都能一眼分出标题栏。代码区底色不变。需要在局部换底（如在深色 hero 上放代码块）时，`--hl-cb-bg` 与 `--hl-cb-head-bg` 可以分别覆盖，不会只改一半。

<!-- changelog-en:start -->
fix(code-block): the header bar gets its own background so it reads apart from the code.

With `lang`, the header (language name on the left, copy and other actions on the right) used to share the code area's background (`--hl-cb-bg`), so on short blocks there was no telling which strip was chrome and which was content — the whole block was one shade of gray. The header now uses `--hl-cb-head-bg`: one step darker than the code area in light, one step lighter in dark (each theme sinks in its own direction), so the bar is obvious in both. The code area keeps its existing fill. When the block sits on a locally recolored surface, such as a dark hero, `--hl-cb-bg` and `--hl-cb-head-bg` can be overridden independently instead of only half the block changing.
<!-- changelog-en:end -->
