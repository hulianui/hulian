---
slug: live-player
name: LivePlayer
category: data-display
group: collection
tags: []
exports: [LivePlayer]
status: enriched
---

# LivePlayer

> 直播播放器壳 · 自带极简 muted/loop/autoPlay video(非 VOD scrubber chrome·与 Video 互补) 或 surface 自定义画面 + LIVE 呼吸徽标(ping 红点) + 在线人数(dogfood NumberTicker 跳数) + 清晰度切换菜单 + 主播条(头像/名/关注钮) + overlay 弹幕飘心层与 footer 互动栏插槽 + 竖/横屏(9:16 / 16:9) · data-display/collection

## 何时用

直播间播放器外壳：极简无进度条 chrome + LIVE 徽标/在线数/清晰度/主播条/弹幕飘心层/互动栏。要带进度条拖拽的点播播放器用 [Video](../video/video.md)；本组件专为「直播」语义（无 scrubber、强调 LIVE 与互动叠层）。`overlay` 常配 [Danmaku](../danmaku/danmaku.md)，footer 常配互动栏。

## 导入
```ts
import { LivePlayer } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| src | `string` | — | 本地视频源（内部固定 muted/loop/autoPlay/playsInline） |
| poster | `string` | — | 视频封面 |
| surface | `ReactNode` | — | 自定义画面（程序化场景等）；存在时优先于 `src` |
| live | `boolean` | `true` | 显示 LIVE 呼吸徽标 |
| viewers | `number` | — | 在线人数（NumberTicker 跳数） |
| qualities | `string[]` | — | 清晰度档位列表 |
| quality | `string` | — | 当前清晰度（受控） |
| onQualityChange | `(q: string) => void` | — | 切换清晰度回调 |
| host | `LivePlayerHost` | — | 顶部主播条 |
| orientation | `"portrait" \| "landscape"` | `"landscape"` | 朝向 |
| overlay | `ReactNode` | — | 画面之上、操作条之下的覆盖层（弹幕/飘心/礼物） |
| footer | `ReactNode` | — | 底部互动栏插槽 |
| aspectRatio | `string` | — | CSS aspect-ratio；不传按 orientation（landscape=16/9，portrait=9/16），传 `"fill"` 则不锁比例铺满父容器 |
| className | `string` | — | 容器自定义类 |

`LivePlayerHost`：`{ name: string; avatar?: string; followed?: boolean; onFollow?: () => void; meta?: ReactNode }`（不传 `onFollow` 则不显示关注钮）。

## 示例
```tsx
<LivePlayer
  src="/stream.mp4"
  viewers={12840}
  qualities={["蓝光", "超清", "高清"]}
  quality={quality}
  onQualityChange={setQuality}
  host={{ name: "主播阿楠", meta: "粉丝 28.6w", followed, onFollow: () => setFollowed(true) }}
  overlay={<Danmaku items={items} />}
  footer={<InteractionBar />}
/>
```

## 禁忌 / 坑

- `quality` 是受控的：传了 `quality` 就必须配 `onQualityChange` 回写，否则菜单选了不变。
- 关注钮以 `host.onFollow` 是否存在决定显隐——纯展示场景不传即可隐藏。
- `surface` 优先于 `src`：两者都传时只渲染 `surface`（用于程序化/Canvas 画面）。
- 内置 `<video>` 固定 muted/autoPlay/loop/playsInline，不暴露播放控制；要进度条/音量等点播 chrome 请改用 Video。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
