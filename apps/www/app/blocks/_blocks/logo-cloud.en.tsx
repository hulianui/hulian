import { Boxes, Gem, Hexagon, Orbit, Pyramid, Triangle, Aperture, Anchor, Atom, Compass, } from "lucide-react";
import { Heading, Text } from "@hulianui/ui";
const brands = [
    { name: "Aurora Technology", icon: Boxes },
    { name: "Yuntu Data", icon: Hexagon },
    { name: "Northwind", icon: Triangle },
    { name: "FarSail Global", icon: Anchor },
    { name: "Wenxin Finance", icon: Gem },
    { name: "Lumen AI", icon: Atom },
    { name: "Galaxy Media", icon: Orbit },
    { name: "Wanxiang Retail", icon: Pyramid },
    { name: "Frontier Mobility", icon: Compass },
    { name: "Photosynthesis Studio", icon: Aperture },
];
export function LogoCloudBlock() {
    return (<section className="border-y border-border bg-surface/30 py-16">
      <div className="mx-auto w-full max-w-6xl px-6">
        <Heading level={2} size="lg" weight="medium" className="text-center text-muted-foreground">
          Trusted by industry leaders
        </Heading>
        <Text tone="muted" size="sm" className="mt-2 text-center">
          18,000+ teams build, deploy and deliver their products on HanCloud
        </Text>

        <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius)] border border-border bg-border sm:grid-cols-3 lg:grid-cols-5">
          {brands.map((brand) => {
            const Icon = brand.icon;
            return (<div key={brand.name} className="group flex items-center justify-center gap-2.5 bg-bg px-4 py-8 text-muted-foreground grayscale transition-all duration-200 hover:bg-surface/60 hover:text-foreground hover:grayscale-0">
                <Icon className="size-5 shrink-0" aria-hidden/>
                <span className="whitespace-nowrap text-sm font-semibold">
                  {brand.name}
                </span>
              </div>);
        })}
        </div>
      </div>
    </section>);
}
