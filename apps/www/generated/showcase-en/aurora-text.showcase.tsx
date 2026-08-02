import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { AuroraText } from "../../../../packages/ui/src/aurora-text/aurora-text";
export const auroraTextShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Uses the Hulian chart-token gradient by default and adapts to the active theme.",
            code: `<AuroraText className="text-4xl font-bold">Hulian</AuroraText>`,
            render: () => <AuroraText className="text-4xl font-bold">Hulian</AuroraText>,
        },
        {
            title: "Flow speed",
            description: "speed controls the streamer speed magnification, the larger the value, the faster it is (default 1).",
            code: `<AuroraText className="text-4xl font-bold" speed={3}>
  Aurora
</AuroraText>`,
            render: () => (<AuroraText className="text-4xl font-bold" speed={3}>
          Aurora
        </AuroraText>),
        },
        {
            title: "Custom gradient color",
            description: "colors Pass in any dock color array (it is recommended to use token for light and dark).",
            code: `<AuroraText
  className="text-4xl font-bold"
  colors={["var(--color-chart-2)", "var(--color-chart-4)", "var(--color-primary)"]}
>
  Spectrum
</AuroraText>`,
            render: () => (<AuroraText className="text-4xl font-bold" colors={["var(--color-chart-2)", "var(--color-chart-4)", "var(--color-primary)"]}>
          Spectrum
        </AuroraText>),
        },
        {
            title: "Title level typesetting",
            description: "As a headline embellishment, ordinary text is mixed and only the keywords are highlighted.",
            code: `<h2 className="text-3xl font-bold text-foreground">
  Brand new <AuroraText>Hulian</AuroraText> design system
</h2>`,
            render: () => (<h2 className="text-3xl font-bold text-foreground">
          Brand new <AuroraText>Hulian</AuroraText> Design System
        </h2>),
        },
    ],
    controls: [{ prop: "speed", type: "number", defaultValue: 1 }],
    states: [
        {
            name: "default (chart token streamer)",
            render: () => (<AuroraText className="text-4xl font-bold">Hulian</AuroraText>),
        },
        {
            name: "Fast",
            render: () => (<AuroraText className="text-4xl font-bold" speed={2}>
          Aurora
        </AuroraText>),
        },
    ],
    renderWithProps: (p) => (<AuroraText className="text-4xl font-bold" speed={p.speed as number}>
      Hulian
    </AuroraText>),
    toCode: (p) => `<AuroraText speed={${p.speed}}>Hulian</AuroraText>`,
};
