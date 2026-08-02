import { copy } from "./pricing-cards.content";
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
import { demoHref } from "../../_components/demo-locale";

// 定价功能项的详细说明（Tooltip 内容）。
const featureTips: Record<string, string> = {
  [copy("text100GbPerMonth")]: copy("additionalUsageCosts030GbTrafficIsNeverCutOffAutomatically"),
  [copy("text1TbPerMonth")]: copy("additionalUsageCosts025GbSetABudgetCapToReceiveAnEarlyWarning"),
  [copy("autoscalingCompute")]: copy("payOnlyForRequestExecutionTimeScaleToZeroWhenTrafficStopsWithNoIdleCharges"),
  [copy("metricsLogsDistributedTraces")]: copy("builtInOpentelemetryCollectionWith30DaysOfRetentionReadyFromDayOne"),
  [copy("upTo10Members")]: copy("addSeatsAsNeededFor29PerUserEachMonth"),
  [copy("fourHourTicketResponse")]: copy("guaranteedResponsesFrom0900To2200OnBusinessDaysWith247OnCallCoverageForP0Incidents"),
  [copy("soc2ClassIiiCompliance")]: copy("independentAnnualAuditsWithComplianceDocumentsAvailableForEnterpriseProcurement"),
  [copy("ssoAndFineGrainedAuditing")]: copy("saml20AndOidcSingleSignOnWithExportableAuditLogs"),
  [copy("text9999SlaGuaranteed")]: copy("ifMonthlyAvailabilityFallsBelowTheSlaServiceCreditsAreAppliedAutomatically"),
  [copy("privateDeploymentOptional")]: copy("deployToYourOwnDataCenterOrPrivateCloudContactSalesForATailoredPlan"),
};

function priceLabel(plan: Plan, period: "monthly" | "yearly") {
  if (plan.customPrice) return { amount: plan.customPrice, unit: "" };
  if (plan.monthly === 0) return { amount: "¥0", unit: copy("freeForever") };
  if (period === "yearly") return { amount: `¥${plan.yearly.toLocaleString()}`, unit: copy("year") };
  return { amount: `¥${plan.monthly}`, unit: copy("month") };
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

                {copy("mostPopular")}
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

              {copy("save")} {yearlySave}%
            </Tag>
          )}
        </div>

        {plan.highlight ? (
          <ShimmerButton className="w-full" render={<Link href={demoHref("/demos/website/contact")} />}>
            {plan.cta}
          </ShimmerButton>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            render={<Link href={demoHref("/demos/website/contact")} />}
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
                          aria-label={`${copy("learnMore")}${f}`}
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
