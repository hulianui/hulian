"use client";
import { Activity, Users, ShoppingCart } from "lucide-react";
import type { ShowcaseSpec } from "../showcase/types";
import { Stat } from "./stat";

export const statShowcase: ShowcaseSpec = {
  controls: [{ prop: "delta", type: "number", defaultValue: 12, label: "环比 %" }],
  states: [
    {
      name: "上升",
      render: () => (
        <Stat
          label="本月 GMV"
          value="¥128,400"
          delta={12.5}
          deltaLabel="较上月"
          icon={<Activity className="size-4" />}
          className="w-64"
        />
      ),
    },
    {
      name: "下降",
      render: () => (
        <Stat
          label="退款率"
          value="2.3%"
          delta={-4.1}
          deltaLabel="较上月"
          icon={<ShoppingCart className="size-4" />}
          className="w-64"
        />
      ),
    },
    {
      name: "无趋势",
      render: () => (
        <Stat label="注册用户" value="8,021" icon={<Users className="size-4" />} className="w-64" />
      ),
    },
  ],
  renderWithProps: (p) => (
    <Stat label="本月 GMV" value="¥128,400" delta={Number(p.delta)} deltaLabel="较上月" className="w-64" />
  ),
  toCode: (p) => `<Stat label="本月 GMV" value="¥128,400" delta={${p.delta}} deltaLabel="较上月" />`,
};
