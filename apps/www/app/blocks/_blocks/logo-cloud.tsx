import {
  Boxes,
  Gem,
  Hexagon,
  Orbit,
  Pyramid,
  Triangle,
  Aperture,
  Anchor,
  Atom,
  Compass,
} from "lucide-react";
import { Heading, Text } from "@hulianui/ui";

// 客户 Logo 静态墙区块 —— 自包含、可整段复制。
// 静态响应式网格（区别于 trust-bar 的 Marquee 横向滚动）：默认灰度，hover 上色。
// 用 lucide 图标 + 文字模拟品牌名，复制后改 brands 即可。无 CTA。

const brands = [
  { name: "极光科技", icon: Boxes },
  { name: "云图数据", icon: Hexagon },
  { name: "Northwind", icon: Triangle },
  { name: "远帆出海", icon: Anchor },
  { name: "稳信金融", icon: Gem },
  { name: "Lumen AI", icon: Atom },
  { name: "星河传媒", icon: Orbit },
  { name: "万象零售", icon: Pyramid },
  { name: "拓界出行", icon: Compass },
  { name: "光合影像", icon: Aperture },
];

export function LogoCloudBlock() {
  return (
    <section className="border-y border-border bg-surface/30 py-16">
      <div className="mx-auto w-full max-w-6xl px-6">
        <Heading
          level={2}
          size="lg"
          weight="medium"
          className="text-center text-muted-foreground"
        >
          受信于行业领先团队
        </Heading>
        <Text tone="muted" size="sm" className="mt-2 text-center">
          18,000+ 团队在瀚云上构建、部署与交付他们的产品
        </Text>

        <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius)] border border-border bg-border sm:grid-cols-3 lg:grid-cols-5">
          {brands.map((brand) => {
            const Icon = brand.icon;
            return (
              <div
                key={brand.name}
                className="group flex items-center justify-center gap-2.5 bg-background px-4 py-8 text-muted-foreground grayscale transition-all duration-200 hover:bg-surface/60 hover:text-foreground hover:grayscale-0"
              >
                <Icon className="size-5 shrink-0" aria-hidden />
                <span className="whitespace-nowrap text-sm font-semibold">
                  {brand.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
