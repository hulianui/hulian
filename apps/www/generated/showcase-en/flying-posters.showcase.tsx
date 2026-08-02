"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { FlyingPosters } from "../../../../packages/ui/src/flying-posters/flying-posters";
function poster(label: string, from: string, to: string): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="420" viewBox="0 0 320 420"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="320" height="420" rx="20" fill="url(#g)"/><text x="160" y="220" font-family="system-ui,sans-serif" font-size="120" font-weight="700" fill="rgba(255,255,255,0.92)" text-anchor="middle">${label}</text></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
const POSTERS = [
    poster("01", "#6366f1", "#a855f7"),
    poster("02", "#0ea5e9", "#22d3ee"),
    poster("03", "#f97316", "#f43f5e"),
    poster("04", "#10b981", "#84cc16"),
    poster("05", "#8b5cf6", "#ec4899"),
];
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-80 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.14 0.02 270)" }}>
      {children}
      <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-white/40">
        Scroll wheel / drag and scroll
      </p>
    </div>);
}
export const flyingPostersShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Pass in an array of poster image addresses, connected end to end in an infinite loop; the default is automatic scrolling, and the scroll wheel/drag can be used to scroll manually.",
            code: `<div
  className="relative h-80 overflow-hidden rounded-xl"
  style={{ background: "oklch(0.14 0.02 270)" }}
>
  <FlyingPosters items={posters} className="absolute inset-0" />
</div>`,
            render: () => (<Stage>
          <FlyingPosters items={POSTERS} className="absolute inset-0"/>
        </Stage>),
        },
        {
            title: "Folding and twisting strength",
            description: "distortion Controls the folding range of the poster flying when scrolling. The larger the fold, the more exaggerated it is (recommendations 1\u20136).",
            code: `<FlyingPosters items={posters} distortion={5} className="absolute inset-0" />`,
            render: () => (<Stage>
          <FlyingPosters items={POSTERS} distortion={5} className="absolute inset-0"/>
        </Stage>),
        },
        {
            title: "Wide angle perspective",
            description: "cameraFov Increase the perspective, and the arc of the posters flying in and out becomes more obvious; cameraZ Zoom out to see more posters.",
            code: `<FlyingPosters
  items={posters}
  cameraFov={70}
  cameraZ={26}
  className="absolute inset-0"
/>`,
            render: () => (<Stage>
          <FlyingPosters items={POSTERS} cameraFov={70} cameraZ={26} className="absolute inset-0"/>
        </Stage>),
        },
        {
            title: "Turn off automatic scrolling",
            description: "autoScroll={false} Only manual scrolling (wheel/drag) remains.",
            code: `<FlyingPosters items={posters} autoScroll={false} className="absolute inset-0" />`,
            render: () => (<Stage>
          <FlyingPosters items={POSTERS} autoScroll={false} className="absolute inset-0"/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "distortion", type: "number", defaultValue: 3, label: "Folding and twisting strength" },
        { prop: "scrollEase", type: "number", defaultValue: 0.05, label: "Scroll easing coefficient" },
        { prop: "cameraFov", type: "number", defaultValue: 45, label: "Camera field of view" },
        { prop: "autoScroll", type: "boolean", defaultValue: true, label: "Automatic scrolling" },
    ],
    states: [
        {
            name: "default (auto scroll \u00B7 default parameters)",
            render: () => (<Stage>
          <FlyingPosters items={POSTERS} className="absolute inset-0"/>
        </Stage>),
        },
        {
            name: "Strong folding (distortion 5)",
            render: () => (<Stage>
          <FlyingPosters items={POSTERS} distortion={5} className="absolute inset-0"/>
        </Stage>),
        },
        {
            name: "Wide-angle perspective (fov 70 \u00B7 Long distance)",
            render: () => (<Stage>
          <FlyingPosters items={POSTERS} cameraFov={70} cameraZ={26} className="absolute inset-0"/>
        </Stage>),
        },
        {
            name: "Manual scrolling only (auto off)",
            render: () => (<Stage>
          <FlyingPosters items={POSTERS} autoScroll={false} className="absolute inset-0"/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <FlyingPosters items={POSTERS} distortion={p.distortion as number} scrollEase={p.scrollEase as number} cameraFov={p.cameraFov as number} autoScroll={p.autoScroll as boolean} className="absolute inset-0"/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-80 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.14 0.02 270)" }}>`,
        `  <FlyingPosters`,
        `    items={posters}`,
        `    distortion={${p.distortion}}`,
        `    scrollEase={${p.scrollEase}}`,
        `    cameraFov={${p.cameraFov}}`,
        `    autoScroll={${p.autoScroll}}`,
        `    className="absolute inset-0"`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
