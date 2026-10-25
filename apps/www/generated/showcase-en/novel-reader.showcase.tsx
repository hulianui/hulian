"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { NovelReader } from "../../../../packages/ui/src/novel-reader/novel-reader";
const chapters = [
    { id: "c1", title: "Night crossing", content: "The river went dark. Shen Wan hung the lamp on the mast." },
    { id: "c2", title: "The way back", content: "The way back was lighter. She lit the flame again." },
];
function Demo() {
    return (<NovelReader className="h-[28rem] w-full max-w-3xl overflow-hidden rounded-[var(--radius)] border border-border" title="The Ferry Light" author="Shen Wan" chapters={chapters}/>);
}
const code = `<NovelReader
  className="h-[28rem]"
  title="The Ferry Light"
  author="Shen Wan"
  chapters={chapters}
/>`;
export const novelReaderShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The menu stays hidden, so the page opens on the prose. Tap the center to summon the catalog and reading settings.",
            code,
            render: () => <Demo />,
        },
    ],
    controls: [],
    states: [{ name: "Continuous scroll", render: () => <Demo /> }],
    renderWithProps: () => <Demo />,
    toCode: () => code,
};
