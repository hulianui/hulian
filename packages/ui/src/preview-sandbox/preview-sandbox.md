---
slug: preview-sandbox
name: PreviewSandbox
category: layout
group: container
tags: []
exports: [PREVIEW_SANDBOX_DEFAULT_SANDBOX, PREVIEW_SANDBOX_DEVICES, PREVIEW_SANDBOX_MESSAGE_KEY, PREVIEW_SANDBOX_SAME_ORIGIN_SANDBOX, PreviewSandbox, bootstrapScript, buildSrcDoc, computePreviewScale, normalizeIframeMessage, normalizeReactError, resolveFrameKind, resolveViewport]
status: enriched
---

# PreviewSandbox

> 预览沙箱 · 把「隔离渲染容器 + 设备视口 + 缩放适配 + 错误捕获 + 就绪/重载生命周期」一次做对的外壳 · iframe 模式（`code` 传完整 HTML 文档串 → `srcDoc`，默认不透明源隔离，错误经注入脚本 postMessage 回传）与同文档模式（`children` 走真正的 React 错误边界）共用一副壳，**错误对象形状统一** · 切设备只改容器盒子，iframe 节点与文档都不重建 · 尺寸表/缩放系数/错误归一化全是带单测的纯函数 · **不打包不转译不装包** · layout/container

## 何时用

要在自家页面里嵌一块「别人的界面」并且不想让它影响宿主时用它：AI 生成界面的实时预览、模板/主题商店的效果预览、可视化搭建的画布区、邮件或落地页 HTML 的所见即所得。

它给的是外壳，不是执行引擎——**不打包、不转译、不装 npm 包**。`code` 的语义被钉死为「一份已经可以直接送进 iframe 的 HTML 文档串」，不是「一段待编译的 JSX」（原因见「禁忌 / 坑」第一条）。

- 只要按设备宽度做**响应式排版**、内容仍属于本应用，用 [Viewport](../viewport/viewport.md)（容器查询，不隔离、无 iframe）。
- 只要把固定设计尺寸**等比铺满**大屏，用 [FitScreen](../fit-screen/fit-screen.md)（它会放大，本组件的 `fit` 刻意不放大）。
- 只要一张**静态截图**套机身，直接用 [IPhone](../iphone/iphone.md) / [Android](../android/android.md) / [Tablet](../tablet/tablet.md)（本组件在 `showDeviceFrame` 时正是复用它们）。
- 要在预览里**点选元素**回吐路径（指向编辑），配 [ElementSelectionOverlay](../element-selection-overlay/element-selection-overlay.md)，但它要求能读到 `contentDocument` —— 见「禁忌 / 坑」的 sandbox 取舍。

## 导入
```ts
import {
  PreviewSandbox,
  PREVIEW_SANDBOX_DEFAULT_SANDBOX,
  PREVIEW_SANDBOX_DEVICES,
  PREVIEW_SANDBOX_MESSAGE_KEY,
  PREVIEW_SANDBOX_SAME_ORIGIN_SANDBOX,
  bootstrapScript,
  buildSrcDoc,
  computePreviewScale,
  normalizeIframeMessage,
  normalizeReactError,
  resolveFrameKind,
  resolveViewport,
} from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| code | string | — | iframe 模式内容：**完整 HTML 文档串**，写进 `srcDoc`。传了就走 iframe 模式 |
| children | ReactNode | — | 同文档模式内容：直接渲染的 React 子树。`code` 存在时被忽略 |
| device | "desktop" ｜ "iphone" ｜ "android" ｜ "tablet" ｜ { width, height } | "desktop" | 预览视口（预览内 `window.innerWidth` 与媒体查询看到的就是它） |
| showDeviceFrame | boolean | false | 是否套设备外框（仅三个机型档位有外框，desktop / 自由尺寸无效并开发期告警） |
| frameWidth | number | — | 设备外框机身宽度 px；不传用对应外框组件的默认宽度 |
| scale | "fit" ｜ number | "fit" | 内容缩放。`fit` 等比缩到装得下且**不放大**；给数字则原样使用 |
| sandbox | string | "allow-scripts" | iframe 的 `sandbox` 属性（默认不给 `allow-same-origin`，取舍见「禁忌 / 坑」） |
| instrument | boolean | true | 是否注入错误转发引导脚本。关掉后 iframe 内的运行时错误收不到 |
| title | string | 取自 locale | iframe 的无障碍名称；不传则跟随 ConfigProvider（内置中文兜底「预览沙箱」） |
| errorTitle | string | 取自 locale | 内置错误态标题；不传则跟随 ConfigProvider（内置中文兜底「预览渲染失败」） |
| retryLabel | string | 取自 locale | 重试按钮文案；不传则跟随 ConfigProvider（内置中文兜底「重试」） |
| renderError | (error: PreviewSandboxError, retry: () => void) => ReactNode | — | 自定义错误态；给了就完全接管（含重试入口） |

`PreviewSandboxError` 两种模式同形状：`{ source: "iframe" ｜ "react", kind: "error" ｜ "unhandledrejection", message, stack, filename, lineno, colno, componentStack, error }`。`error`（原始 Error 实例）只有同文档模式拿得到，iframe 模式跨 realm 恒为 `null`。

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onError | (error: PreviewSandboxError) => void | 预览内出错。iframe 模式来自注入脚本回传的 `error` / `unhandledrejection`；同文档模式来自 React 错误边界 |
| onReady | () => void | 预览就绪。iframe 模式为 `load` 之后，同文档模式为挂载之后；每次重载再触发一次 |
| onLoadingChange | (loading: boolean) => void | 加载态变化（换 `code`、点重试都会先回到 `true`）。同文档模式恒为 `false` |

## 示例
```tsx
const html = `<!doctype html>
<html><head><style>body{margin:0;font-family:system-ui}</style></head>
<body><h1>Generated page</h1></body></html>`;

// 外层必须有确定高度：组件自身是 h-full w-full
<div className="h-[420px] w-full overflow-hidden rounded-[var(--radius)] border border-border">
  <PreviewSandbox
    code={html}
    device={device}          // 切换不重挂 iframe，预览内状态不丢
    showDeviceFrame
    onReady={() => setStatus("ready")}
    onError={(e) => console.warn(e.source, e.message)}
  />
</div>
```

同文档模式（拿得到原始 Error，适合预览自家组件）：
```tsx
<PreviewSandbox device={{ width: 480, height: 320 }} onError={(e) => report(e.error)}>
  <GeneratedComponent />
</PreviewSandbox>
```

纯函数可单独使用（比如把预览内容先在别处组装好）：
```ts
resolveViewport("iphone");                       // { width: 390, height: 844 }
computePreviewScale({ outerW: 640, outerH: 800, viewportW: 1280, viewportH: 800, scale: "fit" }); // 0.5
buildSrcDoc(html, { frameId, instrument: true }); // 注入错误转发脚本后的文档串
normalizeReactError(err, info);                   // 归一成 PreviewSandboxError
```

## 无障碍

- iframe 一定有 `title`（默认「预览沙箱」）—— 无名 iframe 是屏幕阅读器最典型的死角，请按内容改成有信息量的名字（如「登录页预览」）。
- 错误态用的是 [Alert](../alert/alert.md) 的 danger 语气，本身即 `role="alert"`，出错会被打断式播报；外层刻意不再叠一层同角色，避免读两遍。
- 重试是**真按钮**（可 Tab 可回车），不是只能点的图标；文案默认取 locale，`retryLabel` 可就地覆盖（优先级 prop > locale > 内置中文兜底）。
- 预览内容的无障碍**归你自己负责**：iframe 里的文档是另一棵可访问性树，宿主的 landmark、语言、对比度都管不到它，`code` 里请自带 `<html lang>` 与语义标签。
- 缩放走 `transform: scale`，不改字号也不改 DOM，屏幕阅读器读到的仍是原始结构；但缩小后的文字确实更难看清，重要操作不要只放在缩到很小的预览里。

## 禁忌 / 坑

- **`code` 不是 JSX，是 HTML 文档串。** 塞一段 `<Button/>` 或 TSX 进去只会被当纯文本渲染，不会报错也不会编译——这是本组件最容易踩的静默失效。要真正执行生成的组件代码，只有两条路：自己在消费方接编译器（esbuild-wasm / WebContainers 那一档，本库不会引入这类重依赖），或改用同文档模式把已经编译好的组件当 `children` 传进来。
- **默认 sandbox 只给 `allow-scripts`，刻意不给 `allow-same-origin`，这是个真实的取舍：**
  - `srcdoc` 文档本就继承宿主的源。两个值一起给等于**没有沙箱**：预览里的脚本能读写宿主 DOM、`localStorage`、cookie，甚至自己把 `sandbox` 属性摘掉。所以内容只要不是你完全可信的（AI 生成的、用户贴的、第三方模板），就别放开。
  - 代价是宿主也读不到 `iframe.contentDocument`。所以错误转发走 `postMessage`（不透明源照样能发），而不是直接往 iframe 文档里挂监听。
  - 需要读 iframe 内部 DOM 时（典型是配 [ElementSelectionOverlay](../element-selection-overlay/element-selection-overlay.md) 做指向编辑）才放开，并且请显式写出来：`sandbox={PREVIEW_SANDBOX_SAME_ORIGIN_SANDBOX}`。这个常量存在的意义就是让「我知道我在关隔离」在代码里可读、可 grep、可 review。
- **消息校验不看 `origin`。** 不透明源的 iframe 发出的 `event.origin` 恒为 `"null"`，拿它当条件等于永远不通过。组件校验的是「消息里的实例 id」+「`event.source === iframe.contentWindow`」；自己接 `postMessage` 时请照此办理。
- **`instrument={false}` 之后 `onError` 就静音了**（iframe 模式）。不注入脚本就没有回传通路，这是设计如此，不是 bug；关它的正当理由通常是「预览文档有严格 CSP 或自己已经装了错误上报」。
- **重载靠 `srcDoc` 字符串变化，不靠 `location.reload()`**（跨源调不到）。所以点重试时 `srcdoc` 会多出一行重载标记注释——这是刻意的，别当成脏数据去掉。
- **切设备不会重载文档，换 `code` 会。** 前者只改容器盒子（预览内的滚动位置、表单输入、动画进度都保住），后者是新文档。想强制重来请用重试按钮或改 `code`。
- **`fit` 永不放大**（上限 1），与 [FitScreen](../fit-screen/fit-screen.md) 的 `computeFit` 不同：把 390px 的手机预览拉到 800px 宽只会得到一个「巨人手机」，字号、点击区、断点全部失真。要放大请显式给 `scale={1.5}`。
- **外层必须有确定高度。** 组件自身是 `h-full w-full`，父级高度塌缩就什么都看不见（和 [Flow](../flow/flow.md) 同款坑）。
- **iframe 里的资源加载失败（图片 404）不算错误。** 引导脚本刻意不监听捕获阶段，只报真正的运行时异常，否则「图挂了」会被报成预览崩溃。
- jsdom 里 `srcDoc` 的脚本不会执行、也没有布局引擎，所以「注入位置」「缩放系数」「错误归一化」这些都做成了导出的纯函数（`buildSrcDoc` / `computePreviewScale` / `normalizeIframeMessage` / `normalizeReactError`），要断言行为请测它们，别去测 iframe 内部。

## 相关
[Viewport](../viewport/viewport.md) · [FitScreen](../fit-screen/fit-screen.md) · [IPhone](../iphone/iphone.md) · [Android](../android/android.md) · [Tablet](../tablet/tablet.md) · [ElementSelectionOverlay](../element-selection-overlay/element-selection-overlay.md) · [CodeBlock](../code-block/code-block.md)
