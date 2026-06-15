"use client";
import { Activity, Users, ShoppingCart } from "lucide-react";
import type { ShowcaseSpec } from "../showcase/types";
import { Stat } from "./stat";

export const statShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "传入 label 与 value 即成一张 KPI 指标卡。",
      code: `<Stat label="注册用户" value="8,021" />`,
      render: () => <Stat label="注册用户" value="8,021" className="w-64" />,
    },
    {
      title: "环比趋势",
      description: "delta>=0 升（text-primary）/ <0 降（text-danger），配 deltaLabel 说明口径。",
      code: `<>
  <Stat label="本月 GMV" value="¥128,400" delta={12.5} deltaLabel="较上月" />
  <Stat label="退款率" value="2.3%" delta={-4.1} deltaLabel="较上月" />
</>`,
      render: () => (
        <div className="flex flex-wrap gap-4">
          <Stat label="本月 GMV" value="¥128,400" delta={12.5} deltaLabel="较上月" className="w-64" />
          <Stat label="退款率" value="2.3%" delta={-4.1} deltaLabel="较上月" className="w-64" />
        </div>
      ),
    },
    {
      title: "带图标",
      description: "icon 插槽渲染在右上角，弱化为 muted 色。",
      code: `<Stat
  label="本月 GMV"
  value="¥128,400"
  delta={12.5}
  deltaLabel="较上月"
  icon={<Activity className="size-4" />}
/>`,
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
      title: "网格排布",
      description: "多张指标卡可直接用网格布局拼成看板。",
      code: `<div className="grid grid-cols-2 gap-4">
  <Stat label="注册用户" value="8,021" delta={5.2} deltaLabel="较上月" icon={<Users className="size-4" />} />
  <Stat label="订单数" value="1,204" delta={-2.1} deltaLabel="较上月" icon={<ShoppingCart className="size-4" />} />
</div>`,
      render: () => (
        <div className="grid w-[34rem] max-w-full grid-cols-2 gap-4">
          <Stat label="注册用户" value="8,021" delta={5.2} deltaLabel="较上月" icon={<Users className="size-4" />} />
          <Stat label="订单数" value="1,204" delta={-2.1} deltaLabel="较上月" icon={<ShoppingCart className="size-4" />} />
        </div>
      ),
    },
  ],
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
