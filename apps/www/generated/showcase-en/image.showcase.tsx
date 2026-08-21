"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Image } from "../../../../packages/ui/src/image/image";
import { demoAsset } from "../../../../packages/ui/src/lib/demo-asset";
type Radius = "none" | "sm" | "md" | "lg" | "full";
const DEMO = demoAsset("/demo/photo-image.jpg");
export const imageShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Input src/alt and width/height fixed shell size, fade in after loading is completed.",
            code: `<Image src="/photo.jpg" alt="Landscape" width={200} height={130} />`,
            render: () => <Image src={DEMO} alt="Landscape" width={200} height={130}/>,
        },
        {
            title: "Rounded corners",
            description: "radius provides none / sm / md / lg / full five-level scale.",
            code: `<>
  <Image src="/photo.jpg" alt="Landscape" width={120} height={90} radius="sm" />
  <Image src="/photo.jpg" alt="Landscape" width={120} height={90} radius="lg" />
  <Image src="/avatar.jpg" alt="Avatar" width={90} height={90} radius="full" />
</>`,
            render: () => (<div className="flex items-end gap-3">
          <Image src={DEMO} alt="Landscape" width={120} height={90} radius="sm"/>
          <Image src={DEMO} alt="Landscape" width={120} height={90} radius="lg"/>
          <Image src={DEMO} alt="Avatar" width={90} height={90} radius="full"/>
        </div>),
        },
        {
            title: "hover Zoom (isZoomed)",
            description: "isZoomed, the casing is cropped and overflows. Move the mouse over the picture to enlarge it.",
            code: `<Image src="/photo.jpg" alt="Landscape" width={200} height={130} isZoomed />`,
            render: () => <Image src={DEMO} alt="Landscape" width={200} height={130} isZoomed/>,
        },
        {
            title: "Loading failure and rollback",
            description: "When the original image fails to load, it switches to fallbackSrc; if the rollback also fails, the placeholder bottom is displayed.",
            code: `<Image
  src="https://invalid.example/none.png"
  fallbackSrc="/photo.jpg"
  alt="Fallback"
  width={200}
  height={130}
/>`,
            render: () => (<Image src="https://invalid.example/none.png" fallbackSrc={DEMO} alt="Fallback" width={200} height={130}/>),
        },
    ],
    controls: [
        { prop: "radius", type: "select", options: ["none", "sm", "md", "lg", "full"], defaultValue: "md" },
        { prop: "isZoomed", type: "boolean", defaultValue: false },
    ],
    states: [
        { name: "default", render: () => <Image src={DEMO} alt="Landscape" width={200} height={130}/> },
        { name: "zoomed", render: () => <Image src={DEMO} alt="Landscape" width={200} height={130} isZoomed/> },
        { name: "rounded-full", render: () => <Image src={DEMO} alt="Avatar" width={96} height={96} radius="full"/> },
        {
            name: "fallback",
            render: () => (<Image src="https://invalid.example/none.png" fallbackSrc={DEMO} alt="Fallback" width={200} height={130}/>),
        },
    ],
    renderWithProps: (p) => (<Image src={DEMO} alt="Landscape" width={220} height={140} radius={(p.radius as Radius) ?? "md"} isZoomed={Boolean(p.isZoomed)}/>),
    toCode: (p) => `<Image
  src="/photo.jpg"
  alt="Landscape"
  width={220}
  height={140}${p.radius && p.radius !== "md" ? `
  radius="${p.radius}"` : ""}${p.isZoomed ? "\n  isZoomed" : ""}
/>`,
};
