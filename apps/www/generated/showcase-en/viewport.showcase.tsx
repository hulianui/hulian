"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Viewport } from "../../../../packages/ui/src/viewport/viewport";
function ResponsiveDemo() {
    const cards = ["Visits", "Conversion rate", "Price per customer", "Retention rate", "Active number", "Revenue"];
    return (<div className="flex min-h-[16rem] flex-col gap-4 p-4">
      <header className="flex flex-col gap-2 @md:flex-row @md:items-center @md:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Data dashboard</p>
          <p className="text-xs text-muted">The wider the container, the more the layout expands</p>
        </div>
        <div className="flex gap-2">
          <span className="rounded-[var(--radius)] bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
            New
          </span>
          <span className="rounded-[var(--radius)] border border-border px-3 py-1 text-xs text-foreground">
            Export
          </span>
        </div>
      </header>
      <div className="grid grid-cols-1 gap-3 @md:grid-cols-2 @5xl:grid-cols-3">
        {cards.map((t, i) => (<div key={t} className="rounded-[var(--radius)] border border-border bg-surface-hover/40 p-3">
            <p className="text-xs text-muted">{t}</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{(i + 1) * 123}</p>
          </div>))}
      </div>
    </div>);
}
export const viewportShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Device Switcher",
            description: "controls Open the top web/tablet/mobile phone switching bar, and rearrange the interior according to the container width (@md/@5xl).",
            code: `<Viewport controls defaultDevice="phone">
  {/* Internally used @md/@5xl container variant adapts to the container width */}
  <div className="grid grid-cols-1 @md:grid-cols-2 @5xl:grid-cols-3">\u2026</div>
</Viewport>`,
            render: () => (<Viewport controls defaultDevice="phone">
          <ResponsiveDemo />
        </Viewport>),
        },
        {
            title: "Fixed device presets",
            description: "Directly upload device to lock to a certain preset width, and the mobile phone 390 places a single column vertically.",
            code: `<Viewport device="phone">
  <ResponsiveLayout />
</Viewport>`,
            render: () => (<Viewport device="phone">
          <ResponsiveDemo />
        </Viewport>),
        },
        {
            title: "Custom width",
            description: "width overrides the preset to any pixel; framed={false} uses a thin border instead of the device outline.",
            code: `<Viewport width={600} framed={false}>
  <ResponsiveLayout />
</Viewport>`,
            render: () => (<Viewport width={600} framed={false}>
          <ResponsiveDemo />
        </Viewport>),
        },
    ],
    controls: [],
    states: [
        {
            name: "Device switcher (click web/tablet/mobile phone to see the rearrangement in the container)",
            render: () => (<Viewport controls defaultDevice="phone">
          <ResponsiveDemo />
        </Viewport>),
        },
        {
            name: "Mobile 390 \u2192 Single column portrait",
            render: () => (<Viewport device="phone">
          <ResponsiveDemo />
        </Viewport>),
        },
        {
            name: "Wider container 600 \u2192 automatic two-column landscape",
            render: () => (<Viewport width={600} framed={false}>
          <ResponsiveDemo />
        </Viewport>),
        },
    ],
    renderWithProps: () => (<Viewport controls defaultDevice="phone">
      <ResponsiveDemo />
    </Viewport>),
    toCode: () => `<Viewport controls defaultDevice="phone">
  {/* Internally used container variants such as @md/@5xl are adapted according to the container width */}
  <div className="grid grid-cols-1 @md:grid-cols-2 @5xl:grid-cols-3">\u2026</div>
</Viewport>`,
};
