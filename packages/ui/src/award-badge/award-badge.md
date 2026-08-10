---
slug: award-badge
name: AwardBadge
category: data-display
group: info
tags: []
exports: [AwardBadge, laurelLeaves, laurelStemPath, laurelDefaults]
status: enriched
---

# AwardBadge

> 桂冠奖章 · 左桂冠圈名次 + 右「前缀小字 + 粗体主标题」两行 · 对标 GitHub Trending「#1 Repository Of The Day」/ Product Hunt 荣誉牌 · outline/solid/soft 三皮肤 × 5 语气 + color 逃生舱 × sm/md/lg · emblem 槽换徽记(奖杯/平台 logo)·wreath 可关 · href 整枚可点 · 桂冠由纯函数 laurelLeaves/laurelStemPath 算出(吃 currentColor·缩放不糊·零图片) · data-display/info

## 何时用

在 README 顶部、官网首页、发布公告里贴**一枚**荣誉：上榜名次、评选奖项、评级结果。

和 [ShieldBadge](../shield-badge/shield-badge.md) 的分工：ShieldBadge 是一行项目元信息（版本 / 许可证 / CI），密集、可排一排；AwardBadge 是一枚荣誉，尺寸更大、页面上只出现一两次、自带徽记。两者不要互相顶替——把奖章缩成小徽章会丢掉「这是荣誉」的分量，把一排元信息做成奖章会喧宾夺主。

**桂冠是算出来的，不是贴图**：`laurelLeaves` / `laurelStemPath` 两个纯函数按角度铺叶（左枝算、右枝镜像），SVG 吃 `currentColor`，所以随语气/主题自动变色、任意缩放不糊、零图片请求。两个函数已导出，画自己的花环也能直接用。

## 导入
```ts
import { AwardBadge, laurelLeaves, laurelStemPath } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| title* | `ReactNode` | — | 主标题，如 `#1 Repository Of The Day` |
| kicker | `ReactNode` | — | 上行小字，自动大写 + 字距，如 `GitHub Trending` |
| rank | `ReactNode` | — | 桂冠中央的名次，如 `1` / `A+`；省略则花环留空 |
| emblem | `ReactNode` | — | 整枚徽记槽：传了就替换「桂冠 + 名次」（奖杯图标 / 平台 logo） |
| wreath | `boolean` | `true` | 是否画桂冠 |
| variant | `"outline" \| "solid" \| "soft"` | `"outline"` | outline 描边（对齐 GitHub Trending / Product Hunt 观感）/ solid 实底 / soft 柔和 |
| tone | `"brand" \| "neutral" \| "success" \| "warning" \| "danger"` | `"brand"` | 语气，决定描边 / 桂冠 / 文字色 |
| color | `string` | — | 逃生舱：任意 CSS 色 / 语义色名（`chart-1`..`chart-6`），覆盖 tone |
| size | `"sm" \| "md" \| "lg"` | `"md"` | 尺寸 |
| href | `string` | — | 整枚可点，渲染为 `<a>`，带 hover/按压/焦点环 |
| target | `string` | — | 配合 href；`_blank` 时自动补 `rel="noreferrer noopener"` |
| rel | `string` | — | 显式覆盖上面那条自动补的 `rel`（如只想要 `noopener`） |
| className | `string` | — | 透传类名；其余原生属性一并透传 |

### laurelLeaves(options?) / laurelStemPath(options?)

桂冠几何纯函数。`options` 可调 `count`（单枝叶片数）/ `cx,cy` / `radius` / `from,to`（起止角度，SVG 里 y 轴向下、顺时针为正）/ `rx,ry`（根部叶片长短半轴）/ `tilt`（叶片相对径向再向枝梢的倾角）/ `taper`（从根到梢的收缩比例）。默认值见 `laurelDefaults`。

## 示例
```tsx
// GitHub Trending 奖章（复刻 README 常见样式）
<AwardBadge
  rank={1}
  kicker="GitHub Trending"
  title="#1 Repository Of The Day"
  href="https://github.com/trending"
/>

// 换徽记 + 自定义色
<AwardBadge emblem={<TrophyMark />} kicker="2026 年度" title="最佳开发者工具" color="chart-5" />
```

## 禁忌 / 坑

- **平台 logo 不进库**：`emblem` 是插槽，Product Hunt / 掘金 / Awwwards 等 mark 由调用方给（品牌资产属对方）。
- **一页别贴一排**：奖章是「唯一性」表达；要并排展示多条元信息用 [ShieldBadge](../shield-badge/shield-badge.md) + `ShieldBadgeGroup`。
- 徽记区（桂冠 + 名次）已 `aria-hidden`——名次信息由 `title` 承载，避免读屏念两遍「1」。若名次只写在花环里没进标题，记得自己补 `aria-label`。
- `solid` 皮肤文字固定取 `--color-primary-foreground`（亮色白 / 暗色近黑）。给中等明度自定义色时核对对比度，或改用 `soft`。

## 相关
[ShieldBadge](../shield-badge/shield-badge.md) · [Badge](../badge/badge.md) · [Tag](../tag/tag.md) · [ScoreRing](../score-ring/score-ring.md) · [Stat](../stat/stat.md)
