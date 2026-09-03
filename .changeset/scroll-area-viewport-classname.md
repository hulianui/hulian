---
"@hulianui/ui": minor
---

`ScrollArea` 新增 `viewportClassName`：把类名落到真正滚动的那层视口上（#340）。

`className` 落在 Root 上，而裁剪发生在内层视口 - 声明 `vertical` 后视口带 `overflow-x: hidden`，于是 `w-full` 的表单控件与视口左右零余量，聚焦时 `ring-2 + ring-offset-2` 向外扩的那 4px 整条被切掉，看到的是**焦点环只剩上下两条线**。给 Root 加内边距救不了，裁的是视口。消费方此前只能给滚动内容自己加 `px-*`，每个用到的人都要重新踩一遍。

现在传 `viewportClassName="px-1.5"` 即可。不做成默认值：留白该加在滚动容器上还是各列上只有消费方知道，默认给一份会让「内容宽度 = 视口宽度」这个多数场景平白缩窄。

<!-- changelog-en:start -->
`ScrollArea` gains `viewportClassName`, which applies classes to the inner viewport that actually scrolls (#340).

`className` lands on Root while clipping happens in the viewport: declaring `vertical` gives the viewport `overflow-x: hidden`, so a `w-full` form control sits flush against it and the 4px that `ring-2 + ring-offset-2` paints outward is cut away entirely. What you see is a **focus ring reduced to its top and bottom edges**. Padding on Root cannot help, because the viewport is what clips. Until now consumers could only add `px-*` to the scrolling content itself, and every one of them had to rediscover that.

Pass `viewportClassName="px-1.5"` instead. There is deliberately no default: only the consumer knows whether the gutter belongs on the scroll container or on individual columns, and shipping one would needlessly narrow the common case where content width equals viewport width.
<!-- changelog-en:end -->
