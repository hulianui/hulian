---
slug: particles
name: Particles
category: decoration
group: backdrop
tags: [animated]
exports: [Particles]
status: enriched
---

# Particles

> 交互粒子场 · canvas 星尘漂浮 + 鼠标排斥位移 + DPR 自适应 + 颜色吃主题前景 token(明暗跟随) · decoration/backdrop · #animated

## 何时用

需要随鼠标互动的星尘/粒子背景（科技感 Hero、登录页）时用。基于 canvas，有鼠标排斥与漂移交互，比纯 CSS 的 [Aurora](../aurora/aurora.md) 更动态但开销更高；若只要静态彩色渐变背景，用 Aurora 即可；若要规则点阵/网格底纹，用 [DotPattern](../dot-pattern/dot-pattern.md) / [GridPattern](../grid-pattern/grid-pattern.md)。

## 导入
```ts
import { Particles } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| quantity | number | 100 | 粒子数量 |
| staticity | number | 50 | 静止系数，越大越不跟鼠标（位移 = mouseOffset / (staticity/magnetism)） |
| ease | number | 50 | 缓动系数，越大越迟钝（translateX += (target-current)/ease） |
| size | number | 0.4 | 粒子基础半径（px），最终在 [size, size+2] 随机 |
| color | string | `--color-foreground` | 粒子颜色。不传则读主题 token 并随 data-theme 切换；传入接受 `#rrggbb`/`#rgb`/`rgb(r,g,b)` |
| vx | number | 0 | X 轴常量漂移速度（px/帧） |
| vy | number | 0 | Y 轴常量漂移速度（px/帧） |
| refresh | boolean \| number \| string | - | 刷新信号——值变化时强制重绘粒子（等价 MagicUI refresh） |
| className | string | - | 透传到容器 div |

## 示例
```tsx
// 主题色粒子，自动跟随明暗
<div className="relative h-48 overflow-hidden rounded-xl border">
  <Particles quantity={120} />
</div>
```
```tsx
// 指定颜色 + 慢速高静止（不太跟鼠标）
<Particles quantity={80} staticity={80} ease={80} color="#6366f1" />
```

## 禁忌 / 坑

- canvas 颜色 prop 只接受 `#rrggbb`/`#rgb`/`rgb()` 解析格式，**不能直接传 `var(--token)` 或 oklch 字符串**——若要主题色，不传 `color` 让它内部读 `--color-foreground`，或自行先解析成 rgb 再传（参见 [[oklch-css-var-color-must-parse-via-offscreen-canvas]]）。
- 基于 canvas，须客户端渲染；父容器需 `relative` + `overflow-hidden`。
- 数量过大（quantity 数百以上）逐帧重绘有性能成本，背景层酌情控制。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
