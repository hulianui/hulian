"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { NovelEditor } from "../../../../packages/ui/src/novel-editor/novel-editor";
const chapters = [{ id: "c1", title: "Night crossing", content: "The river went dark." }];
function Demo() {
    return <NovelEditor className="h-[28rem] w-full" defaultChapters={chapters}/>;
}
const code = `<NovelEditor className="h-[28rem]" defaultChapters={chapters} />`;
export const novelEditorShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Manage chapters on the left, write Markdown on the right, and keep the preview open.",
            code,
            render: () => <Demo />,
        },
    ],
    controls: [],
    states: [{ name: "Writing", render: () => <Demo /> }],
    renderWithProps: () => <Demo />,
    toCode: () => code,
};
