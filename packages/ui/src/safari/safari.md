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
| headerExtra | `ReactNode` | — | 顶栏右端的工具入口（分享/下载这类）。不传时该格是让地址胶囊居中的 `w-12` 占位，尺寸逐字节不变；传了就让出该格，宽度下限锁在占位宽。见下方「活内容」 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 内容区自定义节点（imageSrc 未传时渲染）。 |

## 示例
```tsx
<Safari url="hulian.design" style={{ width: 375 }}>
  <img src="/screenshot.png" />
</Safari>
```

## 禁忌 / 坑

- 纯展示外壳，不带宽度默认值，需自行用 `style={{ width }}` 或 className 控制尺寸，否则塌缩到内容宽。
- `imageSrc` 与 `children` 同传时 `imageSrc` 优先，children 被忽略。

### 活内容（不只服务截图）

壳的内容区在高度链上：根是列向 flex，内容区 `min-h-0 flex-1`。所以「壳撑满父容器、内容吃掉顶栏之外的剩余高度」只要在根上给高度即可 —— 内嵌真实网页、原生视图（Electron 的 `WebContentsView`）、可滚动面板都靠这条：

```tsx
<div style={{ height: 500 }}>
  <Safari url="zwfw.example.gov.cn" className="h-full" headerExtra={<DownloadButton />}>
    <div ref={viewportRef} className="h-full" />   {/* 量几何喂给主进程 setBounds */}
  </Safari>
</div>
```

截图场景不受影响：auto 高度的列向 flex 容器仍按内容定高（`min-h-0` 也不会让它塌成 0，这点已在 Chromium 实测排除）。

顶栏右端那格默认是块 `w-12` 空占位，作用是让地址胶囊相对红绿灯居中对称。`headerExtra` 传了就把它让出来，宽度下限仍锁在占位宽：内容窄于它时对称性完全保持，宽于它时该格随内容生长 —— 宁可胶囊偏一点，也不裁掉按钮。

## 相关
[Chrome](../chrome/chrome.md) · [Terminal](../terminal/terminal.md) · [iPhone](../iphone/iphone.md) · [Android](../android/android.md) · [Tablet](../tablet/tablet.md) · [Watch](../watch/watch.md)
