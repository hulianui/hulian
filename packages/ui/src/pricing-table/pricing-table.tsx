import { memo } from "react";
import { cn } from "../lib/cn";
import { ScrollArea } from "../scroll-area";
import type { PricingTableProps } from "./pricing-table.types";

// PricingTable = 行列转置的对比矩阵：列=被比项(模型)，行=属性(输入价/输出价/上下文/能力)。
// 区别于普通 Table(行=记录)。highlight 列描边 + 顶部角标(推荐/最佳性价比)，表头 sticky，窄屏横滚。
// 模型市场定价对照刚需。纯皮肤，仅消费语义 token。
function PricingTableImpl({ columns, rows, stickyHeader = true, className }: PricingTableProps) {
  return (
    <ScrollArea orientation="horizontal" className={cn("w-full", className)}>
      <table className="w-full border-collapse text-sm">
        <thead className={cn(stickyHeader && "sticky top-0 z-10")}>
          <tr>
            <th className="sticky left-0 z-10 bg-bg p-0" aria-hidden />
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "min-w-32 border-b border-border bg-surface px-4 py-3 text-center align-bottom font-semibold text-foreground",
                  col.highlight && "border-x border-t border-primary bg-primary/5",
                )}
              >
                {col.badge != null && (
                  <span className="mb-1.5 inline-flex rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                    {col.badge}
                  </span>
                )}
                <div>{col.header ?? col.title}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={row.key}>
              <th
                scope="row"
                className="sticky left-0 z-[5] whitespace-nowrap border-b border-border bg-bg px-4 py-3 text-left font-medium text-muted-foreground"
              >
                {row.label}
              </th>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "border-b border-border px-4 py-3 text-center tabular-nums text-foreground",
                    col.highlight && "border-x border-primary bg-primary/5",
                    col.highlight && ri === rows.length - 1 && "border-b-primary",
                  )}
                >
                  {row.values[col.key] ?? <span className="text-muted-foreground">—</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollArea>
  );
}

export const PricingTable = memo(PricingTableImpl);
PricingTable.displayName = "PricingTable";
