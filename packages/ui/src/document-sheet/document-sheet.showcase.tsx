"use client";
import type { ShowcaseSpec } from "../showcase/types";
import {
  DocumentSheet,
  DocumentSheetHeader,
  DocumentSheetSection,
  DocumentSheetFooter,
  DocumentSheetSignature,
} from "./document-sheet";

const items = [
  { name: "品牌官网首页设计", qty: 1, unit: 12000 },
  { name: "组件库定制（20 件）", qty: 20, unit: 800 },
  { name: "前端切图实现", qty: 1, unit: 8000 },
];
const total = items.reduce((s, i) => s + i.qty * i.unit, 0);
const yuan = (n: number) => `¥${n.toLocaleString("zh-CN")}`;

function Quotation({ size = "a4" }: { size?: "a4" | "auto" }) {
  return (
    <DocumentSheet size={size} className="text-sm">
      <DocumentSheetHeader>
        <div>
          <div className="text-lg font-bold text-foreground">瑚琏设计工作室</div>
          <div className="mt-1 text-xs text-muted">
            上海市某区某路 88 号
            <br />
            contact@hulian.design · 021-8888-8888
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold tracking-wide text-foreground">报 价 单</div>
          <div className="mt-2 text-xs text-muted">
            单号：QT-2026-0604
            <br />
            日期：2026-06-04
          </div>
        </div>
      </DocumentSheetHeader>

      <DocumentSheetSection title="致">
        <div className="font-medium text-foreground">某某科技有限公司</div>
        <div className="text-xs text-muted">张经理 · 采购部</div>
      </DocumentSheetSection>

      <DocumentSheetSection title="服务明细">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border text-xs text-muted">
              <th className="py-2 font-medium">项目</th>
              <th className="py-2 text-center font-medium">数量</th>
              <th className="py-2 text-right font-medium">单价</th>
              <th className="py-2 text-right font-medium">小计</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.name} className="border-b border-border/60">
                <td className="py-2 text-foreground">{it.name}</td>
                <td className="py-2 text-center text-foreground">{it.qty}</td>
                <td className="py-2 text-right text-foreground">{yuan(it.unit)}</td>
                <td className="py-2 text-right text-foreground">{yuan(it.qty * it.unit)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="py-3 text-right font-medium text-foreground">
                合计（含税）
              </td>
              <td className="py-3 text-right text-base font-bold text-foreground">{yuan(total)}</td>
            </tr>
          </tfoot>
        </table>
      </DocumentSheetSection>

      <DocumentSheetFooter>
        <div className="flex items-end justify-between gap-8">
          <p className="max-w-[55%] text-xs leading-relaxed">
            备注：报价有效期 30 天，款到后 5 个工作日内启动。
          </p>
          <DocumentSheetSignature label="授权代表（签章）" />
        </div>
      </DocumentSheetFooter>
    </DocumentSheet>
  );
}

export const documentSheetShowcase: ShowcaseSpec = {
  controls: [
    { prop: "size", type: "select", options: ["a4", "auto"], defaultValue: "a4" },
  ],
  states: [
    { name: "报价单（A4）", render: () => <Quotation size="a4" /> },
    { name: "自适应宽度", render: () => <Quotation size="auto" /> },
  ],
  renderWithProps: (p) => <Quotation size={p.size as "a4" | "auto"} />,
  toCode: () =>
    `<DocumentSheet size="a4" onPrint={() => window.print()}>
  <DocumentSheetHeader>
    <div>瑚琏设计工作室</div>
    <div>报价单 · QT-2026-0604</div>
  </DocumentSheetHeader>
  <DocumentSheetSection title="服务明细">
    <table>{/* 明细行 */}</table>
  </DocumentSheetSection>
  <DocumentSheetFooter>合计 · 签章位</DocumentSheetFooter>
</DocumentSheet>`,
};
