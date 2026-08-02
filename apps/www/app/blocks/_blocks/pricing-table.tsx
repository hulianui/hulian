/** @jsxImportSource ../../../lib/fixture-jsx */
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Button,
  Card,
  CardBody,
  cn,
  Divider,
  Heading,
  Segmented,
  ShimmerButton,
  Stack,
  Tag,
  Text,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@hulianui/ui";
import { Check, HelpCircle } from "lucide-react";

// 定价表 Block —— 自包含、可整段复制。
// Segmented 切月付/年付，年付段内置「省 2 个月」徽标；三套餐卡片，推荐套餐放大上浮。
// 数据全部内联在本文件，复制后改 PLANS / FEATURE_TIPS 即可。CTA 链接通过 ctaHref 注入。

interface Plan {
  name: string;
  tagline: string;
  monthly: number;
  yearly: number;
  /** 价格无意义时（如企业版）展示的自定义文案。 */
  customPrice?: string;
  features: string[];
  cta: string;
  highlight?: boolean;
}

const PLANS: Plan[] = [
  {
    name: "入门",
    tagline: "个人项目与原型验证",
    monthly: 0,
    yearly: 0,
    features: ["1 个生产项目", "每月 100 GB 流量", "社区支持", "自动 HTTPS 与全球 CDN", "单人协作"],
    cta: "免费开始",
  },
  {
    name: "专业",
    tagline: "成长中的团队与生产业务",
    monthly: 199,
    yearly: 1990,
    features: [
      "无限项目",
      "每月 1 TB 流量",
      "弹性算力自动伸缩",
      "指标 / 日志 / 链路追踪",
      "最多 10 名成员",
      "工单 4 小时响应",
    ],
    cta: "开始 14 天试用",
    highlight: true,
  },
  {
    name: "企业",
    tagline: "合规、私有化与专属支持",
    monthly: 0,
    yearly: 0,
    customPrice: "定制",
    features: [
      "专属边缘节点与算力池",
      "SOC 2 / 等保三级合规",
      "SSO 与细粒度审计",
      "专属客户成功经理",
      "99.99% SLA 保障",
      "私有化部署可选",
    ],
    cta: "预约演示",
  },
];

// 功能项的详细说明（Tooltip 内容）。key 与 features 文案对应，无对应项则不显示问号。
const FEATURE_TIPS: Record<string, string> = {
  "每月 100 GB 流量": "超出后按 ¥0.3/GB 计费，不会强制断流。",
  "每月 1 TB 流量": "超出后按 ¥0.25/GB 计费，可设预算上限提前告警。",
  "弹性算力自动伸缩": "按实际请求时长计费，零流量时归零，不产生闲置费用。",
  "指标 / 日志 / 链路追踪": "内置 OpenTelemetry 采集栈，30 天数据保留，开箱可用。",
  "最多 10 名成员": "可申请扩展席位，超额成员按 ¥29/人·月单独计费。",
  "工单 4 小时响应": "工作日 09:00–22:00 保证响应，P0 故障 7×24 值班。",
  "SOC 2 / 等保三级合规": "年度第三方审计，企业采购可提供合规证明文件。",
  "SSO 与细粒度审计": "支持 SAML 2.0 / OIDC 单点登录，操作日志可导出。",
  "99.99% SLA 保障": "月度可用性低于承诺时自动按比例减免账单，无需申请。",
  "私有化部署可选": "支持客户自有 IDC 或专有云，联系销售获取方案。",
};

function priceLabel(plan: Plan, period: "monthly" | "yearly") {
  if (plan.customPrice) return { amount: plan.customPrice, unit: "" };
  if (plan.monthly === 0) return { amount: "¥0", unit: "/ 永久免费" };
  if (period === "yearly") return { amount: `¥${plan.yearly.toLocaleString()}`, unit: "/ 年" };
  return { amount: `¥${plan.monthly}`, unit: "/ 月" };
}

function PlanCard({
  plan,
  period,
  ctaHref,
}: {
  plan: Plan;
  period: "monthly" | "yearly";
  ctaHref: string;
}) {
  const { amount, unit } = priceLabel(plan, period);
  const yearlySave =
    plan.monthly > 0 && plan.yearly > 0
      ? Math.round((1 - plan.yearly / (plan.monthly * 12)) * 100)
      : 0;

  return (
    <Card
      variant={plan.highlight ? "featured" : "outline"}
      className={cn(
        "relative h-full overflow-hidden",
        // 推荐套餐放大一档并上浮，形成视觉主次；仅 3 列布局生效，移动端堆叠时不缩放。
        plan.highlight && "lg:z-10 lg:scale-[1.04]",
      )}
    >
      <CardBody className="flex h-full flex-col gap-5 p-6">
        <div>
          <Stack direction="row" align="center" gap={2}>
            <Heading level={3} size="lg" weight="semibold">
              {plan.name}
            </Heading>
            {plan.highlight && (
              <Tag variant="solid" tone="brand" size="sm">
                最受欢迎
              </Tag>
            )}
          </Stack>
          <Text tone="muted" size="sm" className="mt-1">
            {plan.tagline}
          </Text>
        </div>

        <div className="flex items-end gap-1.5">
          <span className="text-4xl font-bold tracking-tight text-foreground">{amount}</span>
          {unit && (
            <Text tone="muted" size="sm" className="pb-1.5">
              {unit}
            </Text>
          )}
          {period === "yearly" && yearlySave > 0 && (
            <Tag variant="soft" tone="success" size="sm" className="mb-1.5 ml-1">
              省 {yearlySave}%
            </Tag>
          )}
        </div>

        {plan.highlight ? (
          <ShimmerButton className="w-full" render={<Link href={ctaHref} />}>
            {plan.cta}
          </ShimmerButton>
        ) : (
          <Button variant="outline" className="w-full" render={<Link href={ctaHref} />}>
            {plan.cta}
          </Button>
        )}

        <Divider />

        <TooltipProvider delay={150}>
          <Stack direction="column" gap={3} className="flex-1">
            {plan.features.map((f) => (
              <Stack key={f} direction="row" align="start" gap={2}>
                <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <Text size="sm" className="flex-1">
                  {f}
                </Text>
                {FEATURE_TIPS[f] && (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <button
                          type="button"
                          className="mt-0.5 shrink-0 text-muted transition-colors hover:text-foreground focus-visible:outline-none"
                          aria-label={`了解更多：${f}`}
                        >
                          <HelpCircle className="size-3.5" aria-hidden />
                        </button>
                      }
                    />
                    <TooltipContent side="top" className="max-w-[14rem]">
                      {FEATURE_TIPS[f]}
                    </TooltipContent>
                  </Tooltip>
                )}
              </Stack>
            ))}
          </Stack>
        </TooltipProvider>
      </CardBody>
    </Card>
  );
}

export function PricingTableBlock({ ctaHref = "#" }: { ctaHref?: string }) {
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  return (
    <div className="mx-auto w-full max-w-5xl">
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
      <div className="grid gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <PlanCard key={plan.name} plan={plan} period={period} ctaHref={ctaHref} />
        ))}
      </div>
    </div>
  );
}
