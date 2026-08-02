"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Carousel } from "../../../../packages/ui/src/carousel/carousel";
const SLIDES = [
    {
        eyebrow: "Limited time 3 days",
        title: "618 Mid-Year Sale",
        desc: "Get 50 off when you spend over 300, and add platform coupons to save another 20.",
        cta: "Buy now",
        bg: "bg-primary text-bg",
    },
    {
        eyebrow: "New product launch",
        title: "Summer thin and light series",
        desc: "Breathable and quick-drying fabric, 3 colors available, 20% off for pre-sale.",
        cta: "View new products",
        bg: "bg-surface-hover text-foreground",
    },
    {
        eyebrow: "Exclusive for members",
        title: "Black Card Member Day",
        desc: "On the 8th of every month, member prices are as low as 50% off and points are doubled.",
        cta: "Open black card",
        bg: "bg-foreground text-bg",
    },
    {
        eyebrow: "Free shipping to your home",
        title: "Fresh food delivered next day",
        desc: "Procured directly from the origin, free nationwide cold chain delivery for orders over 99 yuan.",
        cta: "Shopping for fresh food",
        bg: "bg-primary/15 text-foreground",
    },
    {
        eyebrow: "Trade-in",
        title: "Digital recycling subsidy",
        desc: "The maximum estimated price for an old machine is 1,200 yuan, and an additional 300 yuan will be charged for a new one.",
        cta: "Valuation Recovery",
        bg: "bg-surface text-foreground",
    },
];
function Slide({ eyebrow, title, desc, cta, bg }: (typeof SLIDES)[number]) {
    return (<div className={`flex h-48 flex-col items-start justify-center gap-2 px-10 ${bg}`}>
      <span className="rounded-full bg-current/15 px-2 py-0.5 text-xs font-medium">{eyebrow}</span>
      <p className="text-2xl font-bold">{title}</p>
      <p className="max-w-sm text-sm opacity-80">{desc}</p>
      <span className="mt-1 rounded-[var(--radius)] border border-current/40 px-3 py-1 text-sm font-medium">
        {cta} →
      </span>
    </div>);
}
function Demo(props: {
    autoplay?: boolean;
    loop?: boolean;
    showArrows?: boolean;
    showDots?: boolean;
}) {
    return (<Carousel className="w-96 max-w-full border border-border" aria-label="Home Promotion Banner" {...props}>
      {SLIDES.map((s) => (<Slide key={s.title} {...s}/>))}
    </Carousel>);
}
export const carouselShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Each top-level child is a slide; it has arrows + dots by default, can be dragged and dropped, and supports \u2190\u2192 keyboard.",
            code: `<Carousel className="w-96" aria-label="Homepage Promotion Banner">
  <Slide title="618 Mid-Year Sale" />
  <Slide title="Summer Thin and Light Series" />
  {/* ...more promotional spots */}
</Carousel>`,
            render: () => <Demo />,
        },
        {
            title: "Autoplay + Loop",
            description: "autoplay automatically turns pages every 4s, loop lets the last page go back to the first; automatically pauses when hovering/focusing.",
            code: `<Carousel autoplay loop className="w-96">
  <Slide title="618 Mid-Year Sale" />
  <Slide title="Summer Thin and Light Series" />
</Carousel>`,
            render: () => <Demo autoplay loop/>,
        },
        {
            title: "Dots only",
            description: "showArrows={false} Hide the left and right arrows, leaving only the bottom dot indication.",
            code: `<Carousel showArrows={false} className="w-96">
  <Slide title="618 Mid-Year Sale" />
  <Slide title="Summer Thin and Light Series" />
</Carousel>`,
            render: () => <Demo showArrows={false}/>,
        },
        {
            title: "Arrow only",
            description: "showDots={false} Hide the dots and only keep the left and right switching arrows.",
            code: `<Carousel showDots={false} className="w-96">
  <Slide title="618 Mid-Year Sale" />
  <Slide title="Summer Thin and Light Series" />
</Carousel>`,
            render: () => <Demo showDots={false}/>,
        },
    ],
    controls: [
        { prop: "autoplay", type: "boolean", defaultValue: false, label: "Auto play" },
        { prop: "loop", type: "boolean", defaultValue: false, label: "Loop" },
        { prop: "showArrows", type: "boolean", defaultValue: true, label: "Arrow" },
        { prop: "showDots", type: "boolean", defaultValue: true, label: "Dot" },
    ],
    states: [
        { name: "Marketing Banner (arrow + dot / draggable / \u2190\u2192 keyboard)", render: () => <Demo /> },
        { name: "Automatic play + loop (4s automatically turns, the last one returns to the first one; hover to pause)", render: () => <Demo autoplay loop/> },
        { name: "Dots only (no arrows)", render: () => <Demo showArrows={false}/> },
        { name: "Arrows only (no dots)", render: () => <Demo showDots={false}/> },
    ],
    renderWithProps: (p) => (<Demo autoplay={Boolean(p.autoplay)} loop={Boolean(p.loop)} showArrows={p.showArrows !== false} showDots={p.showDots !== false}/>),
    toCode: (p) => `<Carousel${p.autoplay ? " autoplay" : ""}${p.loop ? " loop" : ""}${p.showArrows === false ? " showArrows={false}" : ""}${p.showDots === false ? " showDots={false}" : ""}>
  <Slide title="618 Mid-Year Sale" />
  <Slide title="Summer Thin and Light Series" />
  {/* ...more promotional spots */}
</Carousel>`,
};
