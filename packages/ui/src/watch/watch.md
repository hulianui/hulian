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

> 用智能手表外壳包住紧凑内容做展示 · mockups/device

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
| `imageSrc` | `string` | - | 表盘内容图片地址，优先于 children |

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

- **机身高度由内屏比例 + 边框反推，不写死 `aspectRatio`**。边框是固定 px 而内屏随宽度缩放，所以机身比例并不是常数——同一台设备画成 280px 宽和 360px 宽，机身比例不一样。写死一个比例必然在某些宽度下让内屏比例偏掉，[PreviewSandbox](../preview-sandbox/preview-sandbox.md) 的 `fit` 缩放就会在短边留一圈白（#117）。内屏逻辑分辨率与边框宽度的真源是 `lib/device-metrics`，单测锁住「内屏比例恒等于 `screen` 比例」这层关系。
暂无已知坑。设备外壳为纯展示组件（RSC 可用），imageSrc 与 children 同时存在时 imageSrc 胜出。

## 相关
[iPhone](../iphone/iphone.md) · [Android](../android/android.md) · [Tablet](../tablet/tablet.md) · [Safari](../safari/safari.md) · [Chrome](../chrome/chrome.md) · [Terminal](../terminal/terminal.md)
