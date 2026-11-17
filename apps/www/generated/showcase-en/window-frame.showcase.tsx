import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Button } from "../../../../packages/ui/src/button";
import { Tag } from "../../../../packages/ui/src/tag";
import { Text } from "../../../../packages/ui/src/text";
import { WindowFrame } from "../../../../packages/ui/src/window-frame/window-frame";
function Body() {
    return (<div className="space-y-2 p-5">
      <Text weight="semibold">Orders overview</Text>
      <Text size="sm" tone="muted">
        128 new orders this week, 1.2% refunded.
      </Text>
    </div>);
}
export const windowFrameShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Traffic lights and a title wrap a piece of product UI into an \"app screenshot\"; a string title renders as small monospace text.",
            code: `<WindowFrame title="dashboard">
  <div className="p-5">\u2026</div>
</WindowFrame>`,
            render: () => (<WindowFrame title="dashboard" className="w-full max-w-md">
          <Body />
        </WindowFrame>),
        },
        {
            title: "Node title and toolbar",
            description: "title can also hold nodes such as a Tag; toolbar sits at the right end of the title bar.",
            code: `<WindowFrame
  title={<Tag tone="brand" size="sm">MCP</Tag>}
  toolbar={<Button size="xs" variant="ghost">Clear</Button>}
>
  \u2026
</WindowFrame>`,
            render: () => (<WindowFrame className="w-full max-w-md" title={<Tag tone="brand" size="sm">
              MCP
            </Tag>} toolbar={<Button size="xs" variant="ghost">
              Clear
            </Button>}>
          <Body />
        </WindowFrame>),
        },
    ],
    controls: [{ prop: "title", type: "text", defaultValue: "dashboard", label: "Title" }],
    states: [
        {
            name: "With title",
            render: () => (<WindowFrame title="dashboard" className="w-full max-w-md">
          <Body />
        </WindowFrame>),
        },
    ],
    renderWithProps: (p) => (<WindowFrame title={p.title as string} className="w-full max-w-md">
      <Body />
    </WindowFrame>),
    toCode: (p) => `<WindowFrame title="${p.title}">
  \u2026
</WindowFrame>`,
};
