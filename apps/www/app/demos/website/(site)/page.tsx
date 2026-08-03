import { copy } from "./page.content";
import type { Metadata } from "next";
import { Hero } from "../_components/sections/hero";
import { TrustBar } from "../_components/sections/trust-bar";
import { Stats } from "../_components/sections/stats";
import { Features } from "../_components/sections/features";
import { Product, ProductMobile } from "../_components/sections/product";
import { Integrations } from "../_components/sections/integrations";
import { Testimonials } from "../_components/sections/testimonials";
import { PricingTeaser } from "../_components/sections/pricing-teaser";
import { Faq } from "../_components/sections/faq";
import { Cta } from "../_components/sections/cta";

export const metadata: Metadata = {
  title: copy("hancloudTheIntegratedCloudNativeApplicationPlatform"),
  description: copy("hancloudTakesYouFromGitPushToAGlobalReleaseWithDeploymentElasticComputeAndEndToEndObservabilityO"),
};

export default function WebsiteHome() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Stats />
      <Features />
      <Product />
      <ProductMobile />
      <Integrations />
      <Testimonials />
      <PricingTeaser />
      <Faq />
      <Cta />
    </>
  );
}
