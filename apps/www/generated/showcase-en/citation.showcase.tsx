"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Citation } from "../../../../packages/ui/src/citation/citation";
export const citationShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "External link chip",
            description: "Serial number subtitle + title + source; when there is href, it will be rendered as a new tab page external link.",
            code: `<Citation index={1} title="Base UI Document" href="https://base-ui.com" source="base-ui.com" />`,
            render: () => (<Citation index={1} title="Base UI Documentation" href="https://base-ui.com" source="base-ui.com"/>),
        },
        {
            title: "Multiple lines inline in the text",
            description: "Mark the source of the information in the text of agent's answer, and align-middle follows the text baseline.",
            code: `<p className="text-sm leading-loose">
  Hulian's reachability comes from Base UI
  <Citation index={1} title="Base UI" href="https://base-ui.com" source="base-ui.com" />
  , table capability comes from TanStack
  <Citation index={2} title="TanStack Table" href="https://tanstack.com/table" source="tanstack.com" />
  .
</p>`,
            render: () => (<p className="max-w-lg text-sm leading-loose text-foreground">
          Hulian's reachability comes from Base UI
          <Citation index={1} title="Base UI" href="https://base-ui.com" source="base-ui.com"/>
          , table capability comes from TanStack
          <Citation index={2} title="TanStack Table" href="https://tanstack.com/table" source="tanstack.com"/>
          .
        </p>),
        },
        {
            title: "No link (local source)",
            description: "When href is omitted, it is rendered as non-link span, which is used for internal knowledge base and other sources without external links.",
            code: `<Citation index={3} title="Internal knowledge base notes" />`,
            render: () => <Citation index={3} title="Internal knowledge base notes"/>,
        },
        {
            title: "No serial number",
            description: "When index is omitted, the subtitle is not rendered, only the title + source.",
            code: `<Citation title="Product Requirements Document v2" source="Feishu" />`,
            render: () => <Citation title="Product requirements document v2" source="Feishu"/>,
        },
    ],
    controls: [
        { prop: "index", type: "number", defaultValue: 1 },
        { prop: "title", type: "text", defaultValue: "Hulian Design System Documentation" },
        { prop: "source", type: "text", defaultValue: "hulian.dev" },
    ],
    states: [
        {
            name: "External link + serial number + source",
            render: () => (<Citation index={1} title="Base UI Documentation" href="https://base-ui.com" source="base-ui.com"/>),
        },
        {
            name: "Multiple lines inline in the text",
            render: () => (<p className="max-w-lg text-sm leading-loose text-foreground">
          Hulian's reachability comes from Base UI
          <Citation index={1} title="Base UI" href="https://base-ui.com" source="base-ui.com"/>
          , table capability comes from TanStack
          <Citation index={2} title="TanStack Table" href="https://tanstack.com/table" source="tanstack.com"/>
          .
        </p>),
        },
        { name: "No link (local source)", render: () => <Citation index={3} title="Internal knowledge base notes"/> },
    ],
    renderWithProps: (p) => (<Citation index={p.index as number} title={p.title as string} source={p.source as string} href="https://hulian.dev"/>),
    toCode: (p) => `<Citation index={${p.index}} title="${p.title}" href="\u2026" source="${p.source}" />`,
};
