import type { ShowcaseSpec } from "../showcase/types";
import { Divider } from "./divider";

export const dividerShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "不传 children 即纯水平分隔线，分隔上下两段内容。",
      code: `<p>上段内容</p>
<Divider />
<p>下段内容</p>`,
      render: () => (
        <div className="w-full">
          <p className="text-sm text-foreground">上段内容</p>
          <Divider />
          <p className="text-sm text-foreground">下段内容</p>
        </div>
      ),
    },
    {
      title: "带文字 / 文字位置",
      description: "传入 children 嵌入文字，orientation 控制文字在左/中/右。",
      code: `<Divider>居中标题</Divider>
<Divider orientation="left">最近更新</Divider>
<Divider orientation="right">更多</Divider>`,
      render: () => (
        <div className="w-full">
          <Divider>居中标题</Divider>
          <Divider orientation="left">最近更新</Divider>
          <Divider orientation="right">更多</Divider>
        </div>
      ),
    },
    {
      title: "虚线",
      description: "dashed 切换为虚线，纯线与带文字均生效。",
      code: `<Divider dashed />
<Divider dashed>虚线分隔</Divider>`,
      render: () => (
        <div className="w-full">
          <Divider dashed />
          <Divider dashed>虚线分隔</Divider>
        </div>
      ),
    },
    {
      title: "常规字重",
      description: "plain 让嵌入文字使用常规字重（默认加粗一档）。",
      code: `<Divider plain>常规字重标题</Divider>`,
      render: () => (
        <div className="w-full">
          <Divider plain>常规字重标题</Divider>
        </div>
      ),
    },
    {
      title: "行内垂直分隔",
      description: 'type="vertical" 嵌在一行元素之间画竖线。',
      code: `<div className="flex items-center text-sm">
  <span>文档</span>
  <Divider type="vertical" />
  <span>组件</span>
  <Divider type="vertical" />
  <span>关于</span>
</div>`,
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
          <p className="text-sm text-muted-foreground">上段内容</p>
          <Divider />
          <p className="text-sm text-muted-foreground">下段内容</p>
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
