"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { LiveProductCard } from "./live-product-card";

// 本地内联 SVG 占位图（零外链）。
const IMG = (hue: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="hsl(${hue} 60% 70%)"/><rect width="120" height="120" fill="hsl(${hue + 40} 60% 55%)" opacity="0.5"/></svg>`,
  )}`;

const Buy = (
  <button type="button" className="rounded-full bg-danger px-3 py-1 text-xs font-bold text-danger-foreground">
    去抢购
  </button>
);

export const liveProductCardShowcase: ShowcaseSpec = {
  controls: [],
  states: [
    {
      name: "列表行（讲解中 · 序号链接 · 划线价 · 抢购）",
      render: () => (
        <div className="w-80 space-y-2">
          <LiveProductCard
            index={1}
            image={IMG(20)}
            title="冬季加厚羊羔绒外套 男女同款 直播专享"
            price={129}
            originalPrice={399}
            explaining
            tag="秒杀"
            stock={86}
            sold={1240}
            action={Buy}
          />
          <LiveProductCard
            index={2}
            image={IMG(200)}
            title="便携保温杯 316 不锈钢 500ml"
            price={49.9}
            originalPrice={99}
            sold={3580}
            action={Buy}
          />
        </div>
      ),
    },
    {
      name: "网格卡",
      render: () => (
        <div className="grid w-80 grid-cols-2 gap-2">
          <LiveProductCard layout="card" index={3} image={IMG(140)} title="无线蓝牙耳机 降噪版" price={199} originalPrice={499} tag="限量" sold={920} action={Buy} />
          <LiveProductCard layout="card" index={4} image={IMG(280)} title="桌面氛围灯 RGB 智能" price={69} originalPrice={159} explaining sold={460} action={Buy} />
        </div>
      ),
    },
  ],
  renderWithProps: () => (
    <div className="w-80">
      <LiveProductCard index={1} image={IMG(20)} title="直播专享好物" price={129} originalPrice={399} explaining tag="秒杀" stock={86} sold={1240} action={Buy} />
    </div>
  ),
  toCode: () => `<LiveProductCard
  index={1}
  image={url}
  title="商品标题"
  price={129}
  originalPrice={399}
  explaining
  tag="秒杀"
  action={<Button>去抢购</Button>}
/>`,
};
