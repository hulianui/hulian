---
"@hulianui/ui": patch
---

`Upload` 落区静止态改为主色淡边 + 淡底，悬停加深、拖入最重，三档递进。

此前静止态是 `border-border` 虚线 + `bg-surface`：落区多半压在同色卡面上，全部边界只剩 1px 灰虚线，白底上对比度约 1.1:1，消费方实机反馈「边缘很模糊」，且悬停只换背景、与静止几乎无差。现在静止就与卡面差一档，悬停必须与静止不同，拖入态 `bg-primary/10` 也比原来重一档。

<!-- changelog-en:start -->
The `Upload` drop zone now rests on a faint primary-tinted dashed border and background, darkens on hover, and is heaviest while dragging over: three distinct steps.

Previously the resting state was a `border-border` dashed line on `bg-surface`. The drop zone usually sits on a same-colored card, so its only boundary was a 1px gray dashed line at roughly 1.1:1 contrast on white; consumers reported the edge as barely visible, and hover only swapped the background, making it nearly indistinguishable from rest. The resting state is now one step away from the card, hover differs from rest, and the drag-over `bg-primary/10` is one step heavier than before.
<!-- changelog-en:end -->
