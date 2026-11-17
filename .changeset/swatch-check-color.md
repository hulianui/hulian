---
"@hulianui/ui": patch
---

fix(color-swatch-picker): 选中对勾改为纯白描边加一圈很淡的深色描影。此前用 `mix-blend-difference` 取反相，颜色是底色的补色——蓝底出橙勾、绿底出粉勾，选中态看着像出错。
