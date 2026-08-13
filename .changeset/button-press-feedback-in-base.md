---
"@hulianui/ui": minor
---

按压反馈进 `Button` 底座：全库按钮手感统一

此前这份反馈只长在**裸 `<button>`** 的那几件上（FAB / Segmented / Toggle / FilterChip / SocialButton / AppLauncher / Legend / AwardBadge），而所有走 `<Button>` 的地方一律没有——同一个页面两种手感，且「哪颗有」取决于它碰巧是哪件组件实现的，消费方无从预期。按压反馈是可点击元素的通用语言，应该归底座。

现在 `BUTTON_BASE_CLASS` 带 `pressableClass`：按下轻微缩放（0.97），时长与曲线取自动效体系的 fast 档，`prefers-reduced-motion: reduce` 下缩放与过渡一并撤掉（这条偏好一律由库负责，不必在调用处关）。**每一颗 `<Button>` 的观感都会变**——多出按下时的形变，颜色过渡照旧。

两条边界：

- 底座里放的是 `pressableClass` 而**不是** `transition-colors`，两者不能并列：tailwind-merge 把 `transition-*` 视作同一冲突组、只保留最后一个，先写的会被整条丢弃。`pressableClass` 自带含颜色项的完整 transition-property 列表，正是为平替它而写。推论写进了文档：**自己在 `className` 里补 `transition-*` 会把按压反馈整条挤掉**，要改过渡请连缩放一起写全。
- 特效按钮（ShimmerButton / RainbowButton / PulsatingButton / RippleButton）走的是另一套底座，**刻意不含**这份反馈：它们变的是自绘背景，过渡属性各管各的。测试锁了这条边界。

`RowActions` 上一版自己挂的那份随之撤掉——底座已经有了，重复挂没有意义。
