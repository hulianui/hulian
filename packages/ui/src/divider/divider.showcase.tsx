import type { ShowcaseSpec } from "../showcase/types";
import { Divider } from "./divider";

export const dividerShowcase: ShowcaseSpec = {
  controls: [
    { prop: "orientation", type: "select", options: ["left", "center", "right"], defaultValue: "center", label: "文字位置" },
    { prop: "children", type: "text", defaultValue: "分隔标题", label: "文字" },
    { prop: "dashed", type: "boolean", defaultValue: false, label: "虚线" },
    { prop: "plain", type: "boolean", defaultValue: false, label: "常规字重" },
  ],
  states: [
    {
      name: "纯分隔线",
      render: () => (
        <div className="w-full">
          <p className="text-sm text-muted">上段内容</p>
          <Divider />
          <p className="text-sm text-muted">下段内容</p>
        </div>
      ),
    },
    {
      name: "文字居中",
      render: () => (
        <div className="w-full">
          <Divider>瑚琏 Hulian</Divider>
        </div>
      ),
    },
    {
      name: "文字偏左",
      render: () => (
        <div className="w-full">
          <Divider orientation="left">最近更新</Divider>
        </div>
      ),
    },
    {
      name: "文字偏右",
      render: () => (
        <div className="w-full">
          <Divider orientation="right">更多</Divider>
        </div>
      ),
    },
    {
      name: "虚线",
      render: () => (
        <div className="w-full">
          <Divider dashed>虚线分隔</Divider>
        </div>
      ),
    },
    {
      name: "行内垂直",
      render: () => (
        <div className="flex items-center text-sm text-foreground">
          <span>文档</span>
          <Divider type="vertical" />
          <span>组件</span>
          <Divider type="vertical" />
          <span>关于</span>
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <div className="w-full">
      <Divider
        orientation={p.orientation as "left" | "center" | "right"}
        dashed={Boolean(p.dashed)}
        plain={Boolean(p.plain)}
      >
        {(p.children as string) || undefined}
      </Divider>
    </div>
  ),
  toCode: (p) =>
    `<Divider orientation="${p.orientation}"${p.dashed ? " dashed" : ""}${p.plain ? " plain" : ""}>${p.children}</Divider>`,
};
