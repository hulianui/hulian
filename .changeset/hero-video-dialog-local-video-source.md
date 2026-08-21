---
"@hulianui/ui": minor
---

HeroVideoDialog 支持自托管视频文件，演示素材去外链（#305）

- 新增 `videoType`（`"auto"`（默认）/ `"embed"` / `"video"`）：`"video"` 时弹层里挂原生 `<video>`（缩略图自动当 poster、带 controls / autoPlay / playsInline），`"embed"` 仍走 iframe；`"auto"` 按 `videoSrc` 扩展名判别（`.mp4` / `.webm` / `.ogv` / `.ogg` / `.mov` / `.m4v` 判为 `"video"`，其余判为 `"embed"`）。既有只传 embed 地址的用法行为不变。HLS（`.m3u8`）刻意不参与自动判别 —— 多数浏览器原生放不动，要放 HLS 请用 Video 播放器组件。
- showcase 的演示视频从写死的 YouTube embed 换成文档站本地素材（`demoAsset("/demo/sample-video.mp4")`），墙内 / 断网 / 内网打开文档站时弹层不再是空白。
