---
"@hulianui/ui": patch
---

fix(color-swatch-picker): 选中对勾改为纯白描边加一圈很淡的深色描影。此前用 `mix-blend-difference` 取反相，颜色是底色的补色——蓝底出橙勾、绿底出粉勾，选中态看着像出错。

<!-- changelog-en:start -->
fix(color-swatch-picker): the selected check is now a solid white stroke plus a very faint dark outline. It used to use `mix-blend-difference`, so the color was the complement of the swatch: an orange check on blue, a pink check on green, and the selected state looked like a mistake.
<!-- changelog-en:end -->
