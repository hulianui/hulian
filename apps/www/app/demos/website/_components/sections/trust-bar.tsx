import { Marquee, Text } from "@hulianui/ui";

const companies = [
  "极光科技",
  "云图数据",
  "Northwind",
  "远帆出海",
  "稳信金融",
  "Lumen AI",
  "星河传媒",
  "万象零售",
];

// 信任墙：客户名横向无缝滚动（hover 暂停）。纯文字 logo 占位，灰度低调。
export function TrustBar() {
  return (
    <section className="border-b border-border bg-surface/40 py-10">
      <Text tone="muted" size="sm" className="mb-6 text-center">
        已有 18,000+ 团队在瀚云上构建与交付
      </Text>
      <Marquee fade pauseOnHover duration={32} gap="3rem">
        {companies.map((name) => (
          <span
            key={name}
            className="select-none whitespace-nowrap text-lg font-semibold text-muted/70 transition-colors hover:text-foreground"
          >
            {name}
          </span>
        ))}
      </Marquee>
    </section>
  );
}
