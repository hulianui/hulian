---
"@hulianui/ui": patch
---

fix(cascader): 搜索无结果时的「无匹配项」改为 `role="none"`。此前它是不带角色的 `<li>`，在 `role="listbox"` 里带着隐式 listitem 角色，axe 按 critical 级 aria-required-children 报错，屏幕阅读器会把它读成列表框里一个不可选的怪成员。

<!-- changelog-en:start -->
fix(cascader): the "no matches" row shown when a search finds nothing now carries `role="none"`. It used to be a plain `<li>` inside `role="listbox"`, so it kept the implicit listitem role; axe reported a critical aria-required-children violation and screen readers announced it as an odd, unselectable member of the listbox.
<!-- changelog-en:end -->
