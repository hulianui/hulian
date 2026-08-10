import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Chrome } from "../../../../packages/ui/src/chrome/chrome";
function Demo() {
    return (<div className="grid h-44 place-items-center bg-gradient-to-br from-chart-1/20 to-chart-3/20 text-sm text-muted-foreground">
      Put your webpage screenshot here
    </div>);
}
export const chromeShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Chrome shell with tab strip + toolbar, wrapping any content.",
            code: `<Chrome url="hulian.design" style={{ width: 375 }}>
  <img src="/screenshot.png" alt="" />
</Chrome>`,
            render: () => (<Chrome url="hulian.design" style={{ width: 375 }}>
          <Demo />
        </Chrome>),
        },
        {
            title: "Custom label title",
            description: "title Sets the tab title. By default, it falls back to url.",
            code: `<Chrome url="hulian.design" title="Hulian" style={{ width: 375 }}>
  <img src="/screenshot.png" alt="" />
</Chrome>`,
            render: () => (<Chrome url="hulian.design" title="Hulian" style={{ width: 375 }}>
          <Demo />
        </Chrome>),
        },
        {
            title: "Picture screenshot",
            description: "Pass imageSrc to directly render web page screenshots (priority to children).",
            code: `<Chrome url="hulian.design" imageSrc="/screenshot.png" style={{ width: 375 }} />`,
            render: () => (<Chrome url="hulian.design" style={{ width: 375 }}>
          <Demo />
        </Chrome>),
        },
    ],
    controls: [
        { prop: "url", type: "text", defaultValue: "hulian.design" },
        { prop: "title", type: "text", defaultValue: "Hulian" },
    ],
    states: [
        {
            name: "default (tab + toolbar package content)",
            render: () => (<Chrome style={{ width: 375 }}>
          <Demo />
        </Chrome>),
        },
    ],
    renderWithProps: (p) => (<Chrome style={{ width: 375 }} url={p.url as string} title={p.title as string}>
      <Demo />
    </Chrome>),
    toCode: (p) => `<Chrome url="${p.url}" title="${p.title}">
  <img src="/screenshot.png" />
</Chrome>`,
};
