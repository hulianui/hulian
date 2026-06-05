import Link from "next/link";
import {
  Card,
  CardBody,
  Heading,
  Text,
  Tag,
  Button,
  ShimmerButton,
  Stack,
  Divider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  cn,
} from "@hulianui/ui";
import { Check, HelpCircle } from "lucide-react";
import { plans, type Plan } from "../_data/site";

// 定价功能项的详细说明（Tooltip 内容）。
const featureTips: Record<string, string> = {
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

function PlanCard({ plan, period }: { plan: Plan; period: "monthly" | "yearly" }) {
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
          <ShimmerButton className="w-full" render={<Link href="/demos/website/contact" />}>
            {plan.cta}
          </ShimmerButton>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            render={<Link href="/demos/website/contact" />}
          >
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
                {featureTips[f] && (
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
                      {featureTips[f]}
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

// 三套餐价目表。period 由消费者控制（首页 teaser 固定 monthly，定价页用 Segmented 切换）。
export function PricingCards({ period = "monthly" }: { period?: "monthly" | "yearly" }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {plans.map((plan) => (
        <PlanCard key={plan.name} plan={plan} period={period} />
      ))}
    </div>
  );
}
