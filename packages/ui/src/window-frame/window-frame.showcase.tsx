import type { ShowcaseSpec } from "../showcase/types";
import { Button } from "../button";
import { Tag } from "../tag";
import { Text } from "../text";
import { WindowFrame } from "./window-frame";

function Body() {
  return (
    <div className="space-y-2 p-5">
      <Text weight="semibold">订单概览</Text>
      <Text size="sm" tone="muted">
        本周新增 128 单，退款率 1.2%。
      </Text>
    </div>
  );
}

export const windowFrameShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "三色点 + 标题，把一块产品界面包成一张「应用截图」；字符串标题按等宽小字渲染。",
      code: `<WindowFrame title="dashboard">
  <div className="p-5">…</div>
</WindowFrame>`,
      render: () => (
        <WindowFrame title="dashboard" className="w-full max-w-md">
          <Body />
        </WindowFrame>
      ),
    },
    {
      title: "节点标题 · 操作槽",
      description: "title 也可以放 Tag 等节点；toolbar 放在标题栏右端。",
      code: `<WindowFrame
  title={<Tag tone="brand" size="sm">MCP</Tag>}
  toolbar={<Button size="xs" variant="ghost">清空</Button>}
>
  …
</WindowFrame>`,
      render: () => (
        <WindowFrame
          className="w-full max-w-md"
          title={
            <Tag tone="brand" size="sm">
              MCP
            </Tag>
          }
          toolbar={
            <Button size="xs" variant="ghost">
              清空
            </Button>
          }
        >
          <Body />
        </WindowFrame>
      ),
    },
  ],
  controls: [{ prop: "title", type: "text", defaultValue: "dashboard", label: "标题" }],
  states: [
    {
      name: "带标题",
      render: () => (
        <WindowFrame title="dashboard" className="w-full max-w-md">
          <Body />
        </WindowFrame>
      ),
    },
  ],
  renderWithProps: (p) => (
    <WindowFrame title={p.title as string} className="w-full max-w-md">
      <Body />
    </WindowFrame>
  ),
  toCode: (p) => `<WindowFrame title="${p.title}">
  …
</WindowFrame>`,
};
