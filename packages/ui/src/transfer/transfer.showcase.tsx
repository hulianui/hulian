"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Transfer } from "./transfer";
import type { TransferItem } from "./transfer.types";

// 权限分配场景：给某个角色勾选可访问的功能模块。
// 12 项足以让搜索真正过滤、让「全部移入/移出」一次搬动多项；
// 含一个已停用模块（disabled）演示：不可勾选、也不随「全部」移动。
const modules: TransferItem[] = [
  { key: "dashboard", label: "数据看板", description: "实时经营指标总览" },
  { key: "orders", label: "订单管理", description: "下单 / 退款 / 售后" },
  { key: "goods", label: "商品中心", description: "上下架与库存" },
  { key: "members", label: "会员管理", description: "等级 / 积分 / 标签" },
  { key: "coupon", label: "营销活动", description: "优惠券与满减" },
  { key: "finance", label: "财务对账", description: "流水与结算单" },
  { key: "logistics", label: "物流配送", description: "运单与配送区域" },
  { key: "review", label: "评价管理", description: "买家评价与回复" },
  { key: "report", label: "经营报表", description: "销量 / 复购 / 漏斗" },
  { key: "staff", label: "员工与权限", description: "角色与子账号" },
  { key: "message", label: "消息通知", description: "站内信与短信模板" },
  { key: "legacy", label: "旧版工单（已停用）", description: "迁移至新工单后冻结", disabled: true },
];

function Demo({ searchable = false, disabled = false }: { searchable?: boolean; disabled?: boolean }) {
  // 初始已授权：看板 / 订单 / 商品 —— 演示左右两侧都有足够内容可搬动。
  const [target, setTarget] = useState<string[]>(["dashboard", "orders", "goods"]);
  return (
    <Transfer
      dataSource={modules}
      targetKeys={target}
      onChange={setTarget}
      searchable={searchable}
      searchPlaceholder="搜索模块名"
      disabled={disabled}
      titles={["全部功能模块", "已授权"]}
    />
  );
}

export const transferShowcase: ShowcaseSpec = {
  controls: [
    { prop: "searchable", type: "boolean", defaultValue: false },
    { prop: "disabled", type: "boolean", defaultValue: false },
  ],
  states: [
    { name: "权限分配（勾选后用中间箭头移入/移出，›/‹ 移选中，»/« 全部）", render: () => <Demo /> },
    { name: "可搜索（两侧各带搜索框，输入「管理」即筛出多模块）", render: () => <Demo searchable /> },
    { name: "整体禁用（列表与按钮全失效）", render: () => <Demo disabled /> },
  ],
  renderWithProps: (p) => <Demo searchable={Boolean(p.searchable)} disabled={Boolean(p.disabled)} />,
  toCode: (p) =>
    `<Transfer\n  dataSource={modules}\n  targetKeys={target}\n  onChange={setTarget}\n  titles={["全部功能模块", "已授权"]}${
      p.searchable ? "\n  searchable" : ""
    }${p.disabled ? "\n  disabled" : ""}\n/>`,
};
