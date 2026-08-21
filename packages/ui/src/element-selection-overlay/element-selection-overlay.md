---
slug: element-selection-overlay
name: ElementSelectionOverlay
category: feedback
group: overlay
tags: []
exports: [ElementSelectionOverlay, asElement, computeLabelPosition, elementPath, escapeAttributeValue, findMarkedElement, isRectVisible, pathLabel, resolveElementByPath, structuralPath, toHostRect]
status: enriched
---

# ElementSelectionOverlay

> 元素选择叠加层 · 在容器或**同源** iframe 里 hover 高亮 / 点击选中元素并回吐组件树路径 · 路径优先读 `data-hulian-path` 标记、读不到回退结构化选择器（两者皆为带单测的纯函数） · 框画在宿主 portal 层，绝不往目标文档写 class/style · 滚动 / resize / DOM 变化 / 进出视口全跟随（rAF 节流，卸载全断开） · 「指向编辑」基础设施 · feedback/overlay

## 何时用

要做「点预览里的元素 → 定位到源码 / 打开属性面板 / 喂给 prompt」这类指向编辑能力时用它。它只负责**选中并给出路径**，编辑面板由你自己搭。

- 引导用户看某个已知元素，用 [Tour](../tour/tour.md)（它是遮罩镂空 + 气泡卡，目标由你指定，不做拾取）。
- 只想给元素加注解气泡，用 [Annotation](../annotation/annotation.md)。
- 只想要一层不可交互的贴图覆盖，用 [Watermark](../watermark/watermark.md)。

## 导入
```ts
import {
  ElementSelectionOverlay,
  asElement,
  computeLabelPosition,
  elementPath,
  escapeAttributeValue,
  findMarkedElement,
  isRectVisible,
  pathLabel,
  resolveElementByPath,
  structuralPath,
  toHostRect,
} from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| target * | HTMLElement ｜ HTMLIFrameElement ｜ null | - | 目标区域：普通容器（在其内部选择）或**同源** iframe（在其文档内选择）。null 时不渲染也不监听 |
| enabled | boolean | true | 是否处于选择模式。false 停止拾取与点击拦截，**已选中的框仍然保留** |
| highlightSelector | string | - | 可选中元素的选择器；落点会向上找最近的匹配祖先，匹配不到则不高亮（用来把粒度锁在组件级） |
| ignoreSelector | string | - | 排除选择器；命中（含祖先命中）的元素不可 hover / 选中 |
| showLabel | boolean | true | 是否显示标签。标签同一时刻只有一个，hover 优先于选中 |
| pathAttribute | string | "data-hulian-path" | 标记路径的属性名 |
| componentAttribute | string | "data-hulian-component" | 标记组件名的属性名（用于标签文案与 `detail.component`） |
| anchorOnId | boolean | true | 结构化路径遇到带 id 的祖先就锚定，不再上溯到根 |
| selectedPath | string ｜ null | - | 受控选中路径。传了（含 null）即视为受控，组件不再自管选中态 |
| interceptClicks | boolean | true | 是否吞掉目标里的点击（阻止预览内的跳转 / 按钮触发） |
| zIndex | number | 100 | 叠加层 z-index |
| className | string | - | 叠加层容器类名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onSelect | (path: string, detail: ElementSelectionDetail) => void | 选中：点击，或目标内按 Enter / 空格 |
| onHover | (path: string ｜ null, detail: ElementSelectionDetail ｜ null) => void | hover 变化；移出或落在不可选区域时给 `(null, null)` |
| onClear | () => void | 清除选中：点空白处 / 按 Esc |
| onError | (error: ElementSelectionOverlayError) => void | 目标不可接管（跨源 iframe 等）。同一目标只报一次。`error.message` 取自 ConfigProvider 的 locale（未包 Provider 时是内置中文），`error.code` 与语言无关，要分支判断请用 `code` |

`ElementSelectionDetail` = `{ path, source: "marked" ｜ "structural", component, tagName, element, rect }`。`source` 告诉你这条路径有多可靠：`marked` 读自标记属性（跨重排不失效），`structural` 是按 DOM 结构推的（DOM 一变可能失效）。

## 示例

受控选中 + 组件级粒度：
```tsx
const [root, setRoot] = useState<HTMLDivElement | null>(null);
const [selected, setSelected] = useState<string | null>(null);

<div ref={setRoot}>
  <div data-hulian-component="Hero" data-hulian-path="App/Hero">…</div>
  <div data-hulian-component="CtaBar" data-hulian-path="App/Cta">…</div>
</div>

<ElementSelectionOverlay
  target={root}
  highlightSelector="[data-hulian-component]"
  selectedPath={selected}
  onSelect={(path, detail) => {
    setSelected(path);
    openInspector(detail.component ?? detail.tagName);
  }}
  onClear={() => setSelected(null)}
/>
```

同源 iframe 预览：
```tsx
const [frame, setFrame] = useState<HTMLIFrameElement | null>(null);

<iframe ref={setFrame} srcDoc={html} title="预览" />
<ElementSelectionOverlay
  target={frame}
  onSelect={(path) => setSelected(path)}
  onError={(e) => toast({ title: e.message, tone: "danger" })}
/>
```

路径工具是导出的纯函数，可脱离组件单独用（例如把已有选中态反查回元素、或在 worker/测试里算路径）：
```ts
structuralPath(el, root);                 // "div > section:nth-of-type(2) > button"
elementPath(el, root);                    // { path, source, component, element }
resolveElementByPath(root, selectedPath); // 路径 → 元素（标记路径与 CSS 选择器都吃）
asElement(event.target);                  // 跨 realm 安全的元素判断（iframe 场景必用）
```

## 无障碍

- 叠加层 `aria-hidden` + `pointer-events: none`：不进无障碍树、不抢焦点、不挡目标交互。
- 不只靠颜色区分状态：hover 是**虚线细框**，选中是**实线粗框**，形态本身可分辨；标签再给出组件名/元素名。
- 键盘可达：目标内 Tab 到元素后按 Enter / 空格即选中，Esc 清除选中，不必依赖指针。
- 建议宿主再提供一条等价的键盘通路（如用 [Tree](../tree/tree.md) 列出组件树），与 `selectedPath` 双向绑定 —— 对屏幕阅读器用户来说，「在画布上找元素」始终不如「在列表里选节点」。
- 标签自动避让视口上边缘（贴顶时翻到框内侧），不会被裁掉。

## 禁忌 / 坑

- **跨源 iframe 不支持**，而且不会静默失效：读不到 `contentDocument` 时组件不渲染，并触发一次 `onError({ code: "cross-origin" })` + 开发期告警。要跨源就只有三条路：换成同源预览（`srcDoc` / 同源代理域名）、或在被预览页里自己挂一份叠加层把 path 通过 `postMessage` 回传宿主、或放弃指向编辑。本组件**不提供** postMessage 桥（那是另一套协议，不该藏在一个 UI 组件里）。
- **能打标记就打标记，且标记元素必须真实占位**。`structural` 路径是按 DOM 结构推的，插一个兄弟节点、条件渲染一变就可能指到别处。把 `data-hulian-path` 打在组件根节点上，路径才跨重排稳定。注意别把标记打在 `display: contents` 的包裹层上——这类元素不生成盒子，`getBoundingClientRect()` 恒为 0，正好落进「零面积判不可见」，一个框都画不出来。
- **iframe 内的元素跨 realm**：它们不是宿主的 `Element` 实例，`node instanceof Element` 恒 false —— 自己处理目标事件时请用导出的 `asElement()`，别用 instanceof（这是同源 iframe 场景最容易踩的静默失效）。
- `interceptClicks` 默认 `true`，意味着**选择模式下预览是不可交互的**（点击被吞、mousedown 的默认行为被挡）。要让用户一边操作预览一边看高亮，传 `interceptClicks={false}`，或用 `enabled` 显式切换选择模式。
- **拦截与清空都只发生在目标内**。`target` 传普通容器时监听虽然挂在宿主 document 上（要覆盖 iframe 场景），但组件会先判事件是否落在 `target` 内：外面的点击既不被 `preventDefault` / `stopPropagation`，也不触发 `onClear`。所以宿主页面的导航、属性面板照常可用，`onClear` 只由「点预览内的空白」触发。
- **目标根自身不可选**：`target` 那个元素（iframe 场景是其 `body`）hover 与点击都视为空白，点它触发 `onClear`。根若也带标记属性，所有元素会退化成同一条路径，所以标记查找刻意跳过根。
- **jsdom 下 `getBoundingClientRect` 恒为 0**，零面积一律判不可见 → 单测里默认一个框都不会渲染。要断言框的存在，先给 `Element.prototype.getBoundingClientRect` 打桩；但别断言坐标数值（坐标来自你的桩，等于自证）。坐标逻辑请测 `toHostRect` / `computeLabelPosition` 这两个纯函数。
- 目标是 `document.body` 时，本组件的 portal 层就落在目标内部；组件已过滤掉自身引起的 MutationObserver 记录（否则自触发死循环），你若另外挂了 observer 也要做同样的过滤。
- 客户端组件（要读 DOM、要挂监听），必须在 client 上下文用；SSR 期不渲染任何东西。

## 相关
[Tour](../tour/tour.md) · [Annotation](../annotation/annotation.md) · [Watermark](../watermark/watermark.md) · [Flow](../flow/flow.md) · [Tree](../tree/tree.md)
