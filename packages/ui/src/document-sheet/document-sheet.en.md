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

> Frames business documents on an A4-style sheet with header, section, footer, and print controls. · data-display/collection

## When to use

Use DocumentSheet for a printable quotation, invoice, contract, or statement. It presents an A4 sheet on screen and removes toolbar, shadow, and outer spacing in print. Use [Table]/[ProTable] for standalone data; DocumentSheet is the formal paper container around document sections.

## Import
```ts
import { DocumentSheet, DocumentSheetHeader, DocumentSheetSection, DocumentSheetFooter, DocumentSheetSignature } from "@hulianui/ui"
```

## Props

DocumentSheet inherits `HTMLAttributes<HTMLDivElement>`:

| Name | Type | Default | Description |
|------|------|------|------|
| size | `"a4" \| "auto"` | `"a4"` | Fixed 210 mm sheet or responsive container width. |
| printable | `boolean` | `true` | Shows the built-in print action. |
| className | `string` | - | Sheet class name. |

## Events

| Event | Type | Description |
|------|------|------|
| onPrint | `() => void` | Print action; omission calls `window.print()`. |

## Slots

| Slot | Type | Description |
|------|------|------|
| toolbar | `ReactNode` | Content above the sheet, hidden when printing. |
| children* | `ReactNode` | Sheet content, usually composed from the provided subcomponents. |

`DocumentSheetSection` accepts `title?: ReactNode` and children. `DocumentSheetSignature` accepts `label?: ReactNode` and `lineWidth?: number | string`, defaulting to `"11rem"`. Header and Footer are layout containers forwarding div props.

## Example
```tsx
<DocumentSheet size="a4" className="text-sm">
  <DocumentSheetHeader>
    <div className="text-lg font-bold">Hulian Design Studio</div>
    <div className="text-right text-xl font-bold">QUOTATION</div>
  </DocumentSheetHeader>

  <DocumentSheetSection title="Service details">
    <table className="w-full">{/* detail rows */}</table>
  </DocumentSheetSection>

  <DocumentSheetFooter>
    <div className="flex items-end justify-between gap-8">
      <p className="text-xs">Note: This quotation is valid for 30 days.</p>
      <DocumentSheetSignature label="Authorized representative" />
    </div>
  </DocumentSheetFooter>
</DocumentSheet>
```

## Usage notes

- Print isolation uses `print:hidden` and `data-document-sheet`. Add `print:hidden` to custom floating controls that should not appear on paper.
- Dark mode uses near-black paper. Use foreground and muted tokens instead of hard-coded dark text.
- The built-in action text is Chinese `"\u6253\u5370"`, meaning “Print.”

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
