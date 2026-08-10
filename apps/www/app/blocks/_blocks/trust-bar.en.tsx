import { Marquee, Text } from "@hulianui/ui";
const companies = [
    "Aurora Technology",
    "Yuntu Data",
    "Northwind",
    "FarSail Global",
    "Wenxin Finance",
    "Lumen AI",
    "Galaxy Media",
    "Wanxiang Retail",
];
export function TrustBarBlock() {
    return (<section className="border-b border-border bg-surface/40 py-10">
      <Text tone="muted" size="sm" className="mb-6 text-center">
        18,000+ teams have built and delivered on HanCloud
      </Text>
      <Marquee fade pauseOnHover duration={32} gap="3rem">
        {companies.map((name) => (<span key={name} className="select-none whitespace-nowrap text-lg font-semibold text-muted-foreground transition-colors hover:text-foreground">
            {name}
          </span>))}
      </Marquee>
    </section>);
}
