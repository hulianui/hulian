---
slug: rich-text-editor
name: RichTextEditor
category: forms
group: advanced
tags: []
exports: [RichTextEditor, sanitizePastedHtml]
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
| sanitizePaste | `boolean` | `true` | 粘贴净化：洗掉 `class` / `on*` / `<style>` / `javascript:`，内联 `style` 过属性白名单 |
| extensions | `AnyExtension[]` | — | 追加自定义 TipTap 扩展（如给存量内容里的 `<iframe>` 视频补一个节点类型） |
| className | `string` | — | 落在外壳 |
| aria-label | `string` | locale | 内容区无障碍名 |

`RichTextToolbarItem` = `"bold" | "italic" | "underline" | "strike" | "heading" | "fontSize" | "color" | "align" | "bulletList" | "orderedList" | "blockquote" | "link" | "image" | "table" | "clear" | "divider"`。

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onChange | `(html: string) => void` | 内容变化回调，参数是 HTML 串 |
| onUploadImage | `(file: File) => Promise<{ url: string }>` | 图片上传：拿 `File`、还 URL。不传则图片按钮退回「填 URL」 |

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

## 禁忌 / 坑

- **编辑器的 schema 决定哪些标签能活下来，而且是在载入时就决定的**：不在扩展集里的标签（默认一档之外的 `<iframe>`、`<video>`、自定义标签）打开这篇内容的瞬间就被丢掉，保存回去即数据丢失 —— 不是「不碰它就不会掉」。存量内容里有这类标签时，用 `extensions` 补上对应节点再上线。
- 同理，**`toolbar` 裁剪不只是省按钮**：不给 `"table"` 就不装表格扩展，于是存量正文里的 `<table>` 会被丢掉；`"color"` / `"fontSize"` 对应的是 `<span style="color|font-size">`，`"align"` 对应的是 `style="text-align"`。裁之前先确认存量内容里没有那类排版。
- **上线前务必拿一批真实存量内容跑一遍「打开 → 不做任何编辑 → 取 `getHTML`」的对比**，确认没有静默丢失。这条比任何单测都重要：丢的是运营五年攒的排版。
- 图片**永远不内联 base64**。没有 `onUploadImage` 时按钮退回填 URL，就是为了不让一篇正文膨胀几 MB 把数据库字段撑爆。传输层（鉴权头、直传、进度、失败重试）一律在消费方手里。
- 粘贴净化只洗**结构与属性**，不做 XSS 意义上的完全消毒。渲染到前台时该转义/该过滤仍要在服务端做一遍 —— 富文本正文是用户可写字段，前端白名单不是安全边界。
- `value` 受控时组件按「与上次 emit 的串不同才 setContent」防回环。若外部每次渲染都传一个**语义相同但字符串不同**的 HTML（比如自己格式化过），会反复重置光标位置；受控值请直接回填 `onChange` 给的那串。
- 与 [MarkdownEditor](../markdown-editor/markdown-editor.md) 不要在同一个字段上换来换去：两者的值契约不同，换一次就是一次有损转换。

## 相关
[MarkdownEditor](../markdown-editor/markdown-editor.md) · [Textarea](../textarea/textarea.md) · [Field](../field/field.md) · [Upload](../upload/upload.md) · [Prose](../prose/prose.md)
