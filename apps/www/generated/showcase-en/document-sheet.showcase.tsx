"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { DocumentSheet, DocumentSheetHeader, DocumentSheetSection, DocumentSheetFooter, DocumentSheetSignature, } from "../../../../packages/ui/src/document-sheet/document-sheet";
const items = [
    { name: "Brand official website homepage design", qty: 1, unit: 12000 },
    { name: "Component library customization (20 pieces)", qty: 20, unit: 800 },
    { name: "Front-end image cutting implementation", qty: 1, unit: 8000 },
];
const total = items.reduce((s, i) => s + i.qty * i.unit, 0);
const yuan = (n: number) => `\u00A5${n.toLocaleString("zh-CN")}`;
function Quotation({ size = "a4" }: {
    size?: "a4" | "auto";
}) {
    return (<DocumentSheet size={size} className="text-sm">
      <DocumentSheetHeader>
        <div>
          <div className="text-lg font-bold text-foreground">Hulian Design Studio</div>
          <div className="mt-1 text-xs text-muted">
            No. 88, Road, District, Shanghai
            <br />
            contact@hulian.design · 021-8888-8888
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold tracking-wide text-foreground">Quote</div>
          <div className="mt-2 text-xs text-muted">
            Order number: QT-2026-0604
            <br />
            Date: 2026-06-04
          </div>
        </div>
      </DocumentSheetHeader>

      <DocumentSheetSection title="To">
        <div className="font-medium text-foreground">XX Technology Co., Ltd.</div>
        <div className="text-xs text-muted">Manager Zhang · Purchasing Department</div>
      </DocumentSheetSection>

      <DocumentSheetSection title="Service details">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border text-xs text-muted">
              <th className="py-2 font-medium">Project</th>
              <th className="py-2 text-center font-medium">Quantity</th>
              <th className="py-2 text-right font-medium">Unit price</th>
              <th className="py-2 text-right font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (<tr key={it.name} className="border-b border-border/60">
                <td className="py-2 text-foreground">{it.name}</td>
                <td className="py-2 text-center text-foreground">{it.qty}</td>
                <td className="py-2 text-right text-foreground">{yuan(it.unit)}</td>
                <td className="py-2 text-right text-foreground">{yuan(it.qty * it.unit)}</td>
              </tr>))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="py-3 text-right font-medium text-foreground">
                Total (tax included)
              </td>
              <td className="py-3 text-right text-base font-bold text-foreground">{yuan(total)}</td>
            </tr>
          </tfoot>
        </table>
      </DocumentSheetSection>

      <DocumentSheetFooter>
        <div className="flex items-end justify-between gap-8">
          <p className="max-w-[55%] text-xs leading-relaxed">
            Note: The quotation is valid for 30 days and will be activated within 5 working days after payment is received.
          </p>
          <DocumentSheetSignature label="Authorized representative (signature)"/>
        </div>
      </DocumentSheetFooter>
    </DocumentSheet>);
}
export const documentSheetShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic document",
            description: "A centered piece of A4 paper with a print button on the top (the entire toolbar is hidden when printing).",
            code: `<DocumentSheet size="a4">
  <DocumentSheetHeader>
    <div className="text-lg font-bold">Hulian Design Studio</div>
    <div className="text-xl font-bold">Quotation</div>
  </DocumentSheetHeader>
  <DocumentSheetSection title="To">
    <div className="font-medium">XX Technology Co., Ltd.</div>
  </DocumentSheetSection>
</DocumentSheet>`,
            render: () => (<div className="text-sm [&_[data-document-sheet]]:p-[10mm]">
          <DocumentSheet size="auto">
            <DocumentSheetHeader>
              <div className="text-lg font-bold text-foreground">Hulian Design Studio</div>
              <div className="text-xl font-bold tracking-wide text-foreground">Quote</div>
            </DocumentSheetHeader>
            <DocumentSheetSection title="To">
              <div className="font-medium text-foreground">XX Technology Co., Ltd.</div>
            </DocumentSheetSection>
          </DocumentSheet>
        </div>),
        },
        {
            title: "Paragraph and footer signature",
            description: "DocumentSheetSection is segmented, DocumentSheetFooter contains separators, and DocumentSheetSignature gives a stable signature bit alignment.",
            code: `<DocumentSheet size="a4" printable={false}>
  <DocumentSheetSection title="Service Description">
    Includes official website design, component library customization and front-end implementation.
  </DocumentSheetSection>
  <DocumentSheetFooter>
    <div className="flex items-end justify-between gap-8">
      <p className="text-xs">Note: The quotation is valid for 30 days. </p>
      <DocumentSheetSignature label="Authorized Representative (Signature)" />
    </div>
  </DocumentSheetFooter>
</DocumentSheet>`,
            render: () => (<div className="text-sm [&_[data-document-sheet]]:p-[10mm]">
          <DocumentSheet size="auto" printable={false}>
            <DocumentSheetSection title="Service Description">
              <span className="text-foreground">Includes official website design, component library customization and front-end implementation.</span>
            </DocumentSheetSection>
            <DocumentSheetFooter>
              <div className="flex items-end justify-between gap-8">
                <p className="text-xs leading-relaxed">Note: Quotes are valid for 30 days.</p>
                <DocumentSheetSignature label="Authorized representative (signature)"/>
              </div>
            </DocumentSheetFooter>
          </DocumentSheet>
        </div>),
        },
        {
            title: "Custom printing callback",
            description: "Pass onPrint to take over the printing action (such as verifying first and then window.print). By default, the built-in button directly calls window.print().",
            code: `<DocumentSheet
  size="a4"
  onPrint={() => {
    // Customize logic before printing
    window.print();
  }}
>
  <DocumentSheetSection title="Invoice header">
    XX Technology Co., Ltd.
  </DocumentSheetSection>
</DocumentSheet>`,
            render: () => (<div className="text-sm [&_[data-document-sheet]]:p-[10mm]">
          <DocumentSheet size="auto" onPrint={() => { }}>
            <DocumentSheetSection title="Invoice header">
              <span className="text-foreground">XX Technology Co., Ltd.</span>
            </DocumentSheetSection>
          </DocumentSheet>
        </div>),
        },
    ],
    controls: [
        { prop: "size", type: "select", options: ["a4", "auto"], defaultValue: "a4" },
    ],
    states: [
        { name: "Quotation (A4)", render: () => <Quotation size="a4"/> },
        { name: "Adaptive width", render: () => <Quotation size="auto"/> },
    ],
    renderWithProps: (p) => <Quotation size={p.size as "a4" | "auto"}/>,
    toCode: () => `<DocumentSheet size="a4" onPrint={() => window.print()}>
  <DocumentSheetHeader>
    <div>Hulian Design Studio</div>
    <div>Quotation \u00B7 QT-2026-0604</div>
  </DocumentSheetHeader>
  <DocumentSheetSection title="Service Details">
    <table>{/* Detail line */}</table>
  </DocumentSheetSection>
  <DocumentSheetFooter>Total\u00B7Signature Position</DocumentSheetFooter>
</DocumentSheet>`,
};
