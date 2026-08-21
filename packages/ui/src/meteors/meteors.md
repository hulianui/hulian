---
slug: meteors
name: Meteors
category: decoration
group: backdrop
tags: [animated]
exports: [Meteors]
status: enriched
---

# Meteors

> 流星雨 · 随机斜落拖尾(客户端生成) + currentColor · decoration/backdrop · #animated

## 何时用

需要在 Hero / 卡片 / 空状态等容器内叠一层斜落流星点缀气氛时用。它是轻量的纯 DOM 动画（无 canvas/WebGL），适合做前景小装饰；若要铺满整屏的连续动态背景，选 [Aurora](../aurora/aurora.md) / [WavyBackground](../wavy-background/wavy-background.md)；若要规则的几何底纹（点阵/网格），选 [DotPattern](../dot-pattern/dot-pattern.md) / [GridPattern](../grid-pattern/grid-pattern.md)。

## 导入
```ts
import { Meteors } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| number | number | 20 | 流星数量 |
| minDelay | number | 0.2 | 单颗动画启动最小延迟（秒） |
| maxDelay | number | 1.2 | 单颗动画启动最大延迟（秒） |
| minDuration | number | 2 | 单颗下落最短时长（秒） |
| maxDuration | number | 10 | 单颗下落最长时长（秒） |
| angle | number | 215 | 下落角度（度） |
| className | string | - | 透传到每颗流星 span 的额外类（流星本身用 currentColor，可借此调色） |

## 示例
```tsx
// 父容器须 relative + overflow-hidden 裁剪溢出的流星
<div className="relative overflow-hidden rounded-xl border">
  <Meteors number={20} />
  <div className="grid h-48 place-items-center text-sm text-muted-foreground">Meteors</div>
</div>
```

## 禁忌 / 坑

- 流星位置/延迟在客户端随机生成，组件必须在客户端渲染，且首帧前位置未定（SSR 与首屏会有一帧差异），勿用于对首屏像素稳定性敏感处。
- 流星颜色取 `currentColor`，靠父级 `text-*` 或 `className` 着色，不传颜色 prop。
- 父容器需 `position: relative` + `overflow-hidden`，否则流星会溢出到容器外。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
