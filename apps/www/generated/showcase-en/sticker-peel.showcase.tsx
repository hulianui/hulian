"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { StickerPeel } from "../../../../packages/ui/src/sticker-peel/sticker-peel";
const STAR = "data:image/svg+xml," +
    encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
      <rect x="6" y="6" width="168" height="168" rx="30" fill="#fff" stroke="#e2e2e2" stroke-width="4"/>
      <path d="M90 34l16 34 37 5-27 26 7 37-33-18-33 18 7-37-27-26 37-5z" fill="#f6b73c" stroke="#e09a1f" stroke-width="3"/>
    </svg>`);
const BOLT = "data:image/svg+xml," +
    encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
      <rect x="6" y="6" width="168" height="168" rx="30" fill="#10131a" stroke="#2b2f3a" stroke-width="4"/>
      <path d="M100 28L58 100h28l-10 52 48-78H94z" fill="#7dd3fc"/>
    </svg>`);
function Stage({ children, dark = true, }: {
    children: React.ReactNode;
    dark?: boolean;
}) {
    return (<div className="relative grid h-64 w-full max-w-xl place-items-center overflow-hidden rounded-xl border border-border" style={{ background: dark ? "oklch(0.16 0.02 255)" : "oklch(0.97 0.005 255)" }}>
      {children}
      <p className="pointer-events-none absolute bottom-2 right-3 text-[11px] text-muted">
        hover Lift · Press and hold for larger · Drag to try
      </p>
    </div>);
}
export const stickerPeelShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Place it in the relative container, hover/press and curl the edge to turn it up; imageSrc is required, rotate creates a skewed feeling.",
            code: `<div className="relative grid h-64 place-items-center overflow-hidden rounded-xl">
  <StickerPeel imageSrc="/sticker.png" width={150} rotate={14} />
</div>`,
            render: () => (<Stage>
          <StickerPeel imageSrc={STAR} width={150} rotate={14}/>
        </Stage>),
        },
        {
            title: "Hemming direction",
            description: "peelDirection Let the entire sticker rotate together with the curled edge to change the direction of lifting.",
            code: `<StickerPeel
  imageSrc="/bolt.png"
  width={150}
  rotate={-10}
  peelDirection={20}
/>`,
            render: () => (<Stage dark={false}>
          <StickerPeel imageSrc={BOLT} width={150} rotate={-10} peelDirection={20}/>
        </Stage>),
        },
        {
            title: "Large curling + strong highlights",
            description: "Increase the reveal ratio of hover/active, and enhance the mouse following highlight of lightingIntensity.",
            code: `<StickerPeel
  imageSrc="/sticker.png"
  width={170}
  rotate={8}
  peelBackHoverPct={42}
  peelBackActivePct={55}
  lightingIntensity={0.7}
/>`,
            render: () => (<Stage>
          <StickerPeel imageSrc={STAR} width={170} rotate={8} peelBackHoverPct={42} peelBackActivePct={55} lightingIntensity={0.7}/>
        </Stage>),
        },
        {
            title: "Locked and cannot be dragged",
            description: "draggable={false} Only retains the curling interaction and prohibits dragging.",
            code: `<StickerPeel imageSrc="/bolt.png" width={150} rotate={20} draggable={false} />`,
            render: () => (<Stage>
          <StickerPeel imageSrc={BOLT} width={150} rotate={20} draggable={false}/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "width", type: "number", defaultValue: 160, label: "Width px" },
        { prop: "rotate", type: "number", defaultValue: 16, label: "Pattern rotation deg" },
        { prop: "peelBackHoverPct", type: "number", defaultValue: 30, label: "hover Revealed %" },
        { prop: "peelBackActivePct", type: "number", defaultValue: 42, label: "Press and hold to uncover %" },
        { prop: "lightingIntensity", type: "number", defaultValue: 0.4, label: "Highlight intensity 0~1" },
        { prop: "draggable", type: "boolean", defaultValue: true, label: "Can be dragged" },
    ],
    states: [
        {
            name: "default (dark base\u00B7star sticker)",
            render: () => (<Stage>
          <StickerPeel imageSrc={STAR} width={150} rotate={14}/>
        </Stage>),
        },
        {
            name: "Light color base \u00B7 Lightning sticker",
            render: () => (<Stage dark={false}>
          <StickerPeel imageSrc={BOLT} width={150} rotate={-10} peelDirection={20}/>
        </Stage>),
        },
        {
            name: "Large curling + strong highlights",
            render: () => (<Stage>
          <StickerPeel imageSrc={STAR} width={170} rotate={8} peelBackHoverPct={42} peelBackActivePct={55} lightingIntensity={0.7}/>
        </Stage>),
        },
        {
            name: "Locked and cannot be dragged (only curling interaction)",
            render: () => (<Stage>
          <StickerPeel imageSrc={BOLT} width={150} rotate={20} draggable={false}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <StickerPeel imageSrc={STAR} width={p.width as number} rotate={p.rotate as number} peelBackHoverPct={p.peelBackHoverPct as number} peelBackActivePct={p.peelBackActivePct as number} lightingIntensity={p.lightingIntensity as number} draggable={p.draggable as boolean}/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative grid h-64 place-items-center overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.16 0.02 255)" }}>`,
        `  <StickerPeel`,
        `    imageSrc="/sticker.png"`,
        `    width={${p.width}}`,
        `    rotate={${p.rotate}}`,
        `    peelBackHoverPct={${p.peelBackHoverPct}}`,
        `    peelBackActivePct={${p.peelBackActivePct}}`,
        `    lightingIntensity={${p.lightingIntensity}}`,
        `    draggable={${p.draggable}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
