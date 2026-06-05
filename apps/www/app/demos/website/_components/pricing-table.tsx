"use client";

import { useState } from "react";
import { Segmented, Tag, Stack } from "@hulianui/ui";
import { PricingCards } from "./pricing-cards";

// 定价表：Segmented 控制月付/年付，驱动 PricingCards 的 period。
export function PricingTable() {
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  return (
    <div>
      <Stack direction="row" align="center" justify="center" gap={3} className="mb-10">
        <Segmented
          items={[
            { value: "monthly", label: "按月付费" },
            { value: "yearly", label: "按年付费" },
          ]}
          value={period}
          onValueChange={(v) => setPeriod(v as "monthly" | "yearly")}
        />
        <Tag variant="soft" tone="success" size="sm">
          年付立省 2 个月
        </Tag>
      </Stack>
      <PricingCards period={period} />
    </div>
  );
}
