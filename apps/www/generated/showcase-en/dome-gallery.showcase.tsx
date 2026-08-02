"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { DomeGallery } from "../../../../packages/ui/src/dome-gallery/dome-gallery";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-80 w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-bg">
      {children}
    </div>);
}
export const domeGalleryShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "When not transmitting images, the built-in placeholder gradient tiles can be used to rotate the spherical surface by dragging it and click to open it for a larger view.",
            code: `<div className="relative h-80 overflow-hidden rounded-xl bg-bg">
  <DomeGallery />
</div>`,
            render: () => (<Stage>
          <DomeGallery />
        </Stage>),
        },
        {
            title: "Automatic rotation",
            description: "autoRotate allows the sphere to rotate slowly without dragging, suitable for wallpaper/display scenes.",
            code: `<DomeGallery autoRotate />`,
            render: () => (<Stage>
          <DomeGallery autoRotate/>
        </Stage>),
        },
        {
            title: "Colored tiles",
            description: "grayscale={false} Turn off the grayscale filter, and the tiles directly display the original color.",
            code: `<DomeGallery grayscale={false} segments={20} />`,
            render: () => (<Stage>
          <DomeGallery grayscale={false} segments={20}/>
        </Stage>),
        },
        {
            title: "High Density Spherical Surface",
            description: "segments increases the number of meridional segments, making the tiles denser and the cells smaller; fit adjusts the spherical curvature.",
            code: `<DomeGallery segments={32} fit={0.55} />`,
            render: () => (<Stage>
          <DomeGallery segments={32} fit={0.55}/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "segments", type: "number", defaultValue: 24, label: "Number of meridional segments" },
        { prop: "fit", type: "number", defaultValue: 0.5, label: "Radius scale" },
        { prop: "grayscale", type: "boolean", defaultValue: true, label: "Grayscale tiles" },
        { prop: "autoRotate", type: "boolean", defaultValue: false, label: "Automatic rotation" },
    ],
    states: [
        {
            name: "default (placeholder gradient tile\u00B7can be dragged)",
            render: () => (<Stage>
          <DomeGallery />
        </Stage>),
        },
        {
            name: "Automatic rotation (wallpaper level)",
            render: () => (<Stage>
          <DomeGallery autoRotate/>
        </Stage>),
        },
        {
            name: "Color tiles (grayscale off)",
            render: () => (<Stage>
          <DomeGallery grayscale={false} segments={20}/>
        </Stage>),
        },
        {
            name: "High density spherical surface (segments=32)",
            render: () => (<Stage>
          <DomeGallery segments={32} fit={0.55}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <DomeGallery segments={p.segments as number} fit={p.fit as number} grayscale={p.grayscale as boolean} autoRotate={p.autoRotate as boolean}/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-80 overflow-hidden rounded-xl bg-bg">`,
        `  <DomeGallery`,
        `    segments={${p.segments}}`,
        `    fit={${p.fit}}`,
        `    grayscale={${p.grayscale}}`,
        `    autoRotate={${p.autoRotate}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
