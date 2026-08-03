import { copy } from "./hero.content";
import { demoHref } from "../../../_components/demo-locale";
import Link from "next/link";
import {
  AuroraText,
  Button,
  ShimmerButton,
  Tag,
  Heading,
  Text,
  DotPattern,
} from "@hulianui/ui";
import { ArrowRight, Zap } from "lucide-react";
import { brand } from "../../_data/site";

// 首屏 Hero：DotPattern 背景（径向蒙版淡出）+ AuroraText 关键词 + 双 CTA（ShimmerButton 链接 + Button 链接）。
export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <DotPattern className="text-border/60 [mask-image:radial-gradient(60%_55%_at_50%_30%,white,transparent)]" />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-24 text-center sm:py-32">
        <Tag variant="soft" tone="brand" size="md" icon={<Zap className="size-3.5" />}>

          {copy("version3ElasticComputeScalesToZeroWhenIdle")}
        </Tag>

        <Heading
          level={1}
          weight="bold"
          balance
          className="text-4xl leading-tight text-foreground sm:text-5xl md:text-6xl"
        >

          {copy("sendTheApplication")} <AuroraText>{copy("globalEdge")}</AuroraText>
          <br className="hidden sm:block" />  {copy("justOneGitPush")}
        </Heading>

        <Text tone="muted" size="lg" className="max-w-2xl">
          {brand.description}
        </Text>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <ShimmerButton render={<Link href={demoHref("/demos/website/contact")} />}>

            {copy("startForFree")}
            <ArrowRight className="ml-2 size-4" aria-hidden />
          </ShimmerButton>
          <Button variant="outline" size="lg" render={<Link href={demoHref("/demos/website/pricing")} />}>

            {copy("viewPricing")}
          </Button>
        </div>

        <Text tone="muted" size="sm">

          {copy("noCreditCardRequiredLaunchYourFirstProjectIn5Minutes")}
        </Text>
      </div>
    </section>
  );
}
