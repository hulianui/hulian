---
"@hulianui/ui": minor
---

新增 StackItem 弹性尺寸语义、Card 紧凑密度、Text 字族与等宽数字能力，并修复 DotField 覆盖定位；Select 多选新增选中项优先排序和可删除 chips。

迁移提醒：CardBody 正文现在继承消费方字号。依赖 CardBody 隐式 `text-sm` 的调用方需要在内容层显式声明字号。

<!-- changelog-en:start -->
Adds StackItem flex sizing semantics, compact Card density, Text font-family and tabular-number controls, and fixes DotField overlay positioning. Select multiple mode now supports selected-first ordering and removable chips.

Migration note: CardBody content now inherits the consumer's font size. Consumers that relied on CardBody's implicit `text-sm` must declare the font size on their content layer.
<!-- changelog-en:end -->
