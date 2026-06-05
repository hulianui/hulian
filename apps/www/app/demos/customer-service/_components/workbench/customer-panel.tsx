"use client";
import { Avatar, Descriptions, Heading, Tag, Timeline } from "@hulianui/ui";
import type { Customer } from "../../_data/types";

const LEVEL_TONE: Record<Customer["level"], "neutral" | "brand" | "warning" | "success"> = {
  普通: "neutral",
  银卡: "brand",
  金卡: "warning",
  黑卡: "success",
};

const yuan = (n: number) => `¥${n.toLocaleString("zh-CN")}`;

export function CustomerPanel({ customer }: { customer?: Customer }) {
  if (!customer) {
    return (
      <div className="grid h-full place-items-center border-l border-border bg-surface text-sm text-muted">
        无客户档案
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto border-l border-border bg-surface">
      {/* 头部档案卡 */}
      <div className="flex flex-col items-center gap-2 border-b border-border px-4 py-5 text-center">
        <Avatar src={customer.avatar} fallback={customer.name.slice(0, 1)} size="lg" />
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold">{customer.name}</span>
          <Tag tone={LEVEL_TONE[customer.level]} size="sm" variant="soft">
            {customer.level}
          </Tag>
        </div>
        <div className="flex flex-wrap justify-center gap-1">
          {customer.tags.map((t) => (
            <Tag key={t} tone="neutral" size="sm" variant="outline">
              {t}
            </Tag>
          ))}
        </div>
      </div>

      {/* 资料 */}
      <div className="border-b border-border px-4 py-4">
        <Descriptions
          column={1}
          items={[
            { label: "手机", children: customer.phone },
            { label: "地区", children: customer.region },
            { label: "注册", children: customer.since },
            { label: "累计消费", children: yuan(customer.totalSpend) },
            { label: "累计订单", children: `${customer.orders} 笔` },
          ]}
        />
      </div>

      {/* 历史互动 / 工单 */}
      <div className="px-4 py-4">
        <Heading level={3} size="sm" className="mb-3">
          历史互动
        </Heading>
        <Timeline
          items={customer.history.map((h) => ({
            label: h.at,
            children: h.text,
            color: "primary" as const,
          }))}
        />
      </div>
    </div>
  );
}
