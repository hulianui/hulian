"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Image } from "./image";

type Radius = "none" | "sm" | "md" | "lg" | "full";
const DEMO = "https://images.unsplash.com/photo-1503424886307-b090341d25d1?w=400&q=70";

export const imageShowcase: ShowcaseSpec = {
  controls: [
    { prop: "radius", type: "select", options: ["none", "sm", "md", "lg", "full"], defaultValue: "md" },
    { prop: "isZoomed", type: "boolean", defaultValue: false },
  ],
  states: [
    { name: "default", render: () => <Image src={DEMO} alt="风景" width={200} height={130} /> },
    { name: "zoomed", render: () => <Image src={DEMO} alt="风景" width={200} height={130} isZoomed /> },
    { name: "rounded-full", render: () => <Image src={DEMO} alt="头像" width={96} height={96} radius="full" /> },
    {
      name: "fallback",
      render: () => (
        <Image src="https://invalid.example/none.png" fallbackSrc={DEMO} alt="回退" width={200} height={130} />
      ),
    },
  ],
  renderWithProps: (p) => (
    <Image
      src={DEMO}
      alt="风景"
      width={220}
      height={140}
      radius={(p.radius as Radius) ?? "md"}
      isZoomed={Boolean(p.isZoomed)}
    />
  ),
  toCode: (p) =>
    `<Image\n  src="/photo.jpg"\n  alt="风景"\n  width={220}\n  height={140}${
      p.radius && p.radius !== "md" ? `\n  radius="${p.radius}"` : ""
    }${p.isZoomed ? "\n  isZoomed" : ""}\n/>`,
};
