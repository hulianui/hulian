import type { ShowcaseSpec } from "../showcase/types";
import { Safari } from "./safari";

function Demo() {
  return (
    <div className="grid h-44 place-items-center bg-gradient-to-br from-chart-1/20 to-chart-3/20 text-sm text-muted-foreground">
      你的网页截图放这里
    </div>
  );
}

export const safariShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "用 Safari 外壳包裹任意内容（网页截图、组件预览等）。",
      code: `<Safari url="hulian.design" style={{ width: 375 }}>
  <img src="/screenshot.png" alt="" />
</Safari>`,
      render: () => (
        <Safari url="hulian.design" style={{ width: 375 }}>
          <Demo />
        </Safari>
      ),
    },
    {
      title: "自定义地址栏",
      description: "通过 url 设置地址栏文本。",
      code: `<Safari url="app.hulian.design/dashboard" style={{ width: 375 }}>
  <img src="/screenshot.png" alt="" />
</Safari>`,
      render: () => (
        <Safari url="app.hulian.design/dashboard" style={{ width: 375 }}>
          <Demo />
        </Safari>
      ),
    },
    {
      title: "图片截图",
      description: "传 imageSrc 直接渲染网页截图（优先于 children）。",
      code: `<Safari url="hulian.design" imageSrc="/screenshot.png" style={{ width: 375 }} />`,
      render: () => (
        <Safari url="hulian.design" style={{ width: 375 }}>
          <Demo />
        </Safari>
      ),
    },
  ],
  controls: [{ prop: "url", type: "text", defaultValue: "hulian.design" }],
  states: [
    {
      name: "default（浏览器外壳包裹内容）",
      render: () => (
        <Safari style={{ width: 375 }}>
          <Demo />
        </Safari>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Safari style={{ width: 375 }} url={p.url as string}>
      <Demo />
    </Safari>
  ),
  toCode: (p) => `<Safari url="${p.url}">\n  <img src="/screenshot.png" />\n</Safari>`,
};
