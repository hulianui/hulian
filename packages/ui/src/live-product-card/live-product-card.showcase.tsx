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
  examples: [
    {
      title: "基础用法",
      description: "列表行布局（默认 row）：序号链接 + 缩略图 + 标题 + 价格 + 抢购钮。",
      code: `<LiveProductCard
  index={1}
  image={url}
  title="冬季加厚羊羔绒外套 男女同款 直播专享"
  price={129}
  action={<button>去抢购</button>}
/>`,
      render: () => (
        <div className="w-80">
          <LiveProductCard
            index={1}
            image={IMG(20)}
            title="冬季加厚羊羔绒外套 男女同款 直播专享"
            price={129}
            action={Buy}
          />
        </div>
      ),
    },
    {
      title: "划线价 + 角标 + 销量",
      description: "originalPrice 渲染划线原价；tag 角标；sold/stock 渲染已售与剩余。",
      code: `<LiveProductCard
  index={1}
  image={url}
  title="冬季加厚羊羔绒外套"
  price={129}
  originalPrice={399}
  tag="秒杀"
  stock={86}
  sold={1240}
  action={<button>去抢购</button>}
/>`,
      render: () => (
        <div className="w-80">
          <LiveProductCard
            index={1}
            image={IMG(20)}
            title="冬季加厚羊羔绒外套 男女同款 直播专享"
            price={129}
            originalPrice={399}
            tag="秒杀"
            stock={86}
            sold={1240}
            action={Buy}
          />
        </div>
      ),
    },
    {
      title: "讲解中",
      description: "explaining 在缩略图底部渲染脉冲「讲解中」徽标，标记主播正在讲的商品。",
      code: `<LiveProductCard
  index={2}
  image={url}
  title="便携保温杯 316 不锈钢 500ml"
  price={49.9}
  originalPrice={99}
  explaining
  sold={3580}
  action={<button>去抢购</button>}
/>`,
      render: () => (
        <div className="w-80">
          <LiveProductCard
            index={2}
            image={IMG(200)}
            title="便携保温杯 316 不锈钢 500ml"
            price={49.9}
            originalPrice={99}
            explaining
            sold={3580}
            action={Buy}
          />
        </div>
      ),
    },
    {
      title: "网格卡",
      description: "layout=\"card\" 切竖向卡片，缩略图占满整行，适合商品橱窗网格。",
      code: `<div className="grid grid-cols-2 gap-2">
  <LiveProductCard layout="card" index={3} image={url} title="无线蓝牙耳机 降噪版" price={199} originalPrice={499} tag="限量" sold={920} action={<button>去抢购</button>} />
  <LiveProductCard layout="card" index={4} image={url} title="桌面氛围灯 RGB 智能" price={69} originalPrice={159} explaining sold={460} action={<button>去抢购</button>} />
</div>`,
      render: () => (
        <div className="grid w-80 grid-cols-2 gap-2">
          <LiveProductCard layout="card" index={3} image={IMG(140)} title="无线蓝牙耳机 降噪版" price={199} originalPrice={499} tag="限量" sold={920} action={Buy} />
          <LiveProductCard layout="card" index={4} image={IMG(280)} title="桌面氛围灯 RGB 智能" price={69} originalPrice={159} explaining sold={460} action={Buy} />
        </div>
      ),
    },
  ],
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
