---
slug: watch
name: Watch
category: mockups
group: device
tags: []
exports: [Watch, WATCH_MODELS]
status: enriched
---

# Watch

> 手表外壳 · Apple Watch 系 squircle 表壳+数码表冠(model 预设尺寸) + RSC · mockups/device

## 何时用

需要把表盘内容（截图或自渲染 UI）放进 Apple Watch 风格的设备外壳里展示时用。配套 [iPhone](../iphone/iphone.md) / [Tablet](../tablet/tablet.md) 等设备框：手机/平板用对应组件，手表场景用本组件。

## 导入
```ts
import { Watch, WATCH_MODELS } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `model` | `"ultra-49" \| "series-45" \| "se-44" \| "series-41"` | `"se-44"`（无 width 且无 model 时按 184px） | 预设机型，决定默认表壳宽度 |
| `width` | `number` | model 预设宽度，否则 184 | 表壳宽度 px；显式传入时优先于 model |
| `imageSrc` | `string` | — | 表盘内容图片地址，优先于 children |

> 继承 `ComponentPropsWithoutRef<"div">`（className、style 等可透传）。`WATCH_MODELS` 导出各机型对应的表壳宽度映射（ultra-49→210、series-45→190、se-44→184、series-41→172）。

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| `children` | `ReactNode` | 表盘内容（imageSrc 未传时渲染） |

## 示例
```tsx
<Watch model="series-45">
  <img src="/face.png" />
</Watch>
```

## 禁忌 / 坑
暂无已知坑。设备外壳为纯展示组件（RSC 可用），imageSrc 与 children 同时存在时 imageSrc 胜出。

## 相关
[iPhone](../iphone/iphone.md) · [Android](../android/android.md) · [Tablet](../tablet/tablet.md) · [Safari](../safari/safari.md) · [Chrome](../chrome/chrome.md) · [Terminal](../terminal/terminal.md)
