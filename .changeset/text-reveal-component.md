---
"@hulianui/ui": minor
---

新增 `TextReveal`：一条多色带横扫，把文字从透明揭示成实色

库里 20 多个字效件按**用途**只有一类：一次性进场（滚入视口触发、播完即静）。缺的是另一类——持续循环、表示「这件事正在进行」的状态文字（「OCR 中」「解析中」「归档中」）。差别不是参数而是用途：进场动画播完就没了，而「进行中」的动画**停下来本身就是错误信号**，用户是靠它还在动来判断后台任务没死（#255）。

两种用法共用一件：默认 `startOnView` + 不 `repeat` 是进场（扫一轮停在全部揭示的终态）；`repeat startOnView={false}` 是进行中。

与最接近的 `AnimatedShinyText` 分界清楚：那件是在**已经可见**的文字上加一道单色高光，本件是从透明**揭示**成实色、色带可配。两种语义没有塞进同一个组件。

三处实现取舍：

- **减弱动效下不会整串消失。** 文字本身是 `color: transparent`，靠背景渐变透过字形显色，所以「关掉动画」这个直觉做法会让字整串不见。这里动画带 `fill-mode: both`，`prefers-reduced-motion: reduce` 时动画整条不存在，落回静态的 `background-position` = 整串 `textColor`。是结构上排除的，不靠 JS 把扫光位置 set 到终点。
- **多串轮换的宽度预留不测量。** 所有串叠进同一个网格单元，容器宽度自然等于最宽那串——不克隆 ghost 节点量宽度、不等字体加载完重量，换字体换字号都不会失准。占位串的文字挂在 data 属性上由伪元素渲染，不进 DOM 文本，否则这个标签的 `textContent` 会是所有阶段名连在一起。
- **不引 motion。** 一条 background-position 关键帧加一个 IntersectionObserver 就够。

一条要写进调用处的约束：`textColor` **不能传 `currentColor`**——字身是 transparent，`currentColor` 解析出来正是那个 transparent，整串会消失。要跟随容器色请显式传 token。
