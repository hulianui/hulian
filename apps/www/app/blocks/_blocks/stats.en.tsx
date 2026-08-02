import { NumberTicker, Text } from "@hulianui/ui";
interface Stat {
    label: string;
    value: number;
    suffix?: string;
    decimals?: number;
}
const STATS: Stat[] = [
    { label: "Total deployments", value: 2.4, suffix: "M+", decimals: 1 },
    { label: "Enterprise customers", value: 18000, suffix: "+" },
    { label: "Service availability", value: 99.99, suffix: "%", decimals: 2 },
    { label: "Global edge nodes", value: 320, suffix: "" },
];
export function StatsBlock() {
    return (<section className="border-b border-border px-6 py-16">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-8 lg:grid-cols-4">
        {STATS.map((s) => (<div key={s.label} className="flex flex-col items-center gap-1 text-center">
            <div className="flex items-baseline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              <NumberTicker value={s.value} decimalPlaces={s.decimals ?? 0}/>
              {s.suffix && <span className="text-primary">{s.suffix}</span>}
            </div>
            <Text tone="muted" size="sm">
              {s.label}
            </Text>
          </div>))}
      </div>
    </section>);
}
