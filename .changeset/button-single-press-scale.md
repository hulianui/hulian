---
"@hulianui/ui": patch
---

`Button` 的按压反馈不再叠两次：按下缩 3%，不是 6%

0.43.0 把 `pressableClass`（含 `active:scale-[0.97]`）放进了 `BUTTON_BASE_CLASS`，但 `<Button>`
上原有的 motion `whileTap={{ scale: 0.97 }}` 没撤。两条走的是**不同的 CSS 属性**——motion 写内联
`transform`，而 Tailwind v4 的 `scale-*` 编译成独立的 `scale` 属性——互不覆盖而是**相乘**：
0.97 × 0.97 = 0.9409，按下去缩约 6%，是意图的两倍（#260）。

撤掉的是 motion 那半，留 CSS 那半，两个理由：

- **减弱动效这条偏好一律由库负责。** `pressableClass` 自带 `motion-reduce:active:scale-100`，
  `whileTap` 没有对应守卫，`prefers-reduced-motion: reduce` 下 JS 那半照缩。
- **`<Button>` 不再拖 motion 运行时**：`m.button` + `LazyMotionProvider(domAnimation)` 从 Button
  的依赖里整块去掉了。这是 `pressableClass` 当初存在的理由——「零 motion 运行时，让按下去有反应
  这件事能铺满全库」。

`render`（渲染为 `<a>` / `<Link>`）那条路的按压反馈与 `<button>` 分支自此同源：都在底座的
className 里。文档里「render 模式不套 motion，故无 press 缩放」那句同步改掉——0.43.0 起它已经有了。

新增一条钉死「同一颗按钮上只有一个缩放来源」的测试。这个 bug 的形态是两处各自都对、合起来才错，
逐处 review 看不出来。
