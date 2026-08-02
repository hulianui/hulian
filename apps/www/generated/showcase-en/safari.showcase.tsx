import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Safari } from "../../../../packages/ui/src/safari/safari";
function Demo() {
    return (<div className="grid h-44 place-items-center bg-gradient-to-br from-chart-1/20 to-chart-3/20 text-sm text-muted">
      Put your webpage screenshot here
    </div>);
}
export const safariShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Use Safari shell to wrap any content (webpage screenshots, component previews, etc.).",
            code: `<Safari url="hulian.design" style={{ width: 375 }}>
  <img src="/screenshot.png" alt="" />
</Safari>`,
            render: () => (<Safari url="hulian.design" style={{ width: 375 }}>
          <Demo />
        </Safari>),
        },
        {
            title: "Customize the address bar",
            description: "Set address bar text via url.",
            code: `<Safari url="app.hulian.design/dashboard" style={{ width: 375 }}>
  <img src="/screenshot.png" alt="" />
</Safari>`,
            render: () => (<Safari url="app.hulian.design/dashboard" style={{ width: 375 }}>
          <Demo />
        </Safari>),
        },
        {
            title: "Picture screenshot",
            description: "Pass imageSrc to directly render web page screenshots (priority to children).",
            code: `<Safari url="hulian.design" imageSrc="/screenshot.png" style={{ width: 375 }} />`,
            render: () => (<Safari url="hulian.design" style={{ width: 375 }}>
          <Demo />
        </Safari>),
        },
    ],
    controls: [{ prop: "url", type: "text", defaultValue: "hulian.design" }],
    states: [
        {
            name: "default (browser shell package content)",
            render: () => (<Safari style={{ width: 375 }}>
          <Demo />
        </Safari>),
        },
    ],
    renderWithProps: (p) => (<Safari style={{ width: 375 }} url={p.url as string}>
      <Demo />
    </Safari>),
    toCode: (p) => `<Safari url="${p.url}">
  <img src="/screenshot.png" />
</Safari>`,
};
