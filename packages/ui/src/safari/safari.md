---
slug: safari
name: Safari
category: mockups
group: window
tags: []
exports: [Safari]
status: enriched
---

# Safari

> 浏览器外壳 · 顶栏红绿灯+地址栏包裹截图 + RSC · mockups/window

## 何时用

把网页截图 / live 内容包进一个 macOS Safari 风格的窗口框，用于落地页展示、文档配图。它只有红绿灯+地址栏的极简顶栏；要带标签页 + 前进/后退/刷新工具栏用 [Chrome](../chrome/chrome.md)，要命令行风格用 [Terminal](../terminal/terminal.md)，要手机/平板机身用 [iPhone](../iphone/iphone.md)/[Tablet](../tablet/tablet.md)。

## 导入
```ts
import { Safari } from "@hulianui/ui"
```

## Props

继承 `ComponentPropsWithoutRef<"div">`（`className`、`style` 等照常透传，常用 `style={{ width }}` 控宽）。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| url | `string` | `"hulian.design"` | 地址栏文本。 |
| imageSrc | `string` | — | 内容区图片地址，优先于 children。 |
| children | `ReactNode` | — | 内容区自定义节点（imageSrc 未传时渲染）。 |

## 示例
```tsx
<Safari url="hulian.design" style={{ width: 375 }}>
  <img src="/screenshot.png" />
</Safari>
```

## 禁忌 / 坑

- 纯展示外壳，不带宽度默认值，需自行用 `style={{ width }}` 或 className 控制尺寸，否则塌缩到内容宽。
- `imageSrc` 与 `children` 同传时 `imageSrc` 优先，children 被忽略。

## 相关
[Chrome](../chrome/chrome.md) · [Terminal](../terminal/terminal.md) · [iPhone](../iphone/iphone.md) · [Android](../android/android.md) · [Tablet](../tablet/tablet.md) · [Watch](../watch/watch.md)
