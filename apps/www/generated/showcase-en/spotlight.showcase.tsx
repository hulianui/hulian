import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Spotlight } from "../../../../packages/ui/src/spotlight/spotlight";
function Frame({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative grid h-48 w-full place-items-center overflow-hidden rounded-xl border border-border bg-bg">
      {children}
      <span className="relative z-10 text-sm font-medium text-foreground">The content is superimposed on it</span>
    </div>);
}
export const spotlightShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The parent container relative, Spotlight is used as the background layer, and the content is superimposed on it with relative z-10. Default top brand glow.",
            code: `<div className="relative ...">
  <Spotlight />
  <div className="relative z-10">...content...</div>
</div>`,
            render: () => (<Frame>
          <Spotlight />
        </Frame>),
        },
        {
            title: "Glow position",
            description: "x/y locates the glow center, intensity adjusts the brightness - the strong glow in the upper left corner is x=\"20%\", increase intensity.",
            code: `<div className="relative ...">
  <Spotlight x="20%" intensity={18} />
  <div className="relative z-10">...content...</div>
</div>`,
            render: () => (<Frame>
          <Spotlight x="20%" intensity={18}/>
        </Frame>),
        },
        {
            title: "Semantic Color Glow",
            description: "color Connect to any CSS color/variable, and change it to the success color to create a positive feedback hero/empty status background.",
            code: `<div className="relative ...">
  <Spotlight color="var(--color-success)" y="50%" size="100%" intensity={16} />
  <div className="relative z-10">...content...</div>
</div>`,
            render: () => (<Frame>
          <Spotlight color="var(--color-success)" y="50%" size="100%" intensity={16}/>
        </Frame>),
        },
        {
            title: "Gathering Glow",
            description: "fade The smaller the glow, the more concentrated it is - it can be used as a partial accent light for pop-up windows/cards in conjunction with the centered position.",
            code: `<div className="relative ...">
  <Spotlight y="50%" size="80%" intensity={20} fade={40} />
  <div className="relative z-10">...content...</div>
</div>`,
            render: () => (<Frame>
          <Spotlight y="50%" size="80%" intensity={20} fade={40}/>
        </Frame>),
        },
    ],
    controls: [
        { prop: "intensity", type: "number", defaultValue: 14, label: "Strength" },
        { prop: "fade", type: "number", defaultValue: 55, label: "Fade" },
    ],
    states: [
        {
            name: "Top brand glow (default)",
            render: () => (<Frame>
          <Spotlight />
        </Frame>),
        },
        {
            name: "Upper left glow",
            render: () => (<Frame>
          <Spotlight x="20%" intensity={18}/>
        </Frame>),
        },
        {
            name: "Centered Success Color Glow",
            render: () => (<Frame>
          <Spotlight color="var(--color-success)" y="50%" size="100%" intensity={16}/>
        </Frame>),
        },
    ],
    renderWithProps: (p) => (<Frame>
      <Spotlight intensity={p.intensity as number} fade={p.fade as number}/>
    </Frame>),
    toCode: (p) => `<div className="relative">
  <Spotlight intensity={${p.intensity}} fade={${p.fade}} />
  <div className="relative z-10">...content...</div>
</div>`,
};
