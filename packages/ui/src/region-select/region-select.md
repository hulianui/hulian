---
slug: region-select
name: RegionSelect
category: forms
group: advanced
tags: []
exports: [RegionSelect, toImagePoint, normalizeBox, applyAspect, boxMinSide, roundBox, strokeWidthFor]
status: enriched
---

# RegionSelect

> 图上框选回坐标 · 拖框拿回**原图像素** [x1,y1,x2,y2](区别 ImageCropper 出 Blob) · 反向拖规范化 + minSide 滤误点 + aspect 固定比例(撞边界整体缩不破比例) + boxes 只读其它框带标注 + maxHeight 内滚 · SVG viewBox 打底画框零换算，只有指针→图像素一个方向折算(纯函数可测) · 自然尺寸自量、量到前不画框 · touch-none 防触屏滚页 + setPointerCapture 后置 try/catch + 描边按图宽 · 题库配图/文档标注/OCR 纠错/热区/打码 · forms/advanced

## 何时用

需要把「图上的一块区域」**存下来**：题库配图纠错、文档标注、OCR 纠错框、截图打码、商品热区、缺陷标注。

和 [ImageCropper](../image-cropper/image-cropper.md) 的分工是**产物不同，不能互相顶替**：ImageCropper 出的是裁好的位图（`onCropped(blob)`），本组件出的是**坐标**。存「原页 + 框」的引用时，框错了只需重拖一下，裁死了就得推倒重来；裁图交给服务端按框现渲，永远与框一致。反过来，只要一张裁好的图、不关心它在原图哪个位置，就用 ImageCropper。

## 导入
```ts
import { RegionSelect, type RegionBox } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| src* | `string` | - | 底图地址 |
| value | `RegionBox \| null` | - | 当前框（原图像素 `[x1,y1,x2,y2]`），受控 |
| onChange | `(box: RegionBox) => void` | - | 拖完一次给一个**规范化**且**已取整**的框（反向拖也成立） |
| onDrafting | `(box: RegionBox \| null) => void` | - | 拖拽过程中的实时框（**浮点**，不受 `round` 影响），结束回 `null` |
| round | `"expand" \| "nearest" \| "none"` | `"expand"` | 出口取整方式：`expand` 左上 floor、右下 ceil（不缩小框）；`nearest` 四舍五入；`none` 保留浮点 |
| minSide | `number` | `8` | 误点阈值：框短边小于它（原图像素）不触发 onChange。判定在取整**之后** |
| boxes | `{ box, color?, label?, id? }[]` | - | 只读的其它框（虚线 + 标注），同页多图时一并显示 |
| aspect | `number` | - | 固定宽高比（宽/高）；不传则自由框选 |
| naturalSize | `{ width, height }` | - | 已知的原图尺寸；不传则组件用 `new Image()` 自己量 |
| maxHeight | `string \| number` | `"60vh"` | 超高图的内部滚动上限 |
| color | `string` | `"primary"` | 主框描边色（语义色名 / 任意 CSS 色） |
| readOnly | `boolean` | `false` | 不响应拖拽，仍显示已有框 |
| placeholder | `ReactNode` | `"载入图片…"` | 量到自然尺寸前的占位 |
| errorPlaceholder | `ReactNode` | `"图片加载失败"` | 底图取不到（404/403/跨域/网络）时的占位 |
| onError | `(event: unknown) => void` | - | 底图加载失败回调（预读与画布 `<image>` 共用同一出口） |
| alt | `string` | `""` | 画布的无障碍名 |

### 纯函数（已导出）

`toImagePoint(clientX, clientY, rect, w, h)` 指针→图像素（含钳位）· `normalizeBox(a, b)` 两点→规范化框 · `applyAspect(anchor, point, aspect, w, h)` 按比例修正 · `boxMinSide(box)` · `roundBox(box, mode?)` 出口取整 · `strokeWidthFor(w)`。自己画框但不想重写这套算术时直接用。

## 示例
```tsx
const [box, setBox] = useState<RegionBox | null>(null)

<RegionSelect
  src={pageUrl}
  value={box}
  onChange={setBox}
  boxes={others}          // 同页已有的框，只读
  maxHeight="60vh"
/>
// 存库：box 就是原图像素，直接喂给服务端裁图接口
```

## 禁忌 / 坑

这几条是踩过才知道要写进组件的，消费方不必再踩：

- **坐标系只有原图像素**，不是容器像素也不是百分比——存进库的必须能直接喂给服务端裁图。内部用 `<svg viewBox="0 0 naturalW naturalH">` 打底，画框零换算，只有「指针 → 图像素」一个方向按 `getBoundingClientRect()` 折算。
- **自然尺寸量到之前不画任何框**：拿上一张图的比例摆框，位置一定是错的。已知尺寸（库里存着）就传 `naturalSize`，省一次预读，也让 SSR/测试环境不必等图解码。
- **出口坐标是整数，内部预览是浮点**。像素是可数的格子：落库（`list[int]` 之类的列约束）、服务端裁图（PIL / OpenCV / sharp 的 crop 都要整数，各自的隐式取整方向还不一致，会差一两像素且没人解释得清）、`box === savedBox` 这种「有没有改过」的判断，三处都吃不下浮点。默认 `round="expand"`（左上 floor、右下 ceil）而不是 `nearest`——**取整不缩小框**，否则一个刚好拖够 `minSide` 的框会被收成 `minSide - 1`，症状是「拖了没反应」。`minSide` 的判定也因此放在取整之后。
  - 这个缺陷**极容易漏测**：缩放恰好 1:1 或整数倍时坐标本就落在整数上。自己写测试请用除不尽的比例（库内用的是 756→396）。
- **`setPointerCapture` 放在拖拽状态落地之后并 try/catch**：合成 PointerEvent（Playwright / 单测 dispatch）下它会抛，先捕获就把整个 handler 中断，拖拽根本起不来。
- 画布带 `touch-none`，否则触屏上「拖框」变成「滚页面」。
- 描边宽度按图宽给（`max(2, naturalW/400)`）：3000px 宽的扫描页上 2px 的线细到看不见。
- **「正在载入」和「这张图根本取不到」必须长得不一样**：底图 404 / 403 / 签名过期 / 跨域失败时组件进失败态，渲染 `errorPlaceholder` 并触发 `onError`，而不是一直停在 `placeholder` 让人干等。后端按需渲染的底图（页图还没推到当前环境、签名 URL 过期、权限不足、资源被删）这不是边缘情况，是常态。预读与画布 `<image>` 共用同一个失败状态——中途鉴权过期只让 SVG 那次请求失败时同样有出口。`src` 变化会复位失败态。
- **键盘/读屏无法直接拖框**（这是画布类交互的共性）。要可达就在旁边配四个数字输入框读写同一个 `value`，组件是受控的，两边同源。

## 相关
[ImageCropper](../image-cropper/image-cropper.md) · [ImageViewer](../image-viewer/image-viewer.md) · [Image](../image/image.md) · [Annotation](../annotation/annotation.md) · [Flow](../flow/flow.md)
