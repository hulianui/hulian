import type { Metadata } from "next";
import { Heading, Text, Tag, Breadcrumb } from "@hulian/ui";
import { PricingTable } from "../../_components/pricing-table";
import { Faq } from "../../_components/sections/faq";

export const metadata: Metadata = {
  title: "定价 · 瀚云 HanCloud",
  description: "从免费起步，到企业级合规与专属支持——透明、可预测，没有意外账单。",
};

export default function PricingPage() {
  return (
    <>
      <section className="border-b border-border px-6 pb-20 pt-12 sm:pt-16">
        <div className="mx-auto w-full max-w-6xl">
          <Breadcrumb
            className="mb-8"
            items={[{ label: "首页", href: "/demos/website" }, { label: "定价" }]}
          />

          <div className="mb-12 flex flex-col items-center gap-3 text-center">
            <Tag variant="soft" tone="brand" size="sm">
              定价
            </Tag>
            <Heading level={1} size="4xl" weight="bold" balance className="text-foreground">
              选一个随团队成长的方案
            </Heading>
            <Text tone="muted" size="lg" className="max-w-2xl">
              所有套餐都包含全球 CDN、自动 HTTPS 与无限部署。随时升级或降级，按真实用量计费。
            </Text>
          </div>

          <PricingTable />
        </div>
      </section>

      <Faq />
    </>
  );
}
