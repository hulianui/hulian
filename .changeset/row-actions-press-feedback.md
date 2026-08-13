---
"@hulianui/ui": patch
---

`RowActions` 的动作按钮接上动效体系的按压反馈

此前这一排按钮只有颜色过渡：按下去没有任何形变，与库里 FAB / Segmented / SocialButton 那几件的手感对不上。现在行内动作与溢出菜单键都挂 `pressableClass`——按下轻微缩放，时长与曲线取自动效体系的 fast 档，`prefers-reduced-motion: reduce` 下自动去掉（这条偏好一律由库负责，不必在调用处关）。`revealOnHover` 的显隐同样走 fast 档，减弱动效下变成直接切换。

实现上必须让 `pressableClass` 排在 `cn()` 最后：它自带一份完整的 `transition-property` 列表，而 tailwind-merge 把 `transition-*` 视作同一冲突组、只保留最后一个——写在 `Button` 基类的 `transition-colors` 之前会被整条丢掉，颜色与按压只能活一个。测试锁了这条（断言最终类串里有完整属性列表、没有 `transition-colors`）。

顺带记一条边界：**`Button` 本身当前不带按压反馈**，基类只有颜色过渡，所以这份手感是 `RowActions` 主动接上的，同页手搓的按钮不会有。要全库统一得改 `Button`，那是另一件事。
