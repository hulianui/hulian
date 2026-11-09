---
"@hulianui/ui": minor
---

feat(sequence-diagram): 新增 SequenceDiagram 时序图（只读首片）。参与者从左到右、消息自上而下；`kind` 分同步调用（实线实心箭头）、异步消息（开口箭头）和返回（虚线），`from === to` 画成自调用回环，文案借用右边一列不至于几个字就折行。`autoNumber` 加序号，`activeId` 高亮当前一步并标 `aria-current="step"`。消息层和生命线层共用同一套网格列，箭头端点不靠测量 DOM。列宽不够时整张图在自己的区域里横向滚动，页面不溢出。读屏按有序列表逐条念「甲 发给 乙（同步调用）：文案」，箭头在 `aria-hidden` 装饰层里，前缀跟随 `ConfigProvider` 语言。这一片没有标注、分组框、激活条，也不能点选消息。

<!-- changelog-en:start -->
feat(sequence-diagram): adds SequenceDiagram, a read-only first slice. Participants run left to right and messages run top to bottom. `kind` is a synchronous call (solid line, filled head), an asynchronous message (open head), or a reply (dashed). `from === to` draws a self-call loop, and its text borrows the next column so a few words do not wrap. `autoNumber` adds numbers, and `activeId` highlights the current step with `aria-current="step"`. The message layer and the lifeline layer share one set of grid columns, so arrow ends need no DOM measurement. When columns do not fit, the figure scrolls horizontally inside its own area and the page does not overflow. Screen readers hear an ordered list, each item read as "A to B (synchronous call): text"; arrows sit in an `aria-hidden` decoration layer, and the prefix follows the `ConfigProvider` language. This slice has no notes, no frames, no activation bars, and messages cannot be selected.
<!-- changelog-en:end -->
