---
"@hulianui/mcp": patch
---

改正 `get_setup_guide` 与 `inspect_project` 里对「漏配 `@source`」的症状描述（#336）。

原文写的是「组件渲染出来了但完全没样式」。在一个已经有 Tailwind 的项目里这几乎不会发生 ——
`px-4` / `gap-2` / `rounded-xl` 这些类消费方自己代码里也写、照样生成，库组件蹭得到；精准
消失的只有 Card / Dialog / Drawer 的内边距那一族唯瑚琏独有的字面量。

这个错误描述本身就是根因被反复绕开的原因：AI 和人看到页面有颜色有边框，就直接排除了
`@source` 这条线。现在改成「边框圆角颜色全对、唯独容器内边距整片塌掉」，并给出一条可执行
判据（产物 CSS 里 `grep card-body-px`）。
