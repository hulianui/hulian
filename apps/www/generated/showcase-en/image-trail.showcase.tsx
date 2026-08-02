"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ImageTrail } from "../../../../packages/ui/src/image-trail/image-trail";
const swatch = (hue: number) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='240' height='218'><rect width='240' height='218' fill='hsl(${hue} 65% 55%)'/><circle cx='120' cy='109' r='60' fill='hsl(${(hue + 40) % 360} 70% 70%)' opacity='0.7'/></svg>`)}`;
const IMAGES = [10, 40, 80, 140, 190, 230, 280, 320].map(swatch);
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-72 w-full max-w-2xl overflow-hidden rounded-xl" style={{ background: "oklch(0.16 0.02 255)" }}>
      {children}
    </div>);
}
const Hint = () => (<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
    <span className="text-sm font-medium text-white/55">Move cursor →</span>
  </div>);
export const imageTrailShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Pass in the images list, drag the cursor inside the container, and the pictures will be thrown out along the trajectory and then fade out.",
            code: `<div className="relative h-72 overflow-hidden rounded-xl">
  <ImageTrail images={images} />
</div>`,
            render: () => (<Stage>
          <ImageTrail images={IMAGES} className="border-0 bg-transparent">
            <Hint />
          </ImageTrail>
        </Stage>),
        },
        {
            title: "Dense tailing",
            description: "Adjust the size of threshold to make the image output more frequent, and use the size of imageWidth to produce dense tailing.",
            code: `<ImageTrail
  images={images}
  threshold={40}
  imageWidth={120}
/>`,
            render: () => (<Stage>
          <ImageTrail images={IMAGES} threshold={40} imageWidth={120} className="border-0 bg-transparent">
            <Hint />
          </ImageTrail>
        </Stage>),
        },
        {
            title: "Large sparse image \u00B7 Slow fade out",
            description: "Increase the size of threshold and imageWidth to create a larger picture, and lengthen fadeDuration to stay longer.",
            code: `<ImageTrail
  images={images}
  threshold={140}
  imageWidth={240}
  fadeDuration={1.2}
/>`,
            render: () => (<Stage>
          <ImageTrail images={IMAGES} threshold={140} imageWidth={240} fadeDuration={1.2} className="border-0 bg-transparent">
            <Hint />
          </ImageTrail>
        </Stage>),
        },
    ],
    controls: [
        { prop: "threshold", type: "number", defaultValue: 80, label: "Trigger threshold px" },
        { prop: "imageWidth", type: "number", defaultValue: 190, label: "Image width px" },
        { prop: "followStrength", type: "number", defaultValue: 0.5, label: "Following hand strength 0-1" },
        { prop: "fadeDuration", type: "number", defaultValue: 0.8, label: "Fade out duration s" },
    ],
    states: [
        {
            name: "default (dark stage\u00B7default parameters)",
            render: () => (<Stage>
          <ImageTrail images={IMAGES} className="border-0 bg-transparent">
            <Hint />
          </ImageTrail>
        </Stage>),
        },
        {
            name: "Dense tailing (small threshold + small image)",
            render: () => (<Stage>
          <ImageTrail images={IMAGES} threshold={40} imageWidth={120} className="border-0 bg-transparent">
            <Hint />
          </ImageTrail>
        </Stage>),
        },
        {
            name: "Sparse large image (large threshold + slow fade out)",
            render: () => (<Stage>
          <ImageTrail images={IMAGES} threshold={140} imageWidth={240} fadeDuration={1.2} className="border-0 bg-transparent">
            <Hint />
          </ImageTrail>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <ImageTrail images={IMAGES} threshold={p.threshold as number} imageWidth={p.imageWidth as number} followStrength={p.followStrength as number} fadeDuration={p.fadeDuration as number} className="border-0 bg-transparent">
        <Hint />
      </ImageTrail>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-72 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.16 0.02 255)" }}>`,
        `  <ImageTrail`,
        `    images={images}`,
        `    threshold={${p.threshold}}`,
        `    imageWidth={${p.imageWidth}}`,
        `    followStrength={${p.followStrength}}`,
        `    fadeDuration={${p.fadeDuration}}`,
        `    className="border-0 bg-transparent"`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
