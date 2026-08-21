---
slug: android
name: Android
category: mockups
group: device
tags: []
exports: [Android, ANDROID_MODELS]
status: enriched
---

# Android

> 用带打孔摄像头的安卓手机外壳包住内容 · mockups/device

## 何时用

把 App 截图 / 移动端页面包进 Android 机身（打孔摄像头）框做展示，覆盖 Pixel / Galaxy 系机型。要 iPhone 灵动岛机身用 [iPhone](../iphone/iphone.md)，要平板用 [Tablet](../tablet/tablet.md)，要浏览器窗口框用 [Safari](../safari/safari.md)/[Chrome](../chrome/chrome.md)。

## 导入
```ts
import { Android, ANDROID_MODELS } from "@hulianui/ui"
```

## Props

继承 `ComponentPropsWithoutRef<"div">`。`ANDROID_MODELS` 导出机型→宽度映射常量。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| model | `"pixel-9-pro-xl" \| "pixel-9-pro" \| "pixel-9" \| "galaxy-s24-ultra" \| "galaxy-s24"` | `"pixel-9-pro"`(showcase) | 预设机型，决定默认宽度。 |
| width | `number` | model 预设，无 model 则 `280` | 设备宽度(px)，显式传入时优先于 model。 |
| imageSrc | `string` | - | 屏幕内容图片地址，优先于 children。 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 屏幕内容自定义节点。 |

## 示例
```tsx
<Android model="pixel-9-pro">
  <img src="/app.png" />
</Android>
```

## 禁忌 / 坑

- **机身高度由内屏比例 + 边框反推，不写死 `aspectRatio`**。边框是固定 px 而内屏随宽度缩放，所以机身比例并不是常数——同一台设备画成 280px 宽和 360px 宽，机身比例不一样。写死一个比例必然在某些宽度下让内屏比例偏掉，[PreviewSandbox](../preview-sandbox/preview-sandbox.md) 的 `fit` 缩放就会在短边留一圈白（#117）。内屏逻辑分辨率与边框宽度的真源是 `lib/device-metrics`，单测锁住「内屏比例恒等于 `screen` 比例」这层关系。

- `model` / `width` 只改机身宽度；高度随之按内屏比例推导，所以纵横比会随宽度略有变化（这是正确的——边框不缩放）。
- `imageSrc` 与 `children` 同传时 `imageSrc` 优先。

## 相关
[iPhone](../iphone/iphone.md) · [Tablet](../tablet/tablet.md) · [Watch](../watch/watch.md) · [Safari](../safari/safari.md) · [Chrome](../chrome/chrome.md) · [Terminal](../terminal/terminal.md)
