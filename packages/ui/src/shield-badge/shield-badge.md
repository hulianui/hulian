---
slug: shield-badge
name: ShieldBadge
category: data-display
group: info
tags: []
exports: [ShieldBadge, ShieldBadgeGroup, compactCount]
status: enriched
---

# ShieldBadge

> README 徽章 · shields.io 风格「左灰标签 + 右彩数值」双段贴纸(版本/许可证/下载量/CI/星标) · 5 语气 + color 逃生舱 · solid/soft/outline 三皮肤 × rounded/square/pill 三外形 · icon 品牌 mark 槽 + href 整枚可点(按压/焦点环) · 配 ShieldBadgeGroup 排一行自动换行 + 纯函数 compactCount(1.5k/3.4M) · 纯 CSS 吃主题不联网(零依赖·RSC) · data-display/info

## 何时用

在 README 头部、项目主页、包详情页展示一条项目元信息（版本 / 许可证 / 下载量 / CI 状态 / 星标）。

和库内三个近邻的分工：[Badge](../badge/badge.md) 是计数角标（叠在图标/头像角上），[Tag](../tag/tag.md) 是单段状态标签，[Chip](../chip/chip.md) 是可操作令牌；本组件的语义是「一条项目元信息」，**双段结构**就是它的辨识度。要表达部署/构建生命周期用 [DeployStatus](../deploy-status/deploy-status.md)，要展示服务健康态用 [StatusDot](../status-dot/status-dot.md)，要发奖章用 [AwardBadge](../award-badge/award-badge.md)。

**为什么不直接贴 `<img src="https://img.shields.io/...">`**：远程图片不吃主题（暗色下发白）、首屏多一轮网络往返、缩放发虚、文档站门禁禁远程资源。本组件纯 CSS 渲染，明暗自动切、文字可选中、任意缩放清晰。它**不联网取数**——数值由调用方给（构建期注入或后端下发），配 `compactCount` 格式化。

## 导入
```ts
import { ShieldBadge, ShieldBadgeGroup, compactCount } from "@hulianui/ui"
```

## Props

### ShieldBadge

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value* | `ReactNode` | - | 右段（彩底），如 `MIT` / `1.5k/month` / `failing` |
| label | `ReactNode` | - | 左段（灰底），如 `license` / `downloads`；省略则退化为单段徽章 |
| icon | `ReactNode` | - | 前置 logo 槽：有 label 时在左段最前，否则在右段最前（自动 `aria-hidden`） |
| tone | `"neutral" \| "brand" \| "success" \| "warning" \| "danger"` | `"brand"` | 右段语气 |
| color | `string` | - | 逃生舱：任意 CSS 色 / 语义色名（`chart-1`..`chart-6`），覆盖 tone |
| variant | `"solid" \| "soft" \| "outline"` | `"solid"` | solid 贴纸感 / soft 柔和（嵌进正文不抢戏）/ outline 描边 |
| shape | `"rounded" \| "square" \| "pill"` | `"rounded"` | 外形 |
| size | `"sm" \| "md"` | `"md"` | 尺寸 |
| href | `string` | - | 整枚可点，渲染为 `<a>`，带 hover/按压/焦点环 |
| target | `string` | - | 配合 href；`_blank` 时自动补 `rel="noreferrer noopener"`（显式传 rel 优先） |
| rel | `string` | - | 显式覆盖上面那条自动补的 `rel` |
| className | `string` | - | 透传类名；其余原生属性（title / data-* / onClick）一并透传 |

### ShieldBadgeGroup

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| gap | `"sm" \| "md"` | `"sm"` | 徽章间距，窄屏自动换行 |

### compactCount(value, digits?)

把星标数 / 下载量压成徽章写法：`999` / `1.5k` / `12k` / `3.4M`。≥10 的档取整（`12k` 而非 `12.3k`），`999_999` 进位成 `1M`。**刻意不用 `Intl.NumberFormat(notation:"compact")`**——它跟随 locale，zh-CN 下会输出「1.5万」，而 README 徽章是面向全球读者的固定写法。

## 示例
```tsx
// README 徽章行
<ShieldBadgeGroup>
  <ShieldBadge label="@hulianui/ui" value="v0.17.0" icon={<NpmMark />} />
  <ShieldBadge label="downloads" value={`${compactCount(1500)}/month`} />
  <ShieldBadge label="license" value="MIT" />
  <ShieldBadge label="CI" value="failing" tone="danger" icon={<GithubMark />} />
  <ShieldBadge label="stars" value={compactCount(4)} href="https://github.com/hulianui/hulian" target="_blank" />
</ShieldBadgeGroup>

// 嵌进文档正文：soft 皮肤不抢戏
<ShieldBadge label="node" value=">=22" variant="soft" tone="neutral" size="sm" />
```

## 禁忌 / 坑

- **品牌 logo 不进库**：`icon` 是插槽，npm/GitHub/Discord 等 mark 由调用方给（lucide v1 起已移除品牌图标，且品牌 mark 属调用方资产）。传入的 SVG 会被拉伸到槽位尺寸并 `aria-hidden`。
- **不要用它做计数角标**：叠在图标/头像角上的红点用 [Badge](../badge/badge.md)，本组件是行内贴纸。
- `color` 逃生舱在 solid 皮肤下文字固定取 `--color-primary-foreground`（亮色白 / 暗色近黑）。给中等明度的自定义色时自行核对对比度，或改用 `soft` 皮肤（彩字 + 12% 同色底，两态都稳）。

## 相关
[Badge](../badge/badge.md) · [Tag](../tag/tag.md) · [AwardBadge](../award-badge/award-badge.md) · [DeployStatus](../deploy-status/deploy-status.md) · [GitCommit](../git-commit/git-commit.md) · [StatusDot](../status-dot/status-dot.md)
