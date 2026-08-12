---
slug: rich-text-editor
name: RichTextEditor
category: forms
group: advanced
tags: []
exports: [RichTextEditor, sanitizePastedHtml, normalizeLegacyHtml]
status: enriched
---

# RichTextEditor

> 富文本编辑器 · 值进出 HTML 字符串 + 工具栏可裁 + 图片上传注入 + 粘贴净化 · forms/advanced

## 何时用

内容管理里「运营自己排版、前台原样渲染」的长文富文本：活动细则、品牌故事、商品详情、公众号图文。判据只有一条 —— **值的进出是 HTML 串**（数据库里存的是 HTML，前台用 `v-html` / 小程序 `rich-text` 直接吃）。

值进出是 markdown 用 [MarkdownEditor](../markdown-editor/markdown-editor.md)；只要纯文本多行用 [Textarea](../textarea/textarea.md)；只读展示已有 HTML 不要用编辑器（那会把内容按 schema 归一化一遍）。

**别用互转绕过去**：`html → md` 是有损的。`<span style="color:#e4393c">`、`<p style="text-align:center">`、`<table>`、`<iframe>` 在 markdown 语法里没有对应表达，运营改一个错别字、一次往返就把整篇的居中与红字洗掉了。

## 导入
```ts
import { RichTextEditor } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `string` | — | 受控 **HTML 片段串** |
| defaultValue | `string` | — | 非受控初值（HTML 串） |
| name | `string` | — | 桥给原生表单 / Field 的隐藏 input name（值为 HTML 串） |
| placeholder | `string` | — | 空态占位 |
| invalid | `boolean` | `false` | 校验失败态：外壳变 danger（也可由外层 Field 经 data-invalid 驱动） |
| disabled | `boolean` | `false` | 禁用（内容区不可编辑 + 工具栏收起） |
| minRows | `number` | `8` | 内容区最小高度（行） |
| toolbar | `RichTextToolbarItem[]` | 完整一档 | 工具栏条目与顺序；`[]` 则整条工具栏不渲染。**裁掉一档同时会关掉对应扩展**（见「禁忌 / 坑」） |
| sanitizePaste | `boolean` | `true` | 粘贴净化：洗掉 `class` / `on*` / `<style>`，`href` / `src` 过协议白名单，内联 `style` 过属性白名单 |
| legacyHtml | `boolean \| LegacyHtmlOptions` | `false` | 存量 HTML 兼容（微信编辑器 / Word / 老 UEditor 的正文）。默认关；`true` 三档全开，给对象则只开写明的那几档。见「存量 HTML 兼容」 |
| extensions | `AnyExtension[]` | — | 追加自定义 TipTap 扩展（如给存量内容里的 `<iframe>` 视频补一个节点类型） |
| className | `string` | — | 落在外壳 |
| aria-label | `string` | locale | 内容区无障碍名 |

`RichTextToolbarItem` = `"bold" | "italic" | "underline" | "strike" | "heading" | "fontSize" | "color" | "backgroundColor" | "align" | "bulletList" | "orderedList" | "blockquote" | "link" | "image" | "table" | "clear" | "divider"`。

### LegacyHtmlOptions

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| font | `boolean` | `false` | `<font color\|face\|size>` → `<span style="color\|font-family\|font-size">`，并把 color / font-size / font-family / background-color 四个 mark 装进 schema |
| imgStyle | `boolean` | `false` | 保住 `<img>` 上的内联 `style`，白名单 `max-width` / `width` / `height` |
| align | `boolean` | `false` | 块级对齐下推：`<section>` / `<div>` 上的 `text-align`、`align="center"` 属性、`<center>` 标签 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onChange | `(html: string) => void` | 内容变化回调，参数是 HTML 串 |
| onUploadImage | `(file: File) => Promise<{ url: string }>` | 图片上传：拿 `File`、还 URL。**工具栏按钮、粘贴、拖拽三条路都走它**。不传则按钮退回「填 URL」，粘贴/拖拽的图片被丢弃（见「图片怎么进来」） |

## 示例
```tsx
// 基础：存量 HTML 直接灌进去
<RichTextEditor
  defaultValue='<p style="text-align: center"><strong>活动细则</strong></p>'
/>
```

```tsx
// 受控 + 落库
const [html, setHtml] = useState(detail.content); // 库里取出来就是 HTML
<RichTextEditor value={html} onChange={setHtml} />
```

```tsx
// 图片走自家 OSS（带鉴权头），组件只负责插 <img src>
<RichTextEditor
  onUploadImage={async (file) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form, headers: authHeaders });
    return { url: (await res.json()).url };
  }}
/>
```

```tsx
// 工具栏裁成常用一档
<RichTextEditor toolbar={["bold", "italic", "underline", "divider", "bulletList", "link"]} />
```

```tsx
// 表单内
<Field label="活动详情" required error={detail.error}>
  <RichTextEditor name="detail" value={detail.value} onChange={detail.onChange} />
</Field>
```

```tsx
// 存量兼容：微信编辑器 / Word / 老 UEditor 迁过来的正文
<RichTextEditor legacyHtml value={html} onChange={setHtml} />

// 只要其中某几档
<RichTextEditor legacyHtml={{ font: true, imgStyle: true }} value={html} onChange={setHtml} />
```

## 图片怎么进来

三条入口，**都走同一个 `onUploadImage`**（拿 `File`、还 URL）：

| 入口 | 传了 `onUploadImage` | 没传 |
|------|------|------|
| 工具栏图片按钮 | 打开文件选择器（`accept="image/*"`）→ 上传 → 插入返回的 URL | 退回「填 URL」弹窗 |
| **粘贴截图**（`Cmd+V`） | 上传 → 插入 | 忽略，开发期打一条告警 |
| **拖入图片文件** | 上传 → 插到落点 | 忽略，开发期打一条告警 |
| 粘贴 Word / 网页正文（图片是内联 base64） | 逐张转存成 URL 再整段插入 | base64 被丢弃（不写进正文），开发期打一条告警 |

最后一行值得单说：从 Word、Excel、部分网页复制的正文，图片是**内联在 HTML 里的 base64**，剪贴板里没有对应的文件条目——所以它和「粘贴截图」是两条不同的路，组件分开处理。有 `onUploadImage` 时会把 `data:` 还原成 `File` 转存，没有则整个 `<img>` 被净化删掉：**宁可丢一张图，也不把几 MB base64 写进你的数据库字段**。

```tsx
// 传输层全在你手里：鉴权头、直传、进度、失败重试
<RichTextEditor
  onUploadImage={async (file) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form, headers: authHeaders });
    return { url: (await res.json()).url };
  }}
/>
```

上传抛错时该图不插入，组件不弹任何 UI——**提示归你**，只有你知道该说什么（配额满了？格式不支持？重试？）。多张一起传时单张失败不打断其余的。

## 存量 HTML 兼容

编辑器的 schema 在**载入时**就决定了哪些标签能活下来。下面这张表是「打开 → 不做任何编辑 → 取回 HTML」的口径，上线前照它对一遍存量样本：

| 存量写法 | 默认（`legacyHtml` 关） | `legacyHtml` 开 |
|------|------|------|
| `<b>` / `<i>` | 规范化成 `<strong>` / `<em>` | 同左 |
| `<section>` / `<div>` 结构标签 | 拆成 `<p>`，标签本身不保留 | 同左 |
| `<img src>` / `<a href>` | 保留 | 保留 |
| `<p style="text-align">` | 保留（需 `toolbar` 含 `align`） | 保留（不看 `toolbar`） |
| `<span style="color\|font-size">` | 保留（需 `toolbar` 含 `color` / `fontSize`） | 保留（不看 `toolbar`） |
| `<span style="background-color">`（文字底色） | 保留（需 `toolbar` 含 `backgroundColor`，默认含） | 保留（不看 `toolbar`）；始终是 `<span style>`，不换成 `<mark>` |
| `<font color\|face\|size>` | **丢** | 翻成 `<span style>`，输出保持 span |
| `<img style="max-width:100%">` | **丢** | 保留 `max-width` / `width` / `height` 三条 |
| `<section style="text-align">` | **丢**（挂在被拆掉的标签上） | 下推到子块，落成 `<p style="text-align">` |
| `align="center"` 属性 / `<center>` | **丢** | 翻成子块上的 `text-align` |
| `<table>` | 需 `toolbar` 含 `table`，否则丢 | 同左（不在兼容档范围） |
| `<iframe>` / `<video>` / 自定义标签 | 丢 | 丢 —— 用 `extensions` 补节点 |

两个入口，按「归一发生在哪一侧」选：

- **`legacyHtml` prop** —— 覆盖全部三档。`imgStyle` 与 `font` 里的 `font-family` **只能**走它：schema 里没有的属性在解析那一刻就没了，纯函数救不回来。开着时对应的扩展不受 `toolbar` 裁剪影响 —— 不能为了不丢红字逼消费方开一个他并不想要的调色按钮。
- **`normalizeLegacyHtml(html)` 纯函数** —— 只覆盖 `font` 与 `align` 两档（都是解析前的标记翻译）。灌进编辑器之前自己转一道，或者用来做批量洗库、写迁移脚本、跟别的编辑器共用同一套映射口径。

```ts
import { normalizeLegacyHtml } from "@hulianui/ui"

// 两档全开；也可以只开一档：normalizeLegacyHtml(row.content, { align: true })
const html = normalizeLegacyHtml(row.content)
```

`normalizeLegacyHtml` 依赖 `DOMParser`，Node 里直接跑要自己备一个（jsdom / linkedom）；拿不到时原样返回，不抛。它是**翻译不是消毒** —— 净化仍在 `sanitizePastedHtml` 与服务端。

## 禁忌 / 坑

- **编辑器的 schema 决定哪些标签能活下来，而且是在载入时就决定的**：不在扩展集里的标签（默认一档之外的 `<iframe>`、`<video>`、自定义标签）打开这篇内容的瞬间就被丢掉，保存回去即数据丢失 —— 不是「不碰它就不会掉」。存量内容里有这类标签时，用 `extensions` 补上对应节点再上线。
- 同理，**`toolbar` 裁剪不只是省按钮**：不给 `"table"` 就不装表格扩展，于是存量正文里的 `<table>` 会被丢掉；`"color"` / `"fontSize"` / `"backgroundColor"` 对应的是 `<span style="color|font-size|background-color">`，`"align"` 对应的是 `style="text-align"`。裁之前先确认存量内容里没有那类排版。
- **上线前务必拿一批真实存量内容跑一遍「打开 → 不做任何编辑 → 取 `getHTML`」的对比**，确认没有静默丢失。这条比任何单测都重要：丢的是运营五年攒的排版。跑对比时注意：直接读 `.ProseMirror` 的 `innerHTML` 会多出 `<br class="ProseMirror-trailingBreak">`，那是渲染占位、不进 `getHTML`，不剥掉会误判成 `<br>` 翻倍。
- `legacyHtml` **只保排版，不保结构**：`<section>` 照样被拆成 `<p>`，只是挂在它身上的对齐被下推到了子块。存量正文靠 `<section>` 嵌套做的分栏 / 卡片布局救不回来，那类要走 `extensions` 自己补节点。
- **只裹一张图的居中包裹层保不住**。`<section style="text-align:center"><img></section>` 里图片是块级节点，套一层 `<p>` 只会让 ProseMirror 把它提出去、留下一个空段落，所以这种形态刻意不转 —— 图片的居中要在前台样式里给（`img { display:block; margin:0 auto }`），不要指望正文串。
- `legacyHtml` 开着时粘贴净化的**删除类规则一条都不松**（`class` / `on*` / `<style>` / `javascript:` 照删），只是内联 `style` 白名单多放行 `font-family` 与 `max-width` 两条。`<font color>` 的值走形状白名单（命名色 / `#hex` / `rgb()`），拼不出第二条声明 —— 正文是用户可写字段。
- **取色器里不出现 `var(--…)` 色**，两个都不出现。正文要存进你的库、再由别处的前台（`v-html` / 小程序 `rich-text` / 邮件）渲染，那边没有瑚琏的 CSS 变量，`color: var(--color-foreground)` 到了那儿解析不出值、静默退回继承色 —— 等于把只在编辑器里成立的样式写成了永久内容。所以「默认色」/「无底色」走的是 `unsetColor()` / `unsetBackgroundColor()`，即**不写这条声明**，而不是写一个「默认颜色」。
- 图片**永远不内联 base64**，粘贴这条路也不例外（0.36.0 之前不成立，见 #213：从 Word 粘正文会把 base64 原样写进字段）。传输层（鉴权头、直传、进度、失败重试）一律在消费方手里。
- **`blob:` 与 `file:` 的图片地址会被粘贴净化删掉。** 前者只在当前页面生命周期内有效、后者只在那台机器上有效，存进库下次打开就是碎图 —— 而且字段大小看不出异常，比 base64 更难查。
- 粘贴净化只洗**结构与属性**，不做 XSS 意义上的完全消毒。渲染到前台时该转义/该过滤仍要在服务端做一遍 —— 富文本正文是用户可写字段，前端白名单不是安全边界。
- `value` 受控时组件按「与上次 emit 的串不同才 setContent」防回环。若外部每次渲染都传一个**语义相同但字符串不同**的 HTML（比如自己格式化过），会反复重置光标位置；受控值请直接回填 `onChange` 给的那串。
- 与 [MarkdownEditor](../markdown-editor/markdown-editor.md) 不要在同一个字段上换来换去：两者的值契约不同，换一次就是一次有损转换。

## 相关
[MarkdownEditor](../markdown-editor/markdown-editor.md) · [Textarea](../textarea/textarea.md) · [Field](../field/field.md) · [Upload](../upload/upload.md) · [Prose](../prose/prose.md)
