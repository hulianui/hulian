---
slug: profile-card
name: ProfileCard
category: data-display
group: collection
tags: [animated]
exports: [ProfileCard]
status: enriched
---

# ProfileCard

> 指针倾斜 + 全息炫彩名片卡 · RAF 阻尼弹簧驱动 3D 旋转/光晕（零依赖）+ chart token 全息渐变 + 无头像落首字母占位（reduced-motion 静态降级） · data-display/collection · #animated

## 何时用

做个人/成员名片（作品集、团队页、社交卡）且要全息炫彩+指针倾斜的高级感时用。本组件是**有结构语义的名片**（姓名/职位/handle/状态/联系按钮 + 底部毛玻璃信息条）；只要一张通用图片做指针倾斜用 [TiltedCard](../tilted-card/tilted-card.md)，要悬停像素动画卡用 [PixelCard](../pixel-card/pixel-card.md)。

## 导入
```ts
import { ProfileCard } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| avatarUrl | `string` | — | 头像地址，未提供时回退为姓名首字母占位块（不引外链） |
| name | `string` | `"瑚琏"` | 姓名，底部主标题；无头像时据此生成首字母占位 |
| title | `string` | `"前端工程师"` | 职位/副标题，姓名下方 |
| handle | `string` | `"hulianui"` | 用户 handle（@xxx），底部信息条左侧 |
| status | `string` | `"在线"` | 状态文案，handle 下方 |
| contactText | `string` | `"联系"` | 联系按钮文案 |
| showUserInfo | `boolean` | `true` | 是否显示底部毛玻璃信息条（handle/状态/联系按钮） |
| onContactClick | `() => void` | — | 点击联系按钮回调 |
| enableTilt | `boolean` | `true` | 是否开启指针倾斜 + 全息光泽；关闭后为静态卡；reduced-motion 自动降级静态 |
| glowColor | `string` | `var(--color-chart-1)` | 全息高光主色，须用带 `--color-` 前缀的 token，也可传任意 CSS 颜色 |
| aspectRatio | `number` | `0.74` | 卡片宽高比（width/height），默认接近实体卡 |
| children | `ReactNode` | — | 自定义卡片正面叠加内容（头像层之上、信息条之下） |
| className | `string` | — | 透传到根容器的额外 className |
| style | `CSSProperties` | — | 透传到根容器的内联样式 |

## 示例
```tsx
// 最小用法：无头像自动落首字母占位
<ProfileCard name="林屿" title="独立开发者" handle="linyu" />

// 自定义光晕 + 状态 + 联系回调
<ProfileCard
  name="苏晚"
  title="产品设计师"
  handle="suwan"
  status="忙碌"
  glowColor="var(--color-chart-3)"
  onContactClick={() => router.push("/contact")}
/>
```

## 禁忌 / 坑

- [[hulian-token-color-var-needs-color-prefix]]：`glowColor` 须用 `var(--color-chart-1)` 等带 `--color-` 前缀的真名，裸 `var(--chart-1)` / `var(--primary)` 在 Tailwind v4 下不解析、全息高光失色。
- 纯 RAF 弹簧零依赖，无 WebGL；`enableTilt={false}` 或 reduced-motion 下退化为静态卡（仍有渐变与信息条），不要依赖倾斜传递信息。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
