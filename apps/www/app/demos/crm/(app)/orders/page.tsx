"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardBody, DateRangePicker, ProTable, Stat, Tag, type ColumnDef } from "@hulian/ui";
import type { DateRangeValue } from "@hulian/ui";
import { orders as seed } from "../../_data/orders";
import { orderStatusTone, yuan } from "../../_data/status";
import type { Order, OrderStatus } from "../../_data/types";
import { useMockData } from "../../../lib/async";

const ORDER_STATUSES: OrderStatus[] = ["待付款", "已付款", "已发货", "已完成", "已退款"];
const PAGE_SIZE = 10;

const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "orderNo",
    header: "订单号",
    cell: ({ row }) => <span className="font-mono text-sm tabular-nums">{row.original.orderNo}</span>,
  },
  {
    accessorKey: "customerName",
    header: "客户",
    cell: ({ row }) => (
      <Link href={`/demos/crm/customers/${row.original.customerId}`} className="hover:text-primary">
        {row.original.customerName}
      </Link>
    ),
  },
  {
    accessorKey: "amount",
    header: "金额",
    cell: ({ row }) => <span className="font-medium tabular-nums">{yuan(row.original.amount)}</span>,
  },
  { accessorKey: "items", header: "商品数", cell: ({ row }) => `${row.original.items} 件` },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ row }) => (
      <Tag tone={orderStatusTone[row.original.status]} size="sm" dot>
        {row.original.status}
      </Tag>
    ),
  },
  { accessorKey: "createdAt", header: "下单时间" },
];

export default function OrdersPage() {
  const { data, loading } = useMockData(seed);
  const [rows, setRows] = useState<Order[]>([]);
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [dateRange, setDateRange] = useState<DateRangeValue | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (data) setRows(data);
  }, [data]);

  const filtered = useMemo(() => {
    const kw = String(filters.keyword ?? "").trim();
    return rows.filter((o) => {
      if (kw && !`${o.orderNo}${o.customerName}`.includes(kw)) return false;
      if (filters.status && o.status !== filters.status) return false;
      if (dateRange) {
        const [start, end] = dateRange;
        const created = o.createdAt.slice(0, 10);
        if (created < start || created > end) return false;
      }
      return true;
    });
  }, [rows, filters, dateRange]);

  const total = filtered.length;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const revenue = rows
    .filter((o) => o.status === "已完成" || o.status === "已发货" || o.status === "已付款")
    .reduce((s, o) => s + o.amount, 0);
  const pendingCount = rows.filter((o) => o.status === "待付款").length;
  const done = rows.filter((o) => o.status === "已完成").length;

  const stats = [
    { label: "订单总数", value: rows.length },
    { label: "成交金额", value: yuan(revenue) },
    { label: "待付款", value: pendingCount },
    { label: "已完成", value: done },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} variant="outline">
            <CardBody className="p-4">
              <Stat label={s.label} value={s.value} />
            </CardBody>
          </Card>
        ))}
      </div>

      <ProTable<Order>
        title="订单列表"
        columns={columns}
        data={paged}
        loading={loading}
        getRowId={(r) => r.id}
        search={{
          fields: [
            { name: "keyword", label: "关键词", placeholder: "订单号 / 客户" },
            {
              name: "status",
              label: "状态",
              type: "select",
              options: [{ value: "", label: "全部" }, ...ORDER_STATUSES.map((s) => ({ value: s, label: s }))],
            },
            {
              name: "dateRange",
              label: "下单日期",
              render: ({ value, onChange }) => (
                <DateRangePicker
                  value={(value as DateRangeValue | null) ?? null}
                  onValueChange={(range) => {
                    onChange(range);
                    setDateRange(range);
                    setPage(1);
                  }}
                  placeholder={["开始日期", "结束日期"]}
                />
              ),
            },
          ],
          onSearch: (v) => {
            setFilters(v);
            setPage(1);
          },
          onReset: () => {
            setFilters({});
            setDateRange(null);
            setPage(1);
          },
        }}
        pagination={{ page, pageSize: PAGE_SIZE, total, onPageChange: setPage }}
      />
    </div>
  );
}
