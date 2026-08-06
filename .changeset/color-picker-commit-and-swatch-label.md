---
"@hulianui/ui": minor
---

修 #99 / #100：两个取色件补上被 InspectorPanel 逼出来的缺口

**#100 · ColorPicker 补 `onValueCommitted`**

过去只有 `onValueChange`，而内部取色面板拖动时**每帧**触发，消费方拿不到「松手了」这个时刻，也没法自己补 —— 防抖只能猜延迟，`pointerup` 在组件内部拿不到句柄。

新增 `onValueCommitted`（命名对齐 Base UI 的 NumberField / Slider），在取色面板拖动结束、文本框 blur 或回车、格式切换时各触发一次。`pointercancel` **不**触发（被系统打断的手势不算一次确定的提交）；点一下没拖仍触发一次（消费方要的是「一次编辑结束」信号）。`onValueChange` 语义不变，两者可同时用，TSDoc 补了「拖动中每帧触发」的说明。

顺带修了一个只有接上 commit 事件才会暴露的 bug：`commitMode="commit"` 下父级拖动中不回写 props，而受控 `value` 会把色板**钉死拖不动**。改走 `defaultValue` + `key`（外部值变了才重挂）。

**#99 · ColorSwatchPicker 色块可读标签**

`colors` 过去是 `string[]` 且原样当 `aria-label`，主题 token 场景下读屏念的是 `var(--color-primary)`。现在 `colors` 接受 `string | { color, label }` 混合数组（纯增量，`string[]` 是子集，现有调用点零改动），并补了 `title` 悬停提示。
