---
"@hulianui/tokens": minor
---

preset 新增容器内边距兜底 safelist，堵住一种极难归因的接入失效（#336）。

Card / Dialog / Drawer / DocumentSheet 的内边距是全库唯一一族用 arbitrary value 写的间距
（`px-[var(--card-body-px,1.25rem)]` 这种），400 个组件里只有这 4 个这么写，因为密度要靠
CSS 变量随 `size` 变体下发，同时还要能被 `className="p-0"` 经 tailwind-merge 盖掉。

代价是消费方漏配 `@source` 时，症状**不是**「组件没样式」：`px-4` / `gap-2` / `rounded-xl`
这些常规类消费方自己代码里也写、Tailwind 照样生成，库组件等于蹭到了；精准消失的只有那族
唯瑚琏独有的字面量。净效果是「边框圆角颜色全对，唯独容器内边距整片塌掉」，看着像组件 bug，
于是根因被绕开、业务代码里补一句 `className="p-4"` 了事。

`preset-core.css` 现在用 `@source inline()` 把这 30 个类钉住，无论消费方扫没扫到组件源码
都必定生成，实测代价 386 字节。它**不是** `@source` 的替代品：其余 390 个组件的类名照旧
只能靠蹭，该配还得配。清单与组件源码的一致性由新门禁 `pnpm check:container-padding` 双向
机械保证（缺失与陈旧都拦）。
