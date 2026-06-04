import Link from "next/link";
import {
  AuroraText,
  Button,
  ShimmerButton,
  Tag,
  Heading,
  Text,
  DotPattern,
} from "@hulian/ui";
import { ArrowRight, Zap } from "lucide-react";
import { brand } from "../../_data/site";

// 首屏 Hero：DotPattern 背景（径向蒙版淡出）+ AuroraText 关键词 + 双 CTA（ShimmerButton 链接 + Button 链接）。
export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <DotPattern className="text-border/60 [mask-image:radial-gradient(60%_55%_at_50%_30%,white,transparent)]" />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-24 text-center sm:py-32">
        <Tag variant="soft" tone="brand" size="md" icon={<Zap className="size-3.5" />}>
          新版本 v3 · 弹性算力闲时归零
        </Tag>

        <Heading
          level={1}
          weight="bold"
          balance
          className="text-4xl leading-tight text-foreground sm:text-5xl md:text-6xl"
        >
          把应用送上 <AuroraText>全球边缘</AuroraText>
          <br className="hidden sm:block" /> 只需一次 git push
        </Heading>

        <Text tone="muted" size="lg" className="max-w-2xl">
          {brand.description}
        </Text>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <ShimmerButton render={<Link href="/demos/website/contact" />}>
            免费开始
            <ArrowRight className="ml-2 size-4" aria-hidden />
          </ShimmerButton>
          <Button variant="outline" size="lg" render={<Link href="/demos/website/pricing" />}>
            查看定价
          </Button>
        </div>

        <Text tone="muted" size="sm">
          无需信用卡 · 5 分钟上线第一个项目
        </Text>
      </div>
    </section>
  );
}
