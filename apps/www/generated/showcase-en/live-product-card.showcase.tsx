"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { LiveProductCard } from "../../../../packages/ui/src/live-product-card/live-product-card";
const IMG = (hue: number) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="hsl(${hue} 60% 70%)"/><rect width="120" height="120" fill="hsl(${hue + 40} 60% 55%)" opacity="0.5"/></svg>`)}`;
const Buy = (<button type="button" className="rounded-full bg-danger px-3 py-1 text-xs font-bold text-danger-foreground">
    Go to buy
  </button>);
export const liveProductCardShowcase: ShowcaseSpec = {
    controls: [],
    examples: [
        {
            title: "Basic usage",
            description: "List row layout (default row): serial number link + thumbnail + title + price + snap-up button.",
            code: `<LiveProductCard
  index={1}
  image={url}
  title="Winter thickened sherpa jacket, same style for men and women, exclusive for live broadcast"
  price={129}
  action={<button>Go to buy</button>}
/>`,
            render: () => (<div className="w-80">
          <LiveProductCard index={1} image={IMG(20)} title="Winter thickened sherpa jacket, same style for men and women, exclusive for live broadcast" price={129} action={Buy}/>
        </div>),
        },
        {
            title: "Crossed price + corner mark + sales volume",
            description: "originalPrice rendering with crossed out original price; tag corner mark; sold/stock rendering sold and remaining.",
            code: `<LiveProductCard
  index={1}
  image={url}
  title="Winter thickened sherpa jacket"
  price={129}
  originalPrice={399}
  tag="Flash Sale"
  stock={86}
  sold={1240}
  action={<button>Go to buy</button>}
/>`,
            render: () => (<div className="w-80">
          <LiveProductCard index={1} image={IMG(20)} title="Winter thickened sherpa jacket, same style for men and women, exclusive for live broadcast" price={129} originalPrice={399} tag="Flash Sale" stock={86} sold={1240} action={Buy}/>
        </div>),
        },
        {
            title: "Explaining",
            description: "explaining Renders a pulse \"Explaining\" logo at the bottom of the thumbnail to mark the product the anchor is talking about.",
            code: `<LiveProductCard
  index={2}
  image={url}
  title="Portable thermos cup 316 stainless steel 500ml"
  price={49.9}
  originalPrice={99}
  explaining
  sold={3580}
  action={<button>Go to buy</button>}
/>`,
            render: () => (<div className="w-80">
          <LiveProductCard index={2} image={IMG(200)} title="Portable thermos cup 316 stainless steel 500ml" price={49.9} originalPrice={99} explaining sold={3580} action={Buy}/>
        </div>),
        },
        {
            title: "Grid Card",
            description: "layout=\"card\" Cut the card vertically, and the thumbnails occupy the entire row, suitable for the product display window grid.",
            code: `<div className="grid grid-cols-2 gap-2">
  <LiveProductCard layout="card" index={3} image={url} title="Wireless Bluetooth Headset Noise Canceling Version" price={199} originalPrice={499} tag="Limited Edition" sold={920} action={<button>Go and buy</button>} />
  <LiveProductCard layout="card" index={4} image={url} title="Desktop atmosphere light RGB Smart" price={69} originalPrice={159} explaining sold={460} action={<button>Go and buy</button>} />
</div>`,
            render: () => (<div className="grid w-80 grid-cols-2 gap-2">
          <LiveProductCard layout="card" index={3} image={IMG(140)} title="Wireless Bluetooth Headset Noise Canceling Version" price={199} originalPrice={499} tag="Limited edition" sold={920} action={Buy}/>
          <LiveProductCard layout="card" index={4} image={IMG(280)} title="Desktop ambient light RGB smart" price={69} originalPrice={159} explaining sold={460} action={Buy}/>
        </div>),
        },
    ],
    states: [
        {
            name: "List line (under explanation \u00B7 Serial number link \u00B7 Crossed price \u00B7 Rush sale)",
            render: () => (<div className="w-80 space-y-2">
          <LiveProductCard index={1} image={IMG(20)} title="Winter thickened sherpa jacket, same style for men and women, exclusive for live broadcast" price={129} originalPrice={399} explaining tag="Flash Sale" stock={86} sold={1240} action={Buy}/>
          <LiveProductCard index={2} image={IMG(200)} title="Portable thermos cup 316 stainless steel 500ml" price={49.9} originalPrice={99} sold={3580} action={Buy}/>
        </div>),
        },
        {
            name: "Grid Card",
            render: () => (<div className="grid w-80 grid-cols-2 gap-2">
          <LiveProductCard layout="card" index={3} image={IMG(140)} title="Wireless Bluetooth Headset Noise Canceling Version" price={199} originalPrice={499} tag="Limited edition" sold={920} action={Buy}/>
          <LiveProductCard layout="card" index={4} image={IMG(280)} title="Desktop ambient light RGB smart" price={69} originalPrice={159} explaining sold={460} action={Buy}/>
        </div>),
        },
    ],
    renderWithProps: () => (<div className="w-80">
      <LiveProductCard index={1} image={IMG(20)} title="Exclusive goodies for live streaming" price={129} originalPrice={399} explaining tag="Flash Sale" stock={86} sold={1240} action={Buy}/>
    </div>),
    toCode: () => `<LiveProductCard
  index={1}
  image={url}
  title="Product Title"
  price={129}
  originalPrice={399}
  explaining
  tag="Flash Sale"
  action={<Button>Go and buy</Button>}
/>`,
};
