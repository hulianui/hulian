---
slug: tablet
name: Tablet
category: mockups
group: device
tags: []
exports: [Tablet, TABLET_MODELS]
status: enriched
---

# Tablet

> 平板外壳 · iPad 系机身(model 预设尺寸/比例·token themeable) + RSC · mockups/device

## 何时用

把 App / 网页截图包进 iPad 系平板机身框做展示，覆盖 iPad Pro / Air / mini 系机型（各机型纵横比不同）。要手机机身用 [iPhone](../iphone/iphone.md)/[Android](../android/android.md)，要浏览器窗口框用 [Safari](../safari/safari.md)/[Chrome](../chrome/chrome.md)。

## 导入
```ts
import { Tablet, TABLET_MODELS } from "@hulianui/ui"
```

## Props

继承 `ComponentPropsWithoutRef<"div">`。`TABLET_MODELS` 导出机型→`{ width, aspectRatio }` 映射常量。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| model | `"ipad-pro-13" \| "ipad-pro-11" \| "ipad-air-11" \| "ipad-10" \| "ipad-mini"` | `"ipad-pro-11"`(showcase) | 预设机型，决定默认宽度与机身比例。 |
| width | `number` | model 预设，无 model 则 `320` | 设备宽度(px)，显式传入时优先覆盖宽度。 |
| imageSrc | `string` | — | 屏幕内容图片地址，优先于 children。 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 屏幕内容自定义节点。 |

## 示例
```tsx
<Tablet model="ipad-pro-11">
  <img src="/app.png" />
</Tablet>
```

## 禁忌 / 坑

- **机身高度由内屏比例 + 边框反推，不写死 `aspectRatio`**。边框是固定 px 而内屏随宽度缩放，所以机身比例并不是常数——同一台设备画成 280px 宽和 360px 宽，机身比例不一样。写死一个比例必然在某些宽度下让内屏比例偏掉，[PreviewSandbox](../preview-sandbox/preview-sandbox.md) 的 `fit` 缩放就会在短边留一圈白（#117）。内屏逻辑分辨率与边框宽度的真源是 `lib/device-metrics`，单测锁住「内屏比例恒等于 `screen` 比例」这层关系。

- 与 iPhone/Android 不同：各代 iPad 纵横比确实不同，所以**显式传了 `model` 时**机身比例由该机型的 `aspectRatio` 决定，`width` 只覆盖宽度。不传 `model` 的缺省档才走「内屏比例 + 边框反推」——[PreviewSandbox](../preview-sandbox/preview-sandbox.md) 从不传 model，走的正是这条。
- `imageSrc` 与 `children` 同传时 `imageSrc` 优先。

## 相关
[iPhone](../iphone/iphone.md) · [Android](../android/android.md) · [Watch](../watch/watch.md) · [Safari](../safari/safari.md) · [Chrome](../chrome/chrome.md) · [Terminal](../terminal/terminal.md)
