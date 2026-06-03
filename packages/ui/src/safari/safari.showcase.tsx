import type { ShowcaseSpec } from "../showcase/types";
import { Safari } from "./safari";

function Demo() {
  return (
    <div className="grid h-44 place-items-center bg-gradient-to-br from-chart-1/20 to-chart-3/20 text-sm text-muted">
      你的网页截图放这里
    </div>
  );
}

export const safariShowcase: ShowcaseSpec = {
  controls: [{ prop: "url", type: "text", defaultValue: "hulian.design" }],
  states: [
    {
      name: "default（浏览器外壳包裹内容）",
      render: () => (
        <Safari className="w-96">
          <Demo />
        </Safari>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Safari className="w-96" url={p.url as string}>
      <Demo />
    </Safari>
  ),
  toCode: (p) => `<Safari url="${p.url}">\n  <img src="/screenshot.png" />\n</Safari>`,
};
