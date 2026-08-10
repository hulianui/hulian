---
slug: button
name: Button
category: forms
group: button
tags: []
exports: [Button, buttonVariants]
status: enriched
---

# Button

> 按钮 · CVA 变体 + press 动效 · forms/button

## 何时用

最常用的操作按钮，含 solid/outline/ghost/link 变体、brand/danger 色调、loading 态与 press 缩放动效。需要特效吸睛 CTA 用 [ShimmerButton](../shimmer-button/shimmer-button.md)/[RainbowButton](../rainbow-button/rainbow-button.md)/[PulsatingButton](../pulsating-button/pulsating-button.md)；多按钮成组用 [ButtonGroup](../button-group/button-group.md)；只要按钮样式不要 `<button>` 语义用 `buttonVariants(...)` 拿 className。

## 导入
```ts
import { Button, buttonVariants } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| variant | `"solid" ｜ "outline" ｜ "ghost" ｜ "link"` | `"solid"` | 视觉变体 |
| tone | `"brand" ｜ "success" ｜ "warning" ｜ "danger" ｜ "neutral"` | `"brand"` | 语义色调（见下表） |
| size | `"sm" ｜ "md" ｜ "lg" ｜ "icon" ｜ "iconSm" ｜ "iconLg" ｜ "iconXs"` | `"md"` | 尺寸；icon 三档为正方形图标按钮，边长与同名文字档一一对应（见下表）。`iconXs` 是 20px 微型档，**不与任何文字档等高**，只给密集表格行内用 |
| block | `boolean` | `false` | 块级铺满容器宽度（移动端主操作、表单底部提交） |
| loading | `boolean` | `false` | 加载态，显示 spinner 并自动禁用 |
| ...ButtonHTMLAttributes | `ButtonHTMLAttributes<HTMLButtonElement>` | — | 透传原生属性（disabled、type 等） |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onClick | `(e: MouseEvent<HTMLButtonElement>) => void` | 点击回调，经 `ButtonHTMLAttributes` 透传 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 按钮文案 |
| render | `ReactElement` | 渲染为自定义元素（如 `<a>`/Next `<Link>`），用于按钮样式的链接 CTA；样式与 `aria-disabled` 合并进该元素 |

## 语义档（tone）

按钮是 **`variant`（形态）× `tone`（语义）** 的二维模型，不是一维的 `type` 平铺 —— 「实心的成功按钮」和「描边的成功按钮」是两个正交选择，不必各开一个枚举值。

| tone | 用在什么操作上 | solid 形态 |
|------|---------------|-----------|
| `brand`（默认） | 页面主操作：提交、保存、下一步 | 品牌底 + 白字 |
| `success` | 确认类正向操作：通过、发布、启用 | 成功底 + 对应前景 |
| `warning` | 有代价但不销毁数据：驳回、下架、强制同步 | 警告底 + 对应前景 |
| `danger` | 不可逆的销毁操作：删除、注销、清空 | 危险底 + 对应前景 |
| `neutral` | 与主操作等重的次操作：取消并返回、跳过 | 反色底（前景色作底） |

```tsx
<Button tone="success">通过</Button>
<Button tone="warning" variant="outline">驳回</Button>
<Button tone="danger">删除</Button>
<Button tone="neutral">跳过</Button>
```

从一维 `type` 模型（Vant / Element 那套）迁过来时的对照：`type="primary"` → 默认 `<Button>`；`type="success"` → `tone="success"`；`type="default"` / `plain` → `variant="outline"`；`hairline` 已是全库默认，不必显式写。

## 尺寸档

三条刻度，图标档的边长等于同名文字档的高度——**图标按钮与文字按钮混排一定要取同名的一对**，否则连排（[ButtonGroup](../button-group/button-group.md)）会露出台阶。

| 文字档 | 高度 | 配套图标档 | 边长 |
|--------|------|-----------|------|
| `sm` | 32px | `iconSm` | 32px |
| `md`（默认） | 40px | `icon` | 40px |
| `lg` | 48px | `iconLg` | 48px |

`iconXs`（20px）**不在这条刻度上**，它没有配套文字档，跟 `sm` 混排会矮 12px。
它服务的是密集表格行内的微型操作——树形展开箭头、行内小动作：最小的 `iconSm`（32px）
塞进 `density="compact"` 的行会把行高撑起来。Table 内建的展开器用的就是这一档。

```tsx
{/* 表格行内的展开箭头 */}
<Button variant="ghost" tone="neutral" size="iconXs" aria-label="展开">
  <ChevronRight className="size-4" />
</Button>
```

```tsx
{/* ✅ 同名一对，等高 */}
<ButtonGroup><Button>保存</Button><Button size="icon"><ChevronDown className="size-4" /></Button></ButtonGroup>
{/* ❌ 跨档混排，差 8px */}
<ButtonGroup><Button>保存</Button><Button size="iconSm"><ChevronDown className="size-4" /></Button></ButtonGroup>
```

## 示例
```tsx
<Button>默认</Button>
<Button variant="outline">描边</Button>
<Button tone="danger">危险</Button>
<Button tone="success" variant="outline">通过</Button>
<Button block>块级主操作</Button>
<Button loading>加载中</Button>
```

## 禁忌 / 坑

- `render` 模式为降低风险**不套 motion**，故无 press 缩放动效（颜色/hover 过渡仍在）；文案优先取 Button 的 children。
- `loading` 会自动禁用按钮，无需再手动加 `disabled`。
- 按钮文字**不可被选中**（base 带 `select-none`）。按钮文案是控件标签不是内容，连点场景下浏览器会把连续点击识别成双击选词把文字刷成蓝底。要让用户复制的文本请别做成按钮。
- `tone` 只换语义色，不换形态。想要「浅色底的成功按钮」用 `tone="success" variant="outline"`，别去 `className` 里覆盖背景色。
- `tone="neutral"` 的 `solid` 是**反色**（亮色下深底白字、暗色下浅底深字），不是灰底。灰底实心与 `variant="outline"` 几乎不可分辨，等于白开一档。
- 自定义往按钮里塞图标+文字（尤其在特效按钮里）若图标掉到下一行，是 Tailwind Preflight 把 `svg{display:block}` 撑成块级所致，见 [[tailwind-preflight-svg-block-breaks-icon-text-in-nonflex-button]]——容器要 `inline-flex`，本 Button 已处理，自搓 wrapper 时注意。

## 相关
[ShimmerButton](../shimmer-button/shimmer-button.md) · [RainbowButton](../rainbow-button/rainbow-button.md) · [PulsatingButton](../pulsating-button/pulsating-button.md) · [RippleButton](../ripple-button/ripple-button.md) · [ButtonGroup](../button-group/button-group.md) · [SocialButton](../social-button/social-button.md)
