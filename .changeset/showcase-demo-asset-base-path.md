---
"@hulianui/ui": patch
---

showcase 的演示素材路径接上文档站 basePath：新增内部 `lib/demo-asset.ts`，`Avatar` / `AvatarCircles` / `User` / `Image` / `Lens` / `QRCode` / `HeroVideoDialog` / `Video` / `LivePlayer` 九个 showcase 里的 `/demo/*` 改经 `demoAsset()` 取值。此前它们硬写站点绝对路径，而文档站是双语双构建 —— 英文站挂根路径、中文站挂 `/zh`，public 下的素材跟着 basePath 走，于是中文站请求的 `/demo/avatar-1.jpg` 落进了英文站的命名空间。两语言同域部署时它恰好还能取到（英文站占根），但那是巧合：`next dev` 起中文站单站时这些图全 404，中文站若单独部署（桌面壳 / 只发一个语言的镜像）同样全断。示例代码块里的路径保持 `/demo/...` 原样，那是给消费方看的示意值，不该带上本站前缀。
