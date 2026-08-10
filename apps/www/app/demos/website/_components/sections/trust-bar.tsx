import { copy } from "./trust-bar.content";
import { Marquee, Text } from "@hulianui/ui";

const companies = [
  copy("auroraTechnology"),
  copy("yuntuData"),
  "Northwind",
  copy("farsailGlobal"),
  copy("wenxinFinance"),
  "Lumen AI",
  copy("galaxyMedia"),
  copy("wanxiangRetail"),
];

// 信任墙：客户名横向无缝滚动（hover 暂停）。纯文字 logo 占位，灰度低调。
export function TrustBar() {
  return (
    <section className="border-b border-border bg-surface/40 py-10">
      <Text tone="muted" size="sm" className="mb-6 text-center">

        {copy("text18000TeamsHaveBuiltAndDeliveredOnHancloud")}
      </Text>
      <Marquee fade pauseOnHover duration={32} gap="3rem">
        {companies.map((name) => (
          <span
            key={name}
            className="select-none whitespace-nowrap text-lg font-semibold text-muted-foreground/70 transition-colors hover:text-foreground"
          >
            {name}
          </span>
        ))}
      </Marquee>
    </section>
  );
}
