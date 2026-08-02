"use client";
import { copy } from "./pricing-table.content";

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
            { value: "monthly", label: copy("payMonthly") },
            {
              value: "yearly",
              ariaLabel: copy("payAnnuallyAndSave2Months"),
              label: (
                <>

                  {copy("payAnnually")}
                  <Tag variant="soft" tone="success" size="sm">

                    {copy("save2Months")}
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
