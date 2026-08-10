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
          <div className="mt-1 text-xs text-muted-foreground">
            上海市某区某路 88 号
            <br />
            contact@hulian.design · 021-8888-8888
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold tracking-wide text-foreground">报 价 单</div>
          <div className="mt-2 text-xs text-muted-foreground">
            单号：QT-2026-0604
            <br />
            日期：2026-06-04
          </div>
        </div>
      </DocumentSheetHeader>

      <DocumentSheetSection title="致">
        <div className="font-medium text-foreground">某某科技有限公司</div>
        <div className="text-xs text-muted-foreground">张经理 · 采购部</div>
      </DocumentSheetSection>

      <DocumentSheetSection title="服务明细">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
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
  examples: [
    {
      title: "基础单据",
      description: "一张居中的 A4 纸，顶部自带打印按钮（打印时整条工具栏隐藏）。",
      code: `<DocumentSheet size="a4">
  <DocumentSheetHeader>
    <div className="text-lg font-bold">瑚琏设计工作室</div>
    <div className="text-xl font-bold">报 价 单</div>
  </DocumentSheetHeader>
  <DocumentSheetSection title="致">
    <div className="font-medium">某某科技有限公司</div>
  </DocumentSheetSection>
</DocumentSheet>`,
      render: () => (
        <div className="text-sm [&_[data-document-sheet]]:p-[10mm]">
          <DocumentSheet size="auto">
            <DocumentSheetHeader>
              <div className="text-lg font-bold text-foreground">瑚琏设计工作室</div>
              <div className="text-xl font-bold tracking-wide text-foreground">报 价 单</div>
            </DocumentSheetHeader>
            <DocumentSheetSection title="致">
              <div className="font-medium text-foreground">某某科技有限公司</div>
            </DocumentSheetSection>
          </DocumentSheet>
        </div>
      ),
    },
    {
      title: "段落与页脚签章",
      description: "DocumentSheetSection 分段、DocumentSheetFooter 含分隔线，DocumentSheetSignature 给出对齐稳定的签名位。",
      code: `<DocumentSheet size="a4" printable={false}>
  <DocumentSheetSection title="服务说明">
    包含官网设计、组件库定制与前端实现。
  </DocumentSheetSection>
  <DocumentSheetFooter>
    <div className="flex items-end justify-between gap-8">
      <p className="text-xs">备注：报价有效期 30 天。</p>
      <DocumentSheetSignature label="授权代表（签章）" />
    </div>
  </DocumentSheetFooter>
</DocumentSheet>`,
      render: () => (
        <div className="text-sm [&_[data-document-sheet]]:p-[10mm]">
          <DocumentSheet size="auto" printable={false}>
            <DocumentSheetSection title="服务说明">
              <span className="text-foreground">包含官网设计、组件库定制与前端实现。</span>
            </DocumentSheetSection>
            <DocumentSheetFooter>
              <div className="flex items-end justify-between gap-8">
                <p className="text-xs leading-relaxed">备注：报价有效期 30 天。</p>
                <DocumentSheetSignature label="授权代表（签章）" />
              </div>
            </DocumentSheetFooter>
          </DocumentSheet>
        </div>
      ),
    },
    {
      title: "自定义打印回调",
      description: "传 onPrint 接管打印动作（如先校验再 window.print），缺省时内置按钮直接调用 window.print()。",
      code: `<DocumentSheet
  size="a4"
  onPrint={() => {
    // 自定义逻辑后再打印
    window.print();
  }}
>
  <DocumentSheetSection title="发票抬头">
    某某科技有限公司
  </DocumentSheetSection>
</DocumentSheet>`,
      render: () => (
        <div className="text-sm [&_[data-document-sheet]]:p-[10mm]">
          <DocumentSheet size="auto" onPrint={() => {}}>
            <DocumentSheetSection title="发票抬头">
              <span className="text-foreground">某某科技有限公司</span>
            </DocumentSheetSection>
          </DocumentSheet>
        </div>
      ),
    },
  ],
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
