---
"@hulianui/ui": patch
---

`Segmented` 段数变化后重新测量选中滑块（#297）：此前测量只挂在「选中下标变了」和「root 尺寸变了」两个通道上，而 `Field` 竖排（`flex flex-col`，align-items 默认 stretch）会把 root 拉满整列宽 —— 加/删段时 root 宽度恒定、一次都不响，可段本身是 `flex-1` 均分，宽度恰恰随段数变。表现为 2 段加到 3 段后滑块仍是 2 段时的宽度，横跨两段，且点已选中的那一段也不会自愈（要点到别的段才重测）。现在 `ResizeObserver` 一并观察被测量的那颗选中段，段数也进了重测依赖。用 `className="self-start"` 绕过的调用点可以撤掉了。
