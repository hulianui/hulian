---
"@hulianui/ui": patch
---

`ImageViewer` 滚轮缩放修三条：StrictMode 下位移复利、浮层顶部条/缩略图条漏掉 wheel（捏合会缩放宿主页面）、以及「挂载时就是 open」这条路上监听根本没绑（#223）。

**1. 位移被算两次（正确性）。** 旧实现在 `setScale` 的 updater 内部派发 `setOffset`，而后者依赖前值。React 要求 updater 是纯函数，StrictMode 的 dev 检查正是靠**调用两次 updater** 来发现非纯性——于是第二遍在第一遍的结果上再乘一次 `ratio`：位移不是翻倍，是**复利**，滚三四格图就跑到视口外，只能关掉重开。消费方实测同一格滚轮期望 `translate(-40px, -20px)`、实际拿到 `translate(-96px, -47.5px)`。生产构建不双调用所以线上不显现，但那是运气不是正确性。

改法是把缩放与平移合成**一个 state**（它们本来就是一起变的：围绕锚点缩放必然同时改 offset），用一个纯 updater 一次算完，双调用等幂。`zoomBy` / 双击 / 拖拽平移里的嵌套 `setOffset` 一并收掉。

**2. 顶部条与缩略图条上的 wheel 没人管。** 监听只挂在中间的舞台上，而浮层是 `flex-col`：顶部条（约 60px）与多图时的缩略图条都在舞台之外。在这两条上触控板捏合（`ctrlKey` + wheel）不被 `preventDefault`，浏览器就按原生行为缩放**整个宿主页面**——侧栏、表格、顶栏一起变大位移，用户看到的是「连不是图片的地方也被放大飞了」，很容易误判成组件把 transform 加错了元素。这条 dev 和生产都有。

监听改挂整个浮层（`fixed inset-0` + `aria-modal`，背后页面本来已被 `body.overflow=hidden` 锁住）。**唯一的例外是缩略图条**：它自己是 `overflow-x-auto` 要横向滚，所以那里普通滚轮放行、只吃掉捏合——整层无差别 `preventDefault` 会把它的滚动一起吃掉，那是修一个 bug 造一个。指针落在舞台外时缩放锚点退回舞台中心：拿一个舞台外的点当不动点会把图直接甩出可视区。

**3. 「挂载时就是 open」时监听根本没绑（写测试时连带发现）。** 滚轮与焦点两个 effect 的依赖都只有 `[open]`，而首帧 `mounted=false` 时组件 `return null`、两个 ref 都还是 `null`，effect 只在 ref 为空时跑了一次；随后 `mounted` 翻真触发的重渲染不会让它重跑。于是 `{show && <ImageViewer open … />}` 这种写法下滚轮缩放与「焦点移入浮层」双双静默失效——只有先挂载再把 `open` 从 `false` 翻成 `true` 才碰巧正常，所以一直没人发现。两个 effect 的依赖补上 `mounted`。
