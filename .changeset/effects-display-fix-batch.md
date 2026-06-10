---
"@hulianui/ui": patch
---

修复 17 个特效/动效组件的画廊展示问题（CDP 实测证据驱动 + 有头浏览器复验）：

- WebGL shader 全黑：dither（ES 3.00 数组初始化器在 ES 1.00 编译失败→Bayer 改程序式生成）、grid-scan / pixel-blast / shape-blur（fwidth 无导数支持→shader 升 #version 300 es）
- WebGL 颜色解析失败：ghost-cursor（ogl Color 不认 var()/oklch→getComputedStyle+离屏 canvas2d 转 rgb）、magic-rings（正则拆 rgb 撞 oklch 计算值→同款修法）
- 默认色撞深色演示底：fuzzy-text、pixel-snow 默认色改按画布真实底色亮度自适应，亮暗主题均可读
- card-swap：Fragment children 不被 Children.toArray 展开致 total=1 轮换从未启动→递归 flatten；motion v12 被中断动画 promise 永不归还→每段加超时兜底+在飞守卫；新增 placement="center" 解决画廊容器裁切
- ballpit：窄容器超填充致剧烈抖动→新增面积占用率上限自适应（球数/半径随容器缩放）+ 位置校正式重叠分离 + 低速收敛
- star-border：animation 简写含两个方向关键字属非法 CSS 整条被丢→拆为合法 alternate / alternate-reverse 双向流光
- orbit-images：offset-path 绝对坐标不随容器缩放致子项全程在视野外→真缩放层 + 动画失效时静态均匀分布兜底
- scroll-float：useScroll 盲绑视口在内滚容器中进度钉死→自动探测可滚动祖先（static 容器自动补 relative），无滚动上下文降级 in-view 浮现
- target-cursor：默认改容器作用域（absolute+容器事件+离开即隐藏），多实例互不干扰；新增 fullScreen prop 保留全页模式
- ripple-button：波纹 span 补 transform: scale(0) 基线 + 键盘/程序化激活从中心扩散
- text-pressure：字符盒宽与缩放同步，相邻字符不再重叠
