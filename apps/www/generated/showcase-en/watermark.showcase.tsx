"use client";
import type { ReactNode } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Watermark } from "../../../../packages/ui/src/watermark/watermark";
function Sheet({ children }: {
    children?: ReactNode;
}) {
    return (<div className="h-56 w-full overflow-hidden rounded-[var(--radius)] border border-border bg-surface p-6">
      <h4 className="text-base font-semibold text-foreground">2026 Q2 Financial Presentation (Restricted)</h4>
      <p className="mt-2 max-w-md text-sm text-muted">
        This page contains business secrets and screenshots are prohibited. The watermark covers the entire area and adapts to the theme. If you delete the watermark layer, it will be automatically restored.
      </p>
      <button type="button" className="mt-4 rounded-[var(--radius)] border border-border px-3 py-1.5 text-sm text-foreground hover:bg-surface-hover">
        Clickable button
      </button>
      {children}
    </div>);
}
const logo = "data:image/svg+xml;utf8," +
    encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="84" height="24"><rect x="1" y="5" width="14" height="14" rx="4" fill="none" stroke="%23888" stroke-width="2"/><text x="22" y="18" font-family="sans-serif" font-size="16" fill="%23888">HULIAN</text></svg>`);
export const watermarkShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The package content area is a tiled single-line watermark, and pointer-events:none does not block interaction.",
            code: `<Watermark content="Hulian \u00B7 Confidential">
  <YourContent />
</Watermark>`,
            render: () => (<Watermark content="Hulian · Confidential" className="w-full max-w-xl">
          <Sheet />
        </Watermark>),
        },
        {
            title: "Multi-line text",
            description: "content passes the array and renders it as a multi-line watermark.",
            code: `<Watermark content={["Hulian Confidential", "zhangzhiwei"]}>
  <YourContent />
</Watermark>`,
            render: () => (<Watermark content={["Hulian Confidential", "zhangzhiwei"]} className="w-full max-w-xl">
          <Sheet />
        </Watermark>),
        },
        {
            title: "Intensive + Custom Color",
            description: "gap Tighten the spacing, color / rotate / opacity customize the look and feel.",
            code: `<Watermark
  content="DO NOT SHARE"
  gap={48}
  rotate={-30}
  color="var(--color-danger)"
  opacity={0.18}
>
  <YourContent />
</Watermark>`,
            render: () => (<Watermark content="DO NOT SHARE" gap={48} rotate={-30} color="var(--color-danger)" opacity={0.18} className="w-full max-w-xl">
          <Sheet />
        </Watermark>),
        },
        {
            title: "Picture watermark",
            description: "Pass image (dataURL / link) to tile the image, and width controls the width.",
            code: `<Watermark image={logoDataUrl} width={84}>
  <YourContent />
</Watermark>`,
            render: () => (<Watermark image={logo} width={84} className="w-full max-w-xl">
          <Sheet />
        </Watermark>),
        },
    ],
    controls: [
        { prop: "content", type: "text", defaultValue: "Hulian \u00B7 Confidential", label: "Watermark text" },
        { prop: "rotate", type: "number", defaultValue: -22, label: "Rotation angle" },
        { prop: "fontSize", type: "number", defaultValue: 16, label: "Font size" },
        { prop: "opacity", type: "number", defaultValue: 0.15, label: "Opacity" },
    ],
    states: [
        {
            name: "Single line text",
            render: () => (<Watermark content="Hulian · Confidential" className="w-full max-w-xl">
          <Sheet />
        </Watermark>),
        },
        {
            name: "Multi-line text",
            render: () => (<Watermark content={["Hulian Confidential", "zhangzhiwei"]} className="w-full max-w-xl">
          <Sheet />
        </Watermark>),
        },
        {
            name: "Intensive + Custom Color",
            render: () => (<Watermark content="DO NOT SHARE" gap={48} rotate={-30} color="var(--color-danger)" opacity={0.18} className="w-full max-w-xl">
          <Sheet />
        </Watermark>),
        },
        {
            name: "Picture watermark",
            render: () => (<Watermark image={logo} width={84} className="w-full max-w-xl">
          <Sheet />
        </Watermark>),
        },
    ],
    renderWithProps: (p) => (<Watermark content={String(p.content)} rotate={Number(p.rotate)} fontSize={Number(p.fontSize)} opacity={Number(p.opacity)} className="w-full max-w-xl">
      <Sheet />
    </Watermark>),
    toCode: (p) => `<Watermark content="${p.content}" rotate={${p.rotate}} fontSize={${p.fontSize}} opacity={${p.opacity}}>
  <YourContent />
</Watermark>`,
};
