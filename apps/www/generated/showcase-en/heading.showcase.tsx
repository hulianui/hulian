"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Heading } from "../../../../packages/ui/src/heading/heading";
import type { HeadingLevel, HeadingWeight } from "../../../../packages/ui/src/heading/heading.types";
export const headingShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Sixth level title",
            description: "level determines both the semantic label h{level} and the default visual size.",
            code: `<Heading level={1}>First-level title</Heading>
<Heading level={2}>Level 2 title</Heading>
<Heading level={3}>Level 3 title</Heading>
<Heading level={4}>Level 4 title</Heading>`,
            render: () => (<div className="flex flex-col gap-2">
          <Heading level={1}>First level title</Heading>
          <Heading level={2}>Second level title</Heading>
          <Heading level={3}>Level 3 heading</Heading>
          <Heading level={4}>Level 4 heading</Heading>
        </div>),
        },
        {
            title: "Font weight",
            description: "weight provides normal/medium/semibold/bold and defaults to semibold.",
            code: `<Heading level={3} weight="normal">General</Heading>
<Heading level={3} weight="medium">Medium</Heading>
<Heading level={3} weight="semibold">Semi-coarse</Heading>
<Heading level={3} weight="bold">Bold</Heading>`,
            render: () => (<div className="flex flex-col gap-2">
          <Heading level={3} weight="normal">
            General
          </Heading>
          <Heading level={3} weight="medium">
            Medium
          </Heading>
          <Heading level={3} weight="semibold">
            Half thick
          </Heading>
          <Heading level={3} weight="bold">
            bold
          </Heading>
        </div>),
        },
        {
            title: "Visual/Semantic Decoupling",
            description: "size independently overrides visual dimensions, decoupled from level semantics (h2 tag renders lg dimensions).",
            code: `<Heading level={2} size="lg">The semantic is h2, the visual is lg</Heading>`,
            render: () => (<Heading level={2} size="lg">
          The semantic is h2 and the visual is lg
        </Heading>),
        },
        {
            title: "Cover tag + balanced line wrapping",
            description: "as overrides the render tag, balance enables text-balance to make multi-line titles more proportional.",
            code: `<Heading level={1} as="div" balance>
  Large visual title rendered with div, balance balanced line wrapping enabled
</Heading>`,
            render: () => (<Heading level={1} as="div" balance>
          Large visual title rendered with div, balance balanced line wrapping enabled
        </Heading>),
        },
    ],
    controls: [
        {
            prop: "level",
            type: "select",
            options: ["1", "2", "3", "4", "5", "6"],
            defaultValue: "2",
            label: "Level",
        },
        {
            prop: "weight",
            type: "select",
            options: ["normal", "medium", "semibold", "bold"],
            defaultValue: "semibold",
            label: "Font weight",
        },
    ],
    states: [
        {
            name: "Six-level heading (semantic label + default size)",
            render: () => (<div className="flex flex-col gap-2">
          <Heading level={1}>Heading Level 1 · h1</Heading>
          <Heading level={2}>Heading Level 2 · h2</Heading>
          <Heading level={3}>Heading Level 3 · h3</Heading>
          <Heading level={4}>Heading Level 4 · h4</Heading>
          <Heading level={5}>Heading Level 5 · h5</Heading>
          <Heading level={6}>Heading Level 6 · h6</Heading>
        </div>),
        },
        {
            name: "Font weight comparison",
            render: () => (<div className="flex flex-col gap-2">
          <Heading level={3} weight="normal">
            Regular normal
          </Heading>
          <Heading level={3} weight="medium">
            medium
          </Heading>
          <Heading level={3} weight="semibold">
            Half thick semibold
          </Heading>
          <Heading level={3} weight="bold">
            bold
          </Heading>
        </div>),
        },
        {
            name: "Visual/semantic decoupling (h2 tag, rendered to h4 size)",
            render: () => (<Heading level={2} size="lg">
          The semantic is h2 and the visual is lg
        </Heading>),
        },
        {
            name: "as overlay label (div carries large title style)",
            render: () => (<Heading level={1} as="div" balance>
          Large visual title rendered with div, balance balanced line wrapping enabled
        </Heading>),
        },
    ],
    renderWithProps: (p) => (<Heading level={Number(p.level) as HeadingLevel} weight={p.weight as HeadingWeight}>
      Hulian Heading Title
    </Heading>),
    toCode: (p) => `<Heading level={${p.level}}${p.weight === "semibold" ? "" : ` weight="${p.weight}"`}>Hulian Heading Title</Heading>`,
};
