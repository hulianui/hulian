"use client";

import { useState } from "react";
import { Segmented, Tag, Stack } from "@hulianui/ui";
import { PricingCards } from "./pricing-cards";

// 定价表：Segmented 控制月付/年付，年付段内置「省 2 个月」徽标（结构上归属年付，无外挂飘标签）。
export function PricingTable() {
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  return (
    <div>
      <Stack direction="row" justify="center" className="mb-10">
        <Segmented
          items={[
            { value: "monthly", label: "按月付费" },
            {
              value: "yearly",
              ariaLabel: "按年付费，立省 2 个月",
              label: (
                <>
                  按年付费
                  <Tag variant="soft" tone="success" size="sm">
                    省 2 个月
                  </Tag>
                </>
              ),
            },
          ]}
          value={period}
          onValueChange={(v) => setPeriod(v as "monthly" | "yearly")}
        />
      </Stack>
      <PricingCards period={period} />
    </div>
  );
}
