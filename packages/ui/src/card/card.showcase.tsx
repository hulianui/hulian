"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Card, CardHeader, CardBody, CardFooter } from "./card";

type CardVariant = "outline" | "elevated" | "featured" | "plain";

function Demo(props: { variant?: CardVariant; withFooter?: boolean }) {
  return (
    <Card variant={props.variant} className="w-64">
      <CardHeader>瑚琏卡片</CardHeader>
      <CardBody>宗庙玉器，至美又大用。颜值 + 好用是第一生产力。</CardBody>
      {props.withFooter && <CardFooter>footer 区</CardFooter>}
    </Card>
  );
}

export const cardShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "outline 描边卡片，由 CardHeader / CardBody / CardFooter 三段组成。",
      code: `<Card variant="outline" className="w-64">
  <CardHeader>瑚琏卡片</CardHeader>
  <CardBody>宗庙玉器，至美又大用。颜值 + 好用是第一生产力。</CardBody>
  <CardFooter>footer 区</CardFooter>
</Card>`,
      render: () => <Demo variant="outline" withFooter />,
    },
    {
      title: "浮起卡片",
      description: "elevated 用阴影替代实线边框，hover 时阴影加深。",
      code: `<Card variant="elevated" className="w-64">
  <CardHeader>瑚琏卡片</CardHeader>
  <CardBody>宗庙玉器，至美又大用。颜值 + 好用是第一生产力。</CardBody>
  <CardFooter>footer 区</CardFooter>
</Card>`,
      render: () => <Demo variant="elevated" withFooter />,
    },
    {
      title: "高亮卡片",
      description: "featured 用 primary 双线描边突出推荐项，网格内对齐不偏移。",
      code: `<Card variant="featured" className="w-64">
  <CardHeader>瑚琏卡片</CardHeader>
  <CardBody>宗庙玉器，至美又大用。颜值 + 好用是第一生产力。</CardBody>
  <CardFooter>footer 区</CardFooter>
</Card>`,
      render: () => <Demo variant="featured" withFooter />,
    },
    {
      title: "不画皮",
      description:
        "plain 不画边框/底色/阴影，只留圆角与插槽语义。外皮由外层容器提供时用它，否则会双重描边。",
      code: `{/* 外皮归外层容器，结构归 Card */}
<div className="rounded-[var(--radius)] border border-primary/40 bg-primary/5 p-1">
  <Card variant="plain" className="w-64">
    <CardHeader>瑚琏卡片</CardHeader>
    <CardBody>宗庙玉器，至美又大用。颜值 + 好用是第一生产力。</CardBody>
  </Card>
</div>`,
      render: () => (
        <div className="rounded-[var(--radius)] border border-primary/40 bg-primary/5 p-1">
          <Demo variant="plain" withFooter={false} />
        </div>
      ),
    },
    {
      title: "无 footer",
      description: "三段皆可选，仅 Header + Body 也成立。",
      code: `<Card variant="outline" className="w-64">
  <CardHeader>瑚琏卡片</CardHeader>
  <CardBody>宗庙玉器，至美又大用。颜值 + 好用是第一生产力。</CardBody>
</Card>`,
      render: () => <Demo variant="outline" withFooter={false} />,
    },
    {
      title: "去掉分区分隔线",
      description: "divided={false} 让标题区与正文成为同一块，并顺带收掉分隔线撑着的那段内边距。",
      code: `<Card divided={false} className="w-64">
  <CardHeader>待办审批</CardHeader>
  <CardBody>三条待办等待处理。</CardBody>
</Card>`,
      render: () => (
        <div className="flex gap-4">
          <Card className="w-56">
            <CardHeader>有分隔线</CardHeader>
            <CardBody>默认形态，标题与正文被一条线切开。</CardBody>
          </Card>
          <Card divided={false} className="w-56">
            <CardHeader>无分隔线</CardHeader>
            <CardBody>标题与正文是同一块。</CardBody>
          </Card>
        </div>
      ),
    },
  ],
  controls: [
    {
      prop: "variant",
      type: "select",
      options: ["outline", "elevated", "featured", "plain"],
      defaultValue: "outline",
    },
    { prop: "withFooter", type: "boolean", defaultValue: true, label: "显示 footer" },
  ],
  states: [
    { name: "outline", render: () => <Demo variant="outline" withFooter /> },
    { name: "elevated", render: () => <Demo variant="elevated" withFooter /> },
    { name: "featured", render: () => <Demo variant="featured" withFooter /> },
    {
      name: "plain（不画皮）",
      render: () => (
        <div className="rounded-[var(--radius)] border border-primary/40 bg-primary/5 p-1">
          <Demo variant="plain" withFooter={false} />
        </div>
      ),
    },
    { name: "无 footer", render: () => <Demo variant="outline" withFooter={false} /> },
    {
      name: "divided={false}（分区无线）",
      render: () => (
        <Card divided={false} className="w-64">
          <CardHeader>待办审批</CardHeader>
          <CardBody>标题区与内容区在视觉上是同一块。</CardBody>
          <CardFooter>共 3 条</CardFooter>
        </Card>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Demo variant={p.variant as CardVariant} withFooter={p.withFooter as boolean} />
  ),
  toCode: (p) =>
    `<Card variant="${p.variant}">\n  <CardHeader>瑚琏卡片</CardHeader>\n  <CardBody>...</CardBody>${
      p.withFooter ? "\n  <CardFooter>footer 区</CardFooter>" : ""
    }\n</Card>`,
};
