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

- 与 iPhone/Android 不同：平板机型纵横比各异，`aspectRatio` 由 `model` 决定；`width` 显式传入只覆盖宽度，比例仍随 model。不传 model 时回退默认宽 320 但无机型专属比例。
- `imageSrc` 与 `children` 同传时 `imageSrc` 优先。

## 相关
[iPhone](../iphone/iphone.md) · [Android](../android/android.md) · [Watch](../watch/watch.md) · [Safari](../safari/safari.md) · [Chrome](../chrome/chrome.md) · [Terminal](../terminal/terminal.md)
