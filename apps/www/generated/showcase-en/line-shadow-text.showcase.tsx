import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { LineShadowText } from "../../../../packages/ui/src/line-shadow-text/line-shadow-text";
export const lineShadowTextShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "A static striped shadow that defaults to --color-foreground, so it holds up in both light and dark themes.",
            code: `<LineShadowText className="text-5xl font-bold">Hulian</LineShadowText>`,
            render: () => <LineShadowText className="text-5xl font-bold">Hulian</LineShadowText>,
        },
        {
            title: "Shadow color",
            description: "shadowColor accepts any CSS color; a token needs the --color- prefix.",
            code: `<LineShadowText className="text-5xl font-bold" shadowColor="var(--color-primary)">
  Hulian
</LineShadowText>`,
            render: () => (<LineShadowText className="text-5xl font-bold" shadowColor="var(--color-primary)">
          Hulian
        </LineShadowText>),
        },
        {
            title: "Stripe width and offset",
            description: "lineWidth sets the stripe density and offset sets the shadow distance; both use em, so they scale with the font size.",
            code: `<LineShadowText className="text-5xl font-bold" lineWidth="0.12em" offset="0.08em">
  Bold
</LineShadowText>`,
            render: () => (<LineShadowText className="text-5xl font-bold" lineWidth="0.12em" offset="0.08em">
          Bold
        </LineShadowText>),
        },
        {
            title: "Drift (optional)",
            description: "animated drifts the stripes slowly along the diagonal. It is off by default because this preset is the most restrained member of the text-effect family, usable on print pages and corporate sites. Even when enabled it still respects prefers-reduced-motion.",
            code: `<LineShadowText className="text-5xl font-bold" animated duration="8s">
  Motion
</LineShadowText>`,
            render: () => (<LineShadowText className="text-5xl font-bold" animated duration="8s">
          Motion
        </LineShadowText>),
        },
        {
            title: "Accenting a brand word in a hero heading",
            description: "Shadow only the two-to-four word brand phrase and leave the rest of the heading in ordinary type.",
            code: `<h1 className="text-4xl font-bold text-foreground">
  <LineShadowText shadowColor="var(--color-primary)">Hulian</LineShadowText> admin component library
</h1>`,
            render: () => (<h1 className="text-4xl font-bold text-foreground">
          <LineShadowText shadowColor="var(--color-primary)">Hulian</LineShadowText> admin component library
        </h1>),
        },
    ],
    controls: [
        { prop: "offset", type: "text", defaultValue: "0.04em", label: "Offset" },
        { prop: "lineWidth", type: "text", defaultValue: "0.06em", label: "Stripe width" },
        { prop: "animated", type: "boolean", defaultValue: false, label: "Drift" },
    ],
    states: [
        {
            name: "default (static)",
            render: () => <LineShadowText className="text-5xl font-bold">Hulian</LineShadowText>,
        },
        {
            name: "Primary-color shadow",
            render: () => (<LineShadowText className="text-5xl font-bold" shadowColor="var(--color-primary)">
          Hulian
        </LineShadowText>),
        },
        {
            name: "Coarse stripes",
            render: () => (<LineShadowText className="text-5xl font-bold" lineWidth="0.12em" offset="0.08em">
          Bold
        </LineShadowText>),
        },
        {
            name: "Drift",
            render: () => (<LineShadowText className="text-5xl font-bold" animated duration="8s">
          Motion
        </LineShadowText>),
        },
    ],
    renderWithProps: (p) => (<LineShadowText className="text-5xl font-bold" offset={p.offset as string} lineWidth={p.lineWidth as string} animated={p.animated as boolean}>
      Hulian
    </LineShadowText>),
    toCode: (p) => `<LineShadowText offset="${p.offset}" lineWidth="${p.lineWidth}"${p.animated ? " animated" : ""}>Hulian</LineShadowText>`,
};
