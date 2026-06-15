import type { ShowcaseSpec } from "../showcase/types";
import { Chrome } from "./chrome";

function Demo() {
  return (
    <div className="grid h-44 place-items-center bg-gradient-to-br from-chart-1/20 to-chart-3/20 text-sm text-muted">
      你的网页截图放这里
    </div>
  );
}

export const chromeShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "Chrome 外壳带标签页条 + 工具栏，包裹任意内容。",
      code: `<Chrome url="hulian.design" style={{ width: 375 }}>
  <img src="/screenshot.png" alt="" />
</Chrome>`,
      render: () => (
        <Chrome url="hulian.design" style={{ width: 375 }}>
          <Demo />
        </Chrome>
      ),
    },
    {
      title: "自定义标签标题",
      description: "title 设置标签页标题，缺省时回退取 url。",
      code: `<Chrome url="hulian.design" title="瑚琏 Hulian" style={{ width: 375 }}>
  <img src="/screenshot.png" alt="" />
</Chrome>`,
      render: () => (
        <Chrome url="hulian.design" title="瑚琏 Hulian" style={{ width: 375 }}>
          <Demo />
        </Chrome>
      ),
    },
    {
      title: "图片截图",
      description: "传 imageSrc 直接渲染网页截图（优先于 children）。",
      code: `<Chrome url="hulian.design" imageSrc="/screenshot.png" style={{ width: 375 }} />`,
      render: () => (
        <Chrome url="hulian.design" style={{ width: 375 }}>
          <Demo />
        </Chrome>
      ),
    },
  ],
  controls: [
    { prop: "url", type: "text", defaultValue: "hulian.design" },
    { prop: "title", type: "text", defaultValue: "瑚琏 Hulian" },
  ],
  states: [
    {
      name: "default（标签页 + 工具栏包裹内容）",
      render: () => (
        <Chrome style={{ width: 375 }}>
          <Demo />
        </Chrome>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Chrome style={{ width: 375 }} url={p.url as string} title={p.title as string}>
      <Demo />
    </Chrome>
  ),
  toCode: (p) =>
    `<Chrome url="${p.url}" title="${p.title}">\n  <img src="/screenshot.png" />\n</Chrome>`,
};
