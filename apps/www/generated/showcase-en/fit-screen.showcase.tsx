"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { FitScreen } from "../../../../packages/ui/src/fit-screen/fit-screen";
function DesignBoard({ label }: {
    label: string;
}) {
    return (<div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[var(--color-surface-hover)] text-center">
      <div className="text-[120px] font-bold leading-none text-[var(--color-primary)]">1920×1080</div>
      <div className="text-[40px] text-muted-foreground">{label}</div>
    </div>);
}
function Viewport({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="h-56 w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-[var(--color-surface)]">
      {children}
    </div>);
}
export const fitScreenShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Scale the large-screen content with a fixed design size (default 1920\u00D71080) into any parent container and center it proportionally.",
            code: `<div className="h-56 w-full overflow-hidden rounded-lg border">
  <FitScreen designWidth={1920} designHeight={1080}>
    {/* Your 1920\u00D71080 large screen content */}
  </FitScreen>
</div>`,
            render: () => (<Viewport>
          <FitScreen designWidth={1920} designHeight={1080}>
            <DesignBoard label="Basic usage"/>
          </FitScreen>
        </Viewport>),
        },
        {
            title: "fit \u00B7 No cutting to the same ratio",
            description: "Default mode: Use min zoom, the content is completely visible, and edges may be left around.",
            code: `<FitScreen mode="fit">
  {/* Large screen content */}
</FitScreen>`,
            render: () => (<Viewport>
          <FitScreen mode="fit">
            <DesignBoard label="mode = fit"/>
          </FitScreen>
        </Viewport>),
        },
        {
            title: "cover \u00B7 Fully covered and can be cut",
            description: "Take max and scale it to fill the container in equal proportions, and the excess part will be cut off.",
            code: `<FitScreen mode="cover">
  {/* Large screen content */}
</FitScreen>`,
            render: () => (<Viewport>
          <FitScreen mode="cover">
            <DesignBoard label="mode = cover"/>
          </FitScreen>
        </Viewport>),
        },
        {
            title: "stretch \u00B7 Non-equal ratio",
            description: "Independent horizontal and vertical scaling fills the container, and the content may be deformed.",
            code: `<FitScreen mode="stretch">
  {/* Large screen content */}
</FitScreen>`,
            render: () => (<Viewport>
          <FitScreen mode="stretch">
            <DesignBoard label="mode = stretch"/>
          </FitScreen>
        </Viewport>),
        },
    ],
    controls: [{ prop: "mode", type: "select", options: ["fit", "cover", "stretch"], defaultValue: "fit" }],
    states: [
        {
            name: "fit (No cutting to the same ratio)",
            render: () => (<Viewport>
          <FitScreen mode="fit">
            <DesignBoard label="mode = fit"/>
          </FitScreen>
        </Viewport>),
        },
        {
            name: "cover (full and can be cut)",
            render: () => (<Viewport>
          <FitScreen mode="cover">
            <DesignBoard label="mode = cover"/>
          </FitScreen>
        </Viewport>),
        },
        {
            name: "stretch (non-equal ratio)",
            render: () => (<Viewport>
          <FitScreen mode="stretch">
            <DesignBoard label="mode = stretch"/>
          </FitScreen>
        </Viewport>),
        },
    ],
    renderWithProps: (p) => (<Viewport>
      <FitScreen mode={(p.mode as "fit" | "cover" | "stretch") ?? "fit"}>
        <DesignBoard label={`mode = ${p.mode ?? "fit"}`}/>
      </FitScreen>
    </Viewport>),
    toCode: (p) => `<FitScreen designWidth={1920} designHeight={1080} mode="${p.mode ?? "fit"}">
  {/* Your 1920\u00D71080 large screen content */}
</FitScreen>`,
};
