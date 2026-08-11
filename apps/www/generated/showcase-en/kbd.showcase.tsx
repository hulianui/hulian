"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Kbd, KbdGroup } from "../../../../packages/ui/src/kbd/kbd";
export const kbdShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Single button",
            description: "Wraps a single key name and renders it as a bordered keycap style.",
            code: `<Kbd>Esc</Kbd>`,
            render: () => <Kbd>Esc</Kbd>,
        },
        {
            title: "Key combination",
            description: "KbdGroup owns the gap and the separator, joining keys with + by default.",
            code: `<KbdGroup keys={["\u2318", "K"]} />`,
            render: () => <KbdGroup keys={["\u2318", "K"]}/>,
        },
        {
            title: "Custom separator, or none",
            description: "separator accepts any node; pass null to keep the spacing without a symbol.",
            code: `<KbdGroup keys={["\u2318", "\u21E7", "P"]} separator="\u00B7" />
<KbdGroup keys={["G", "T"]} separator={null} />`,
            render: () => (<div className="flex items-center gap-4">
          <KbdGroup keys={["\u2318", "\u21E7", "P"]} separator="·"/>
          <KbdGroup keys={["G", "T"]} separator={null}/>
        </div>),
        },
        {
            title: "Accessible name",
            description: "label gives the whole combination one accessible name, and the separator itself stays out of the accessibility tree.",
            code: `<KbdGroup keys={["\u2318", "K"]} label="Open the command panel" />`,
            render: () => <KbdGroup keys={["\u2318", "K"]} label="Open the command panel"/>,
        },
        {
            title: "Lay out the keycaps yourself",
            description: "Switch to children when one key needs its own styling or content; the separators are still inserted.",
            code: `<KbdGroup label="Save">
  <Kbd className="min-w-8">\u2318</Kbd>
  <Kbd>S</Kbd>
</KbdGroup>`,
            render: () => (<KbdGroup label="Save">
          <Kbd className="min-w-8">⌘</Kbd>
          <Kbd>S</Kbd>
        </KbdGroup>),
        },
        {
            title: "Embed text",
            description: "The shortcut keys are shown in the text, and the keycaps are aligned with the text baseline.",
            code: `<span className="text-sm text-muted-foreground">
  Press <KbdGroup keys={["\u2318", "S"]} label="Save" /> to save
</span>`,
            render: () => (<span className="text-sm text-muted-foreground">
          Press <KbdGroup keys={["\u2318", "S"]} label="Save"/> to save
        </span>),
        },
    ],
    controls: [],
    states: [
        { name: "single", render: () => <Kbd>Esc</Kbd> },
        { name: "group", render: () => <KbdGroup keys={["\u2318", "K"]}/> },
        { name: "group-dot", render: () => <KbdGroup keys={["\u2318", "\u21E7", "P"]} separator="·"/> },
        { name: "group-bare", render: () => <KbdGroup keys={["G", "T"]} separator={null}/> },
        {
            name: "group-labeled",
            render: () => <KbdGroup keys={["\u2318", "K"]} label="Open the command panel"/>,
        },
        {
            name: "in-text",
            render: () => (<span className="text-sm text-muted-foreground">
          Press <KbdGroup keys={["\u2318", "S"]} label="Save"/> to save
        </span>),
        },
    ],
    renderWithProps: () => <KbdGroup keys={["\u2318", "K"]} label="Open the command panel"/>,
    toCode: () => `<KbdGroup keys={["\u2318", "K"]} label="Open the command panel" />`,
};
