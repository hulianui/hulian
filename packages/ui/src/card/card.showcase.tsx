"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Card, CardHeader, CardBody, CardFooter } from "./card";

type CardVariant = "outline" | "elevated" | "featured";

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
      title: "无 footer",
      description: "三段皆可选，仅 Header + Body 也成立。",
      code: `<Card variant="outline" className="w-64">
  <CardHeader>瑚琏卡片</CardHeader>
  <CardBody>宗庙玉器，至美又大用。颜值 + 好用是第一生产力。</CardBody>
</Card>`,
      render: () => <Demo variant="outline" withFooter={false} />,
    },
  ],
  controls: [
    { prop: "variant", type: "select", options: ["outline", "elevated", "featured"], defaultValue: "outline" },
    { prop: "withFooter", type: "boolean", defaultValue: true, label: "显示 footer" },
  ],
  states: [
    { name: "outline", render: () => <Demo variant="outline" withFooter /> },
    { name: "elevated", render: () => <Demo variant="elevated" withFooter /> },
    { name: "featured", render: () => <Demo variant="featured" withFooter /> },
    { name: "无 footer", render: () => <Demo variant="outline" withFooter={false} /> },
  ],
  renderWithProps: (p) => (
    <Demo variant={p.variant as CardVariant} withFooter={p.withFooter as boolean} />
  ),
  toCode: (p) =>
    `<Card variant="${p.variant}">\n  <CardHeader>瑚琏卡片</CardHeader>\n  <CardBody>...</CardBody>${
      p.withFooter ? "\n  <CardFooter>footer 区</CardFooter>" : ""
    }\n</Card>`,
};
