---
slug: chrome
name: Chrome
category: mockups
group: window
tags: []
exports: [Chrome]
status: enriched
---

# Chrome

> 浏览器外壳 · 标签页+工具栏(前进/后退/刷新+地址栏)包裹截图 + RSC · mockups/window

## 何时用

把网页截图 / live 内容包进一个 Chrome 风格窗口框，带标签页标题和前进/后退/刷新工具栏，比 Safari 信息更丰富，适合强调「浏览器内运行」的产品截图。只要红绿灯+地址栏的极简框用 [Safari](../safari/safari.md)，命令行风格用 [Terminal](../terminal/terminal.md)，移动端机身用 [iPhone](../iphone/iphone.md)/[Android](../android/android.md)/[Tablet](../tablet/tablet.md)。

## 导入
```ts
import { Chrome } from "@hulianui/ui"
```

## Props

继承 `ComponentPropsWithoutRef<"div">`（`className`、`style` 等照常透传，常用 `style={{ width }}` 控宽）。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| url | `string` | `"hulian.design"` | 地址栏文本。 |
| title | `string` | 取 url | 标签页标题。 |
| imageSrc | `string` | — | 内容区图片地址，优先于 children。 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 内容区自定义节点（imageSrc 未传时渲染）。 |

## 示例
```tsx
<Chrome url="hulian.design" title="瑚琏 Hulian" style={{ width: 375 }}>
  <img src="/screenshot.png" />
</Chrome>
```

## 禁忌 / 坑

- 纯展示外壳，不带宽度默认值，需自行用 `style={{ width }}` 或 className 控制尺寸，否则塌缩到内容宽。
- `imageSrc` 与 `children` 同传时 `imageSrc` 优先，children 被忽略。

## 相关
[Safari](../safari/safari.md) · [Terminal](../terminal/terminal.md) · [iPhone](../iphone/iphone.md) · [Android](../android/android.md) · [Tablet](../tablet/tablet.md) · [Watch](../watch/watch.md)
