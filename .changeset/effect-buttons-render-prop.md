---
"@hulianui/ui": minor
---

`RainbowButton` / `RippleButton` / `PulsatingButton` 补 `render`：特效按钮的「按钮样式的链接」不再只给一半

`render`（把按钮样式与内部装饰结构套到 `<a>` / Next `<Link>` 上）此前只有 `ShimmerButton` 与 `InteractiveHoverButton` 给了，另外三个特效件没有。这不是缺个便利 prop，而是同一批件里同一个能力给了一半——消费方选哪个特效，取决于它能不能当链接用，而这件事此前只能靠翻源码知道（#256）。而且判据上说不通：「落地页主 CTA 是个链接」这个理由是为闪光按钮写的，彩虹按钮在同一场景里只多不少。

三个件的签名、语义与合并规则与既有两处完全一致（本组件的 props/style/className 在前，`render` 元素自带的在后，所以调用方写在 `render` 元素上的东西永远能覆盖默认值），共用 `renderAsElement` 这一份实现。各自的内部结构也一并跟过去：

- `RainbowButton` 的底部模糊光晕是绝对定位的兄弟层，`relative` 跟着 className 合并过去，光晕不会跑去找别的定位祖先
- `RippleButton` 的波纹靠 `overflow-hidden` 裁在盒子里，而 `<a>` 默认是 `display: inline`——底座里的 `inline-flex` 与 `overflow-hidden` 在同一条 className 上，一起过去
- `PulsatingButton` 的脉冲光环是元素自身的 `box-shadow` 关键帧，随样式过去

顺带把 `RippleButton` 的 `variant` 注释划开了「外观」与「语义」两件事：那段说的「想要链接样式请用 `Button variant="link"`」讲的是**长相**（要不要按钮盒子），而需要 `<a>` 标签语义（中键新开标签页 / 右键复制链接 / 爬虫可见）时用的是 `render`，两者不冲突。
