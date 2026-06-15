---
slug: document-sheet
name: DocumentSheet
category: data-display
group: collection
tags: []
exports: [DocumentSheet, DocumentSheetHeader, DocumentSheetSection, DocumentSheetFooter, DocumentSheetSignature]
status: enriched
---

# DocumentSheet

> 单据纸张 · A4 居中纸面(白底/暗色近黑纸·shadow·210mm 宽) + 打印态隔离(工具栏/阴影/外边距 print:hidden·data-document-sheet 钩子) + 内置打印按钮(onPrint ?? window.print) + 子件 Header(左右抬头)/Section(带小标题段)/Footer(签章位) · 报价单/发票等单据容器 · data-display/collection

## 何时用

需要一张「可打印的正式单据纸面」时用——报价单、发票、合同、对账单。屏幕上居中显示 A4 纸张，打印时自动隐藏工具栏/阴影/外边距。只展示结构化表格数据用 [Table]/[ProTable]；DocumentSheet 是纸张容器，配合内置子件组装抬头/明细段/签章。

## 导入
```ts
import { DocumentSheet, DocumentSheetHeader, DocumentSheetSection, DocumentSheetFooter, DocumentSheetSignature } from "@hulianui/ui"
```

## Props

DocumentSheet（继承 `HTMLAttributes<HTMLDivElement>`）：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| size | `"a4" \| "auto"` | `"a4"` | a4 固定 210mm 宽纸面 / auto 自适应容器宽 |
| toolbar | `ReactNode` | — | 纸面上方工具栏内容（挂 `print:hidden`，打印时消失） |
| onPrint | `() => void` | — | 打印按钮回调，缺省走 `window.print()` |
| printable | `boolean` | `true` | 是否渲染内置打印按钮 |
| children* | `ReactNode` | — | 纸面内容（通常由下列子件组装） |
| className | `string` | — | 纸面类名 |

DocumentSheetSection：`title?: ReactNode`（段小标题）+ children。
DocumentSheetSignature：`label?: ReactNode`（签章说明）+ `lineWidth?: number \| string`（签名线宽，默认 `"11rem"`）。
DocumentSheetHeader / DocumentSheetFooter：仅排版容器，透传 div 属性。

## 示例
```tsx
<DocumentSheet size="a4" className="text-sm">
  <DocumentSheetHeader>
    <div className="text-lg font-bold">瑚琏设计工作室</div>
    <div className="text-right text-xl font-bold">报 价 单</div>
  </DocumentSheetHeader>

  <DocumentSheetSection title="服务明细">
    <table className="w-full">{/* … 明细行 … */}</table>
  </DocumentSheetSection>

  <DocumentSheetFooter>
    <div className="flex items-end justify-between gap-8">
      <p className="text-xs">备注：报价有效期 30 天。</p>
      <DocumentSheetSignature label="授权代表（签章）" />
    </div>
  </DocumentSheetFooter>
</DocumentSheet>
```

## 禁忌 / 坑

- 打印态靠 `print:hidden` + `data-document-sheet` 钩子隔离工具栏/阴影/外边距；自己往纸面里加的悬浮控件若不希望被打印，也要自行挂 `print:hidden`。
- 暗色主题下纸面是「近黑纸」而非白纸——若放固定深色文字会看不清，正文颜色用 token（`text-foreground`/`text-muted`）跟随主题。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
