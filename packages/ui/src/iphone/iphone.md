---
slug: iphone
name: iPhone
category: mockups
group: device
tags: []
exports: [IPhone, IPHONE_MODELS]
status: enriched
---

# iPhone

> 手机外壳 · 灵动岛机身包裹屏幕(token themeable) + RSC · mockups/device

## 何时用

把 App 截图 / 移动端页面包进 iPhone 机身（灵动岛）框做展示，落地页、AppStore 配图常用。要安卓打孔屏机身用 [Android](../android/android.md)，要平板用 [Tablet](../tablet/tablet.md)，要浏览器窗口框用 [Safari](../safari/safari.md)/[Chrome](../chrome/chrome.md)。

## 导入
```ts
import { IPhone, IPHONE_MODELS } from "@hulianui/ui"
```

## Props

继承 `ComponentPropsWithoutRef<"div">`。`IPHONE_MODELS` 导出机型→宽度映射常量。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| model | `"16-pro-max" \| "16-pro" \| "16-plus" \| "16" \| "15-pro" \| "13-mini"` | `"15-pro"`(showcase) | 预设机型，决定默认宽度。 |
| width | `number` | model 预设，无 model 则 `280` | 设备宽度(px)，显式传入时优先于 model。 |
| imageSrc | `string` | — | 屏幕内容图片地址，优先于 children。 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 屏幕内容自定义节点。 |

## 示例
```tsx
<IPhone model="15-pro">
  <img src="/app.png" />
</IPhone>
```

## 禁忌 / 坑

- 机身比例由组件内 `aspectRatio` 统一固定，`model`/`width` 只改宽度不改纵横比；想要别的比例需自行外层裁切。
- `imageSrc` 与 `children` 同传时 `imageSrc` 优先。

## 相关
[Android](../android/android.md) · [Tablet](../tablet/tablet.md) · [Watch](../watch/watch.md) · [Safari](../safari/safari.md) · [Chrome](../chrome/chrome.md) · [Terminal](../terminal/terminal.md)
