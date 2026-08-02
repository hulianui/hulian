"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { GlassSurface } from "../../../../packages/ui/src/glass-surface/glass-surface";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative flex h-64 w-full max-w-xl items-center justify-center overflow-hidden rounded-xl border border-border" style={{
            backgroundImage: "radial-gradient(circle at 22% 28%, var(--color-chart-1), transparent 45%), radial-gradient(circle at 78% 30%, var(--color-chart-3), transparent 48%), radial-gradient(circle at 50% 82%, var(--color-chart-4), transparent 50%), linear-gradient(135deg, var(--color-chart-2), var(--color-chart-5))",
        }}>

      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-30" style={{
            backgroundImage: "repeating-linear-gradient(90deg, transparent 0 18px, var(--color-foreground) 18px 19px)",
        }}/>
      {children}
    </div>);
}
export const glassSurfaceShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "A liquid glass pill that refracts + disperses the content behind it. It needs to be placed on a rich colorful background to see the effect clearly.",
            code: `<GlassSurface width={220} height={90} borderRadius={24}>
  <span className="text-sm font-semibold text-foreground">
    Glass Surface
  </span>
</GlassSurface>`,
            render: () => (<Stage>
          <GlassSurface width={220} height={90} borderRadius={24}>
            <span className="text-sm font-semibold text-foreground">
              Glass Surface
            </span>
          </GlassSurface>
        </Stage>),
        },
        {
            title: "Strong dispersion",
            description: "By enlarging distortionScale and each channel offset, a more obvious RGB split light edge appears on the edge of the glass.",
            code: `<GlassSurface
  width={240}
  height={100}
  borderRadius={28}
  distortionScale={-220}
  greenOffset={25}
  blueOffset={45}
>
  <span className="text-sm font-semibold text-foreground">Hulian</span>
</GlassSurface>`,
            render: () => (<Stage>
          <GlassSurface width={240} height={100} borderRadius={28} distortionScale={-220} greenOffset={25} blueOffset={45}>
            <span className="text-sm font-semibold text-foreground">Hulian</span>
          </GlassSurface>
        </Stage>),
        },
        {
            title: "Matte bottom",
            description: "backgroundOpacity increases the opacity of the glass background color, and works with saturation to create a more solid frosted texture.",
            code: `<GlassSurface
  width={220}
  height={90}
  borderRadius={20}
  backgroundOpacity={0.5}
  saturation={1.4}
>
  <span className="text-sm text-foreground">Frosted</span>
</GlassSurface>`,
            render: () => (<Stage>
          <GlassSurface width={220} height={90} borderRadius={20} backgroundOpacity={0.5} saturation={1.4}>
            <span className="text-sm text-foreground">Frosted</span>
          </GlassSurface>
        </Stage>),
        },
        {
            title: "Round badge",
            description: "Equal width and height + borderRadius Take the radius to get a circular glass badge.",
            code: `<GlassSurface width={96} height={96} borderRadius={48}>
  <span className="text-xl font-bold text-foreground">hu</span>
</GlassSurface>`,
            render: () => (<Stage>
          <GlassSurface width={96} height={96} borderRadius={48}>
            <span className="text-xl font-bold text-foreground">Hu</span>
          </GlassSurface>
        </Stage>),
        },
    ],
    controls: [
        { prop: "width", type: "number", defaultValue: 220, label: "Width px" },
        { prop: "height", type: "number", defaultValue: 90, label: "Height px" },
        { prop: "borderRadius", type: "number", defaultValue: 24, label: "Rounded corners px" },
        {
            prop: "distortionScale",
            type: "number",
            defaultValue: -180,
            label: "Refraction intensity",
        },
        { prop: "blueOffset", type: "number", defaultValue: 20, label: "Blue channel dispersion" },
        {
            prop: "backgroundOpacity",
            type: "number",
            defaultValue: 0,
            label: "Frosted base transparency",
        },
    ],
    states: [
        {
            name: "default (liquid glass pills)",
            render: () => (<Stage>
          <GlassSurface width={220} height={90} borderRadius={24}>
            <span className="text-sm font-semibold text-foreground">
              Glass Surface
            </span>
          </GlassSurface>
        </Stage>),
        },
        {
            name: "Strong dispersion (offset enlarged)",
            render: () => (<Stage>
          <GlassSurface width={240} height={100} borderRadius={28} distortionScale={-220} greenOffset={25} blueOffset={45}>
            <span className="text-sm font-semibold text-foreground">Hulian</span>
          </GlassSurface>
        </Stage>),
        },
        {
            name: "Matte bottom (backgroundOpacity 0.5)",
            render: () => (<Stage>
          <GlassSurface width={220} height={90} borderRadius={20} backgroundOpacity={0.5} saturation={1.4}>
            <span className="text-sm text-foreground">Frosted</span>
          </GlassSurface>
        </Stage>),
        },
        {
            name: "Round badge",
            render: () => (<Stage>
          <GlassSurface width={96} height={96} borderRadius={48}>
            <span className="text-xl font-bold text-foreground">Hu</span>
          </GlassSurface>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <GlassSurface width={p.width as number} height={p.height as number} borderRadius={p.borderRadius as number} distortionScale={p.distortionScale as number} blueOffset={p.blueOffset as number} backgroundOpacity={p.backgroundOpacity as number}>
        <span className="text-sm font-medium text-foreground">Glass</span>
      </GlassSurface>
    </Stage>),
    toCode: (p) => [
        `<GlassSurface`,
        `  width={${p.width}}`,
        `  height={${p.height}}`,
        `  borderRadius={${p.borderRadius}}`,
        `  distortionScale={${p.distortionScale}}`,
        `  blueOffset={${p.blueOffset}}`,
        `  backgroundOpacity={${p.backgroundOpacity}}`,
        `>`,
        `  Glass`,
        `</GlassSurface>`,
    ].join("\n"),
};
