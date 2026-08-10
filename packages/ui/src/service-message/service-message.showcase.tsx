"use client";
import type { ReactNode } from "react";
import { LayoutGrid } from "lucide-react";
import type { ShowcaseSpec } from "../showcase/types";
import { ServiceMessage } from "./service-message";

// 演示用「小程序入口」图标（通用 app 标识·吃主色，非任何平台真实商标）
const miniProgram = <LayoutGrid className="size-3.5 text-primary" aria-hidden />;

// 微信服务通知消息流里卡片之间的时间分隔（居中灰字）
function TimeDivider({ children }: { children: ReactNode }) {
  return <div className="py-0.5 text-center text-xs text-muted-foreground">{children}</div>;
}

export const serviceMessageShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "头像 + 来源 + 键值字段 + 底部入口，复刻微信服务通知卡片。",
      code: `<ServiceMessage
  avatar={{ fallback: "瑞", className: "bg-primary/10 text-primary" }}
  source="luckincoffee 瑞幸咖啡"
  onMore={() => openMore()}
  title="商品领取提醒"
  fields={[
    { label: "取餐号", value: "361" },
    { label: "商品数量", value: "1" },
    { label: "商品详情", value: "橙C冰茶" },
  ]}
  action={{ icon: <MiniProgramIcon /> }}
  onAction={() => openMiniProgram()}
/>`,
      render: () => (
        <ServiceMessage
          avatar={{ fallback: "瑞", className: "bg-primary/10 text-primary" }}
          source="luckincoffee 瑞幸咖啡"
          onMore={() => {}}
          title="商品领取提醒"
          fields={[
            { label: "取餐号", value: "361" },
            { label: "商品数量", value: "1" },
            { label: "商品详情", value: "橙C冰茶" },
          ]}
          action={{ icon: miniProgram }}
          onAction={() => {}}
        />
      ),
    },
    {
      title: "自定义正文",
      description: "传 children 覆盖 fields，承载非键值结构的内容。",
      code: `<ServiceMessage
  avatar={{ fallback: "顺", className: "bg-warning/15 text-warning" }}
  source="顺丰速运"
  title="您的包裹已签收"
  footer="查看物流详情"
  action={{ label: "详情", icon: <MiniProgramIcon /> }}
  onAction={() => openTracking()}
>
  <p className="text-sm leading-relaxed text-foreground">
    您的快件已由 <span className="font-medium">本人</span> 签收，感谢使用顺丰速运。
  </p>
</ServiceMessage>`,
      render: () => (
        <ServiceMessage
          avatar={{ fallback: "顺", className: "bg-warning/15 text-warning" }}
          source="顺丰速运"
          onMore={() => {}}
          title="您的包裹已签收"
          footer="查看物流详情"
          action={{ label: "详情", icon: miniProgram }}
          onAction={() => {}}
        >
          <p className="text-sm leading-relaxed text-foreground">
            您的快件已由 <span className="font-medium">本人</span> 签收，感谢使用顺丰速运。期待再次为您服务。
          </p>
          <p className="mt-2 text-xs text-muted-foreground">运单号 SF1234567890123 · 今天 14:32</p>
        </ServiceMessage>
      ),
    },
    {
      title: "无更多按钮",
      description: "不传 onMore 即隐藏头部 ⋯ 按钮；action.label 可自定义动作文字。",
      code: `<ServiceMessage
  avatar={{ fallback: "OA", className: "bg-success/15 text-success" }}
  source="企业 OA · 审批助手"
  title="报销单已通过"
  fields={[
    { label: "单据编号", value: "BX-2026-000812" },
    { label: "报销金额", value: "¥ 1,280.00" },
    { label: "审批结果", value: "已通过" },
  ]}
  footer="进入审批中心"
  action={{ label: "查看", icon: <MiniProgramIcon /> }}
  onAction={() => openApproval()}
/>`,
      render: () => (
        <ServiceMessage
          avatar={{ fallback: "OA", className: "bg-success/15 text-success" }}
          source="企业 OA · 审批助手"
          title="报销单已通过"
          fields={[
            { label: "单据编号", value: "BX-2026-000812" },
            { label: "报销金额", value: "¥ 1,280.00" },
            { label: "审批结果", value: "已通过" },
          ]}
          footer="进入审批中心"
          action={{ label: "查看", icon: miniProgram }}
          onAction={() => {}}
        />
      ),
    },
    {
      title: "极简",
      description: "仅标题 + 底部入口（无头像 / 字段）。",
      code: `<ServiceMessage
  source="系统通知"
  title="您有 1 条新的系统消息待查看"
  footer="查看详情"
  onAction={() => openDetail()}
/>`,
      render: () => (
        <ServiceMessage
          source="系统通知"
          title="您有 1 条新的系统消息待查看"
          footer="查看详情"
          onAction={() => {}}
        />
      ),
    },
  ],
  controls: [
    { prop: "source", type: "text", defaultValue: "luckincoffee 瑞幸咖啡", label: "来源" },
    { prop: "title", type: "text", defaultValue: "商品领取提醒", label: "标题" },
    { prop: "footer", type: "text", defaultValue: "进入小程序查看", label: "底部引导" },
    { prop: "more", type: "boolean", defaultValue: true, label: "更多按钮" },
  ],
  states: [
    {
      name: "服务通知（复刻微信模板消息流）",
      render: () => (
        <div className="flex w-full max-w-sm flex-col gap-2 rounded-xl bg-surface-hover p-4">
          <ServiceMessage
            avatar={{ fallback: "瑞", className: "bg-primary/10 text-primary" }}
            source="luckincoffee 瑞幸咖啡"
            onMore={() => {}}
            title="商品领取提醒"
            fields={[
              { label: "取餐号", value: "361" },
              { label: "商品数量", value: "1" },
              { label: "商品详情", value: "橙C冰茶" },
            ]}
            action={{ icon: miniProgram }}
            onAction={() => {}}
          />
          <TimeDivider>09:17</TimeDivider>
          <ServiceMessage
            avatar={{ fallback: "瑞", className: "bg-primary/10 text-primary" }}
            source="luckincoffee 瑞幸咖啡"
            onMore={() => {}}
            title="新品上新通知"
            fields={[
              { label: "商品名称", value: "海盐焦糖拿铁🌊 夏日限定回归" },
              { label: "推荐理由", value: "澳洲海盐 x 馥郁焦糖，可盐可甜~" },
              { label: "活动内容", value: "🐱 Hello Kitty 联名款" },
            ]}
            action={{ icon: miniProgram }}
            onAction={() => {}}
          />
        </div>
      ),
    },
    {
      name: "物流签收（自定义正文 children）",
      render: () => (
        <ServiceMessage
          avatar={{ fallback: "顺", className: "bg-warning/15 text-warning" }}
          source="顺丰速运"
          onMore={() => {}}
          title="您的包裹已签收"
          footer="查看物流详情"
          action={{ label: "详情", icon: miniProgram }}
          onAction={() => {}}
        >
          <p className="text-sm leading-relaxed text-foreground">
            您的快件已由 <span className="font-medium">本人</span> 签收，感谢使用顺丰速运。期待再次为您服务。
          </p>
          <p className="mt-2 text-xs text-muted-foreground">运单号 SF1234567890123 · 今天 14:32</p>
        </ServiceMessage>
      ),
    },
    {
      name: "审批通过（无更多按钮 · 自定义动作文字）",
      render: () => (
        <ServiceMessage
          avatar={{ fallback: "OA", className: "bg-success/15 text-success" }}
          source="企业 OA · 审批助手"
          title="报销单已通过"
          fields={[
            { label: "单据编号", value: "BX-2026-000812" },
            { label: "报销金额", value: "¥ 1,280.00" },
            { label: "审批人", value: "李经理" },
            { label: "审批结果", value: "已通过" },
          ]}
          footer="进入审批中心"
          action={{ label: "查看", icon: miniProgram }}
          onAction={() => {}}
        />
      ),
    },
    {
      name: "极简（仅标题 + 底部入口）",
      render: () => (
        <ServiceMessage
          source="系统通知"
          title="您有 1 条新的系统消息待查看"
          footer="查看详情"
          onAction={() => {}}
        />
      ),
    },
  ],
  renderWithProps: (p) => (
    <ServiceMessage
      avatar={{ fallback: "瑞", className: "bg-primary/10 text-primary" }}
      source={String(p.source ?? "")}
      onMore={p.more ? () => {} : undefined}
      title={String(p.title ?? "")}
      fields={[
        { label: "取餐号", value: "361" },
        { label: "商品数量", value: "1" },
        { label: "商品详情", value: "橙C冰茶" },
      ]}
      footer={String(p.footer ?? "")}
      action={{ icon: miniProgram }}
      onAction={() => {}}
    />
  ),
  toCode: (p) => {
    const more = p.more ? "\n  onMore={() => openMore()}" : "";
    return `<ServiceMessage
  avatar={{ src: logo, fallback: "瑞" }}
  source="${String(p.source ?? "")}"${more}
  title="${String(p.title ?? "")}"
  fields={[
    { label: "取餐号", value: "361" },
    { label: "商品数量", value: "1" },
    { label: "商品详情", value: "橙C冰茶" },
  ]}
  footer="${String(p.footer ?? "")}"
  action={{ icon: <MiniProgramIcon />, label: "小程序" }}
  onAction={() => openMiniProgram()}
/>`;
  },
};
