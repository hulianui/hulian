import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Callout } from "../../../../packages/ui/src/callout/callout";
import type { CalloutTone } from "../../../../packages/ui/src/callout/callout.types";
const Lightbulb = (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
    <path d="M9 18h6"/>
    <path d="M10 22h4"/>
  </svg>);
export const calloutShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Long article inline prompt: left accent vertical edge + very light background color, title in tone color, and body text remains foreground readable.",
            code: `<Callout title="Tip" tone="tip">
  Different from Alert (whole-dyed notification banner), Callout is specially designed for "pits/correct answers/tips" in articles/documents.
</Callout>`,
            render: () => (<div className="w-full max-w-lg">
          <Callout title="Tip" tone="tip">
            Different from Alert (whole-dyed notification banner), Callout is specially designed for "pits/correct answers/tips" in articles/documents.
          </Callout>
        </div>),
        },
        {
            title: "Semantic Hue",
            description: "tip / info / warning / success / danger Five kinds of tone, only dye accent edges and titles.",
            code: `<>
  <Callout tone="warning" title="pit">If you directly change the style in node_modules, it will be lost in the next installation. </Callout>
  <Callout tone="success" title="Correct solution">Use pnpm patch to cure the patch, follow lockfile. </Callout>
  <Callout tone="danger" title="Danger">This operation will clear the database, so be sure to back it up first. </Callout>
</>`,
            render: () => (<div className="w-full max-w-lg">
          <Callout tone="warning" title="Pit">
            If you directly change the style in node_modules, it will be lost next time you install it.
          </Callout>
          <Callout tone="success" title="Correct answer">
            Use pnpm patch to cure the patch and follow lockfile.
          </Callout>
          <Callout tone="danger" title="Danger">
            This operation will clear the database, so be sure to back it up first.
          </Callout>
        </div>),
        },
        {
            title: "Custom icon",
            description: "The icon slot comes with any ReactNode, the same color as the title.",
            code: `<Callout tone="tip" title="Tips" icon={<LightbulbIcon />}>
  showcase file shape can be copied directly from score-ring.showcase.tsx.
</Callout>`,
            render: () => (<div className="w-full max-w-lg">
          <Callout tone="tip" title="Tips" icon={Lightbulb}>
            showcase file shape can be copied directly from score-ring.showcase.tsx.
          </Callout>
        </div>),
        },
    ],
    controls: [
        {
            prop: "tone",
            type: "select",
            options: ["tip", "info", "warning", "success", "danger"],
            defaultValue: "tip",
            label: "Hue",
        },
        { prop: "title", type: "text", defaultValue: "Tip", label: "Title" },
    ],
    states: [
        {
            name: "tip",
            render: () => (<Callout tone="tip" title="Tip" className="w-full max-w-lg">
          Long text inline prompt, the text remains foreground.
        </Callout>),
        },
        {
            name: "warning",
            render: () => (<Callout tone="warning" title="Pit" className="w-full max-w-lg">
          Directly changing node_modules will be lost after reinstallation.
        </Callout>),
        },
        {
            name: "success",
            render: () => (<Callout tone="success" title="Correct answer" className="w-full max-w-lg">
          Cure patch with pnpm patch.
        </Callout>),
        },
        {
            name: "danger",
            render: () => (<Callout tone="danger" title="Danger" className="w-full max-w-lg">
          This operation is irreversible, please back up first.
        </Callout>),
        },
        {
            name: "Untitled",
            render: () => <Callout tone="info" className="w-full max-w-lg">A minimalist form with only the main text.</Callout>,
        },
    ],
    renderWithProps: (p) => (<Callout tone={p.tone as CalloutTone} title={String(p.title)} className="w-full max-w-lg">
      The text content remains foreground readable, only the title and accent are colored tone.
    </Callout>),
    toCode: (p) => `<Callout tone="${p.tone}" title="${p.title}">Text content</Callout>`,
};
