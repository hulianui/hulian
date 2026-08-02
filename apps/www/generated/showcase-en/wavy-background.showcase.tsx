"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { WavyBackground } from "../../../../packages/ui/src/wavy-background/wavy-background";
function WavyWrap({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-48 w-80 overflow-hidden rounded-xl border border-border bg-surface">
      {children}
    </div>);
}
export const wavyBackgroundShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "WavyBackground comes with canvas background + centered content layer, children can put the title directly; the default is chart token.",
            code: `<WavyBackground containerClassName="h-64 w-full">
  <span className="text-sm font-medium text-foreground">WavyBackground</span>
</WavyBackground>`,
            render: () => (<WavyWrap>
          <WavyBackground containerClassName="h-full w-full">
            <span className="text-sm font-medium text-foreground">WavyBackground</span>
          </WavyBackground>
        </WavyWrap>),
        },
        {
            title: "Animation speed",
            description: "speed=\"slow\" makes the waves slower and more relaxed, and \"fast\" makes the waves more active.",
            code: `<WavyBackground speed="slow" containerClassName="h-64 w-full">
  <span className="text-sm font-medium text-foreground">slow</span>
</WavyBackground>`,
            render: () => (<WavyWrap>
          <WavyBackground speed="slow" containerClassName="h-full w-full">
            <span className="text-sm font-medium text-foreground">slow</span>
          </WavyBackground>
        </WavyWrap>),
        },
        {
            title: "Blur intensity",
            description: "blur controls the softness of the band. When blur=0, the edge is sharp and the band outline is clear.",
            code: `<WavyBackground blur={0} containerClassName="h-64 w-full">
  <span className="text-sm font-medium text-foreground">blur=0</span>
</WavyBackground>`,
            render: () => (<WavyWrap>
          <WavyBackground blur={0} containerClassName="h-full w-full">
            <span className="text-sm font-medium text-foreground">blur=0</span>
          </WavyBackground>
        </WavyWrap>),
        },
        {
            title: "Custom color",
            description: "colors Pass a set of color values \u200B\u200B(recommended 5) to customize the brand wavy belt.",
            code: `<WavyBackground
  colors={["#a855f7", "#6366f1", "#c084fc", "#818cf8", "#a855f7"]}
  blur={8}
  containerClassName="h-64 w-full"
>
  <span className="text-sm font-medium text-white">custom</span>
</WavyBackground>`,
            render: () => (<WavyWrap>
          <WavyBackground colors={["#a855f7", "#6366f1", "#c084fc", "#818cf8", "#a855f7"]} blur={8} containerClassName="h-full w-full">
            <span className="text-sm font-medium text-white">custom</span>
          </WavyBackground>
        </WavyWrap>),
        },
    ],
    controls: [
        {
            prop: "speed",
            type: "select",
            options: ["slow", "fast"],
            defaultValue: "fast",
        },
        { prop: "blur", type: "number", defaultValue: 10 },
        { prop: "waveWidth", type: "number", defaultValue: 50 },
        { prop: "waveOpacity", type: "number", defaultValue: 0.5 },
    ],
    states: [
        {
            name: "default (fast + chart token)",
            render: () => (<WavyWrap>
          <WavyBackground containerClassName="h-full w-full">
            <span className="text-sm font-medium text-foreground">WavyBackground</span>
          </WavyBackground>
        </WavyWrap>),
        },
        {
            name: "slow speed",
            render: () => (<WavyWrap>
          <WavyBackground speed="slow" containerClassName="h-full w-full">
            <span className="text-sm font-medium text-foreground">slow</span>
          </WavyBackground>
        </WavyWrap>),
        },
        {
            name: "no blur",
            render: () => (<WavyWrap>
          <WavyBackground blur={0} containerClassName="h-full w-full">
            <span className="text-sm font-medium text-foreground">blur=0</span>
          </WavyBackground>
        </WavyWrap>),
        },
        {
            name: "custom colors (brand purple + brand blue)",
            render: () => (<WavyWrap>
          <WavyBackground colors={["#a855f7", "#6366f1", "#c084fc", "#818cf8", "#a855f7"]} blur={8} containerClassName="h-full w-full">
            <span className="text-sm font-medium text-white">custom</span>
          </WavyBackground>
        </WavyWrap>),
        },
        {
            name: "without children",
            render: () => (<WavyWrap>
          <WavyBackground containerClassName="h-full w-full"/>
        </WavyWrap>),
        },
    ],
    renderWithProps: (p) => (<WavyWrap>
      <WavyBackground speed={p.speed as "slow" | "fast"} blur={p.blur as number} waveWidth={p.waveWidth as number} waveOpacity={p.waveOpacity as number} containerClassName="h-full w-full">
        <span className="text-sm font-medium text-foreground">WavyBackground</span>
      </WavyBackground>
    </WavyWrap>),
    toCode: (p) => `<WavyBackground
  speed="${p.speed}"
  blur={${p.blur}}
  waveWidth={${p.waveWidth}}
  waveOpacity={${p.waveOpacity}}
  containerClassName="h-64 w-full"
>
  <h2 className="text-2xl font-bold">Hello, Waves</h2>
</WavyBackground>`,
};
