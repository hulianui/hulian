---
"@hulianui/ui": patch
---

fix(animated-list): 入场改为子项露出一点就触发（`viewport.amount: "some"`）。此前要 40% 进入视口，放在被 `overflow` 裁掉一部分的容器里（横向出血的展示墙、溢出裁切的卡片）时可见部分永远凑不够，整列一直空白。

<!-- changelog-en:start -->
fix(animated-list): entrance now fires as soon as a child is slightly in view (`viewport.amount: "some"`). It used to require 40% of the item inside the viewport, so a list inside a container that clips part of it with `overflow` (a showcase wall that bleeds sideways, a card clipped by overflow) never showed enough of each item and the whole column stayed blank.
<!-- changelog-en:end -->
