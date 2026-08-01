---
slug: infinite-menu
name: InfiniteMenu
category: data-display
group: collection
tags: [animated]
exports: [InfiniteMenu]
status: enriched
---

# InfiniteMenu

> 球面菜单 · 可拖拽旋转的菜单球，菜单项围绕球面分布、正对镜头者贴靠为激活项并显覆盖层标题/描述+动作箭头 · 松手惯性衰减 + 自动自旋（零依赖 CSS-3D/RAF·reduced-motion） · data-display/collection · #animated

## 何时用

把一组导航入口/画廊项做成可拖拽探索的球面菜单（创意首页、作品集导航）时用。要的是"球面分布 + 拖拽旋转 + 贴靠激活"的探索式导航用本组件；只展示一组海报飞行长廊用 [FlyingPosters](../flying-posters/flying-posters.md)，单卡 3D 倾斜用 [TiltedCard](../tilted-card/tilted-card.md)。

## 导入
```ts
import { InfiniteMenu } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items | `InfiniteMenuItem[]` | `[]` | 菜单项数组，沿球面 Fibonacci 均匀分布；正对镜头的项为激活项并在覆盖层显其标题/描述。空数组渲占位球 |
| scale | `number` | `1` | 球体缩放系数，越大球越近、单卡越大 |
| itemSize | `number` | `88` | 单张卡片直径（px） |
| autoRotate | `number` | `6` | 自动旋转角速度（度/秒，绕 Y 轴），0 关闭；拖拽时暂停，松手惯性衰减后恢复；reduced-motion 下强制为 0 |
| className | `string` | — | 透传到根容器的额外类名 |
| style | `CSSProperties` | — | 透传到根容器的内联样式 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onActiveItemChange | `(item: InfiniteMenuItem, index: number) => void` | 激活项变化回调（拖拽停止贴靠到最前项后触发） |
| onItemActivate | `(item: InfiniteMenuItem, index: number) => void \| false` | 点击激活项动作箭头回调，返回 `false` 阻止默认 `window.open` |

`InfiniteMenuItem`：`{ image?: string; title?: string; description?: string; link?: string }` —— `link` 以 http 开头则 `window.open` 新标签，否则交给 `onItemActivate` 处理；`image` 省略时仅显示标题首字。

## 示例
```tsx
const items = [
  { title: "概览", description: "项目全局视图", link: "https://example.com" },
  { title: "任务", description: "进行中的工作流" },
  { title: "成员", description: "团队与权限" },
];

// 根容器需有固定尺寸，组件填满
<div className="relative h-80 w-full overflow-hidden rounded-xl">
  <InfiniteMenu items={items} />
</div>

// 关闭自动旋转，仅拖拽
<InfiniteMenu items={items} autoRotate={0} />
```

## 禁忌 / 坑

- 根容器需有明确尺寸（球按容器测量布局），否则球不可见或塌缩。
- `link` 不以 http 开头时**不会自动跳转**，须自行在 `onItemActivate` 里处理（如 `router.push`）。
- 纯 CSS-3D + RAF 零依赖，但仍是交互动效组件：reduced-motion 下自动停自旋；headless 截图可能停在某一帧，验交互态用真实浏览器。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
