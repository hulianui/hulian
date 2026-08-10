import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ShineBorder } from "../../../../packages/ui/src/shine-border/shine-border";
function Card({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-40 w-72 overflow-hidden rounded-xl bg-surface">
      {children}
    </div>);
}
export const shineBorderShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "ShineBorder is the absolute inset-0 streamer frame layer. Put it into the relative + rounded container to get the flowing shimmer of the entire frame. Default chart three-color gradient.",
            code: `<div className="relative h-40 w-72 overflow-hidden rounded-xl bg-surface">
  <div className="grid h-full place-items-center text-sm text-muted-foreground">Shine Border</div>
  <ShineBorder />
</div>`,
            render: () => (<Card>
          <div className="grid h-full place-items-center text-sm text-muted-foreground">Shine Border</div>
          <ShineBorder />
        </Card>),
        },
        {
            title: "Solid color \u00B7 Thick edges",
            description: "shineColor passes a single CSS color/token which is a single color streamer; borderWidth adjusts the border thickness.",
            code: `<ShineBorder borderWidth={2} shineColor="var(--color-primary)" />`,
            render: () => (<Card>
          <div className="grid h-full place-items-center text-sm text-muted-foreground">Single</div>
          <ShineBorder borderWidth={2} shineColor="var(--color-primary)"/>
        </Card>),
        },
        {
            title: "Multi-color \u00B7 Speed adjustment",
            description: "shineColor passes the color array to form a multi-segment gradient; duration controls the number of seconds for one round of the streamer (the larger it is, the slower it is).",
            code: `<ShineBorder
  shineColor={["var(--color-chart-2)", "var(--color-chart-4)", "var(--color-chart-1)"]}
  duration={8}
/>`,
            render: () => (<Card>
          <div className="grid h-full place-items-center text-sm text-muted-foreground">Multi · Fast</div>
          <ShineBorder shineColor={[
                    "var(--color-chart-2)",
                    "var(--color-chart-4)",
                    "var(--color-chart-1)",
                ]} duration={8}/>
        </Card>),
        },
    ],
    controls: [
        { prop: "borderWidth", type: "number", defaultValue: 1 },
        { prop: "duration", type: "number", defaultValue: 14 },
    ],
    states: [
        {
            name: "default (chart streamer edge)",
            render: () => (<Card>
          <div className="grid h-full place-items-center text-sm text-muted-foreground">Shine Border</div>
          <ShineBorder />
        </Card>),
        },
        {
            name: "Thick edge \u00B7 primary Monochrome",
            render: () => (<Card>
          <div className="grid h-full place-items-center text-sm text-muted-foreground">Single</div>
          <ShineBorder borderWidth={2} shineColor="var(--color-primary)"/>
        </Card>),
        },
    ],
    renderWithProps: (p) => (<Card>
      <div className="grid h-full place-items-center text-sm text-muted-foreground">Shine Border</div>
      <ShineBorder borderWidth={p.borderWidth as number} duration={p.duration as number}/>
    </Card>),
    toCode: (p) => `<div className="relative">
  ...content
  <ShineBorder borderWidth={${p.borderWidth}} duration={${p.duration}} />
</div>`,
};
