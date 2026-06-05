"use client";
import { useState } from "react";
import {
  Banner,
  ButtonGroup,
  Button,
  Glimpse,
  RelativeTime,
  Tag,
  Drawer,
  DrawerContent,
  Descriptions,
  DescriptionsItem,
  Empty,
  toast,
} from "@hulianui/ui";
import { TriangleAlert, Download, FileText } from "lucide-react";
import { invoices, invoiceStatusMeta } from "../../_data/invoices";
import { formatMoney } from "../../_data/plans";
import type { Invoice, InvoiceStatus } from "../../_data/types";

const filters: { key: "all" | InvoiceStatus; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "paid", label: "已支付" },
  { key: "failed", label: "支付失败" },
  { key: "refunded", label: "已退款" },
];

export default function InvoicesPage() {
  const [filter, setFilter] = useState<"all" | InvoiceStatus>("all");
  const [active, setActive] = useState<Invoice | null>(null);

  const failed = invoices.filter((i) => i.status === "failed");
  const rows = invoices.filter((i) => filter === "all" || i.status === filter);
  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">账单与发票</h1>
          <p className="mt-1 text-sm text-muted">累计已支付 <span className="font-medium text-foreground">{formatMoney(totalPaid)}</span> · 共 {invoices.length} 张账单</p>
        </div>
        <ButtonGroup aria-label="按状态筛选">
          {filters.map((f) => (
            <Button key={f.key} variant={filter === f.key ? "solid" : "outline"} size="sm" onClick={() => setFilter(f.key)}>
              {f.label}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      {/* 支付失败告警条 */}
      {failed.length > 0 && (
        <Banner
          tone="danger"
          variant="soft"
          icon={<TriangleAlert />}
          align="start"
          action={
            <Button size="sm" variant="outline" onClick={() => toast({ title: "已发起重新扣款", tone: "info" })}>
              立即重试
            </Button>
          }
        >
          有 {failed.length} 笔扣款失败，请更新支付方式或重试，以免影响服务。
        </Banner>
      )}

      {/* 账单表 */}
      <section className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface">
        {rows.length === 0 ? (
          <div className="py-16">
            <Empty description="该状态下暂无账单" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-5 py-3 font-medium">发票号</th>
                <th className="hidden px-5 py-3 font-medium sm:table-cell">项目</th>
                <th className="px-5 py-3 font-medium">出账</th>
                <th className="px-5 py-3 text-right font-medium">金额</th>
                <th className="px-5 py-3 font-medium">状态</th>
                <th className="px-5 py-3 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((inv) => {
                const meta = invoiceStatusMeta[inv.status];
                return (
                  <tr key={inv.id} className="transition-colors hover:bg-surface-hover">
                    <td className="px-5 py-3.5">
                      <Glimpse
                        title={`${inv.id} · ${inv.plan}`}
                        description={`计费周期 ${inv.period}，合计 ${formatMoney(inv.amount)}，含 ${inv.lines.length} 项明细。`}
                      >
                        <span className="font-medium text-foreground">{inv.id}</span>
                      </Glimpse>
                    </td>
                    <td className="hidden px-5 py-3.5 text-muted sm:table-cell">{inv.plan}</td>
                    <td className="px-5 py-3.5 text-muted">
                      <RelativeTime value={inv.date} />
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium tabular-nums text-foreground">{formatMoney(inv.amount)}</td>
                    <td className="px-5 py-3.5">
                      <Tag tone={meta.tone} size="sm">{meta.label}</Tag>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setActive(inv)}>
                          详情
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="下载 PDF"
                          onClick={() => toast({ title: `已下载 ${inv.id}.pdf`, tone: "info" })}
                        >
                          <Download className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* 详情抽屉 */}
      <Drawer open={active !== null} onOpenChange={(o) => !o && setActive(null)}>
        <DrawerContent
          side="right"
          title={active ? `${active.id} · 发票详情` : ""}
          className="w-[min(560px,92vw)]"
          footer={
            active && (
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setActive(null)}>关闭</Button>
                <Button onClick={() => toast({ title: `已下载 ${active.id}.pdf`, tone: "info" })}>
                  <Download className="size-4" /> 下载 PDF
                </Button>
              </div>
            )
          }
        >
          {active && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3 rounded-[var(--radius)] border border-border bg-bg p-4">
                <span className="grid size-10 place-items-center rounded-[var(--radius)] bg-primary/10 text-primary">
                  <FileText className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{active.plan}</p>
                  <p className="text-xs text-muted">
                    出账 <RelativeTime value={active.date} /> · {active.period}
                  </p>
                </div>
                <Tag tone={invoiceStatusMeta[active.status].tone} size="sm" className="ml-auto">
                  {invoiceStatusMeta[active.status].label}
                </Tag>
              </div>

              <Descriptions column={2} bordered>
                <DescriptionsItem label="发票号">{active.id}</DescriptionsItem>
                <DescriptionsItem label="开票主体">瀚云数智科技有限公司</DescriptionsItem>
                <DescriptionsItem label="税号">91110108MA0XXXXX</DescriptionsItem>
                <DescriptionsItem label="付款方式">{active.status === "paid" ? "自动扣款" : "—"}</DescriptionsItem>
              </Descriptions>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">费用明细</h3>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-border">
                    {active.lines.map((l, i) => (
                      <tr key={i}>
                        <td className="py-2.5 text-muted">{l.label}</td>
                        <td className="py-2.5 text-right font-medium tabular-nums text-foreground">{formatMoney(l.amount)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="pt-3 font-semibold text-foreground">合计</td>
                      <td className="pt-3 text-right text-base font-semibold tabular-nums text-foreground">{formatMoney(active.amount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
