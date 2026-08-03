import { copy } from "./page.content";
import { demoLocationHref } from "../../../_components/demo-locale";
import type { Metadata } from "next";
import { Heading, Text, Tag, Breadcrumb } from "@hulianui/ui";
import { PricingTable } from "../../_components/pricing-table";
import { Faq } from "../../_components/sections/faq";

export const metadata: Metadata = {
  title: copy("pricingHancloud"),
  description: copy("startFreeAndScaleToEnterpriseComplianceAndDedicatedSupportWithTransparentPricingAndNoSurpriseBil"),
};

export default function PricingPage() {
  return (
    <>
      <section className="border-b border-border px-6 pb-20 pt-12 sm:pt-16">
        <div className="mx-auto w-full max-w-6xl">
          <Breadcrumb
            className="mb-8"
            items={[{ label: copy("home"), href: demoLocationHref("/demos/website") }, { label: copy("pricing") }]}
          />

          <div className="mb-12 flex flex-col items-center gap-3 text-center">
            <Tag variant="soft" tone="brand" size="sm">

              {copy("pricing")}
            </Tag>
            <Heading level={1} size="4xl" weight="bold" balance className="text-foreground">

              {copy("chooseAPlanThatGrowsWithYourTeam")}
            </Heading>
            <Text tone="muted" size="lg" className="max-w-2xl">

              {copy("everyPlanIncludesAGlobalCdnAutomaticHttpsAndUnlimitedDeploymentsUpgradeOrDowngradeAtAnyTimeAndPa")}
            </Text>
          </div>

          <PricingTable />
        </div>
      </section>

      <Faq />
    </>
  );
}
