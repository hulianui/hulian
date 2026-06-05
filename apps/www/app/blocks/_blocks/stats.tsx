import { NumberTicker, Text } from "@hulianui/ui";

// 核心数据 Block —— 自包含、可整段复制。
// NumberTicker 进视口动画 + 后缀。四列网格，移动端两列。
// 数据内联在本文件，复制后改 STATS 即可。无 CTA。

interface Stat {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
}

const STATS: Stat[] = [
  { label: "累计部署次数", value: 2.4, suffix: "M+", decimals: 1 },
  { label: "企业客户", value: 18000, suffix: "+" },
  { label: "服务可用性", value: 99.99, suffix: "%", decimals: 2 },
  { label: "全球边缘节点", value: 320, suffix: "" },
];

export function StatsBlock() {
  return (
    <section className="border-b border-border px-6 py-16">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-8 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-1 text-center">
            <div className="flex items-baseline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              <NumberTicker value={s.value} decimalPlaces={s.decimals ?? 0} />
              {s.suffix && <span className="text-primary">{s.suffix}</span>}
            </div>
            <Text tone="muted" size="sm">
              {s.label}
            </Text>
          </div>
        ))}
      </div>
    </section>
  );
}
