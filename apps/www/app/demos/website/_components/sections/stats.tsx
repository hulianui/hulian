import { NumberTicker, Text } from "@hulian/ui";
import { stats } from "../../_data/site";

// 核心数据：NumberTicker 进视口动画 + 后缀。四列网格，移动端两列。
export function Stats() {
  return (
    <section className="border-b border-border px-6 py-16">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-8 lg:grid-cols-4">
        {stats.map((s) => (
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
