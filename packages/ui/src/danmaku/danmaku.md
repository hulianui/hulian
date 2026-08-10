---
slug: danmaku
name: Danmaku
category: data-display
group: collection
tags: [animated]
exports: [Danmaku, allocateTrack, densityGap, estimateWidth, leastBusyTrack, scrollDuration, trackFreeTime]
status: enriched
---

# Danmaku

> 弹幕引擎 · 轨道分配防重叠(等速模型·第二条入场后发车永不追尾) · scroll 滚动/top 顶部/bottom 底部三模式 + 轨道数/速度/密度(low/normal/high)/占屏比/透明度/暂停 + pointer-events none 穿透到底层视频 · 几何抽纯函数(allocateTrack/scrollDuration/estimateWidth)带单测 · 直播旗舰 · data-display/collection · #animated

## 何时用

直播/视频画面上覆盖飘动弹幕。绝对定位铺满父容器且 pointer-events 穿透，配合 [LivePlayer](../live-player/live-player.md) 的 `overlay` 插槽使用。要弹幕就用本组件；要消息列表/公屏滚动用 [LiveChat](../live-chat/live-chat.md)。

## 导入
```ts
import { Danmaku, allocateTrack, densityGap, estimateWidth, leastBusyTrack, scrollDuration, trackFreeTime } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items* | `DanmakuItem[]` | — | 受控弹幕流，只增不改既有项；新增项自动入场（内部按 `item.id` 去重，仅对未上屏的入场） |
| tracks | `number` | `4` | 滚动轨道数 |
| speed | `number` | `100` | 滚动速度 px/s |
| density | `"low" \| "normal" \| "high"` | `"normal"` | 密度：决定轨道安全间隙 + 无空闲轨道时是否强挤 |
| area | `number` | `1` | 弹幕占用容器高度比 0–1，1=满屏 |
| opacity | `number` | `1` | 整体不透明度 |
| paused | `boolean` | `false` | 暂停所有动画 |
| className | `string` | — | 容器自定义类 |

`DanmakuItem`

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| id * | `string` | — | 去重键：内部按它判断该条是否已上屏，只对未上屏的做入场 |
| text * | `ReactNode` | — | 弹幕内容 |
| mode | `"scroll" ｜ "top" ｜ "bottom"` | `"scroll"` | 滚动 / 顶部悬停 / 底部悬停 |
| color | `string` | 继承前景 token | 文字色 |
| size | `"sm" ｜ "md" ｜ "lg"` | `"md"` | 字号档 |
| bold | `boolean` | `false` | 加粗 |

## 示例
```tsx
<div className="relative aspect-video">
  <video src="/stream.mp4" muted autoPlay loop className="absolute inset-0 h-full w-full" />
  <Danmaku items={items} tracks={4} speed={100} density="normal" />
</div>
```

`items` 为受控数组，只追加不修改既有项即可让新弹幕入场：
```tsx
setItems((p) => [...p.slice(-60), { id: `d${i}`, text: "前排围观", mode: "scroll" }]);
```

## 禁忌 / 坑

- `items` 是只增受控流：组件内部记录已上屏 id，**只对「新增且未上屏」的项入场**。改写既有项不会重新触发动画；要让同一条再飞一次须换新 `id`。
- 长直播务必裁剪 `items`（如 `slice(-60)`），否则数组无限膨胀；组件只对新项做动画，旧项留在数组不影响渲染但占内存。
- 组件铺满父容器且 `pointer-events: none` 穿透，父容器需 `position: relative` + `overflow: hidden`。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
