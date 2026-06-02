"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Card, CardHeader, CardBody, CardFooter } from "./card";

function Demo(props: { variant?: "outline" | "elevated"; withFooter?: boolean }) {
  return (
    <Card variant={props.variant} className="w-64">
      <CardHeader>瑚琏卡片</CardHeader>
      <CardBody>宗庙玉器，至美又大用。颜值 + 好用是第一生产力。</CardBody>
      {props.withFooter && <CardFooter>footer 区</CardFooter>}
    </Card>
  );
}

export const cardShowcase: ShowcaseSpec = {
  controls: [
    { prop: "variant", type: "select", options: ["outline", "elevated"], defaultValue: "outline" },
    { prop: "withFooter", type: "boolean", defaultValue: true, label: "显示 footer" },
  ],
  states: [
    { name: "outline", render: () => <Demo variant="outline" withFooter /> },
    { name: "elevated", render: () => <Demo variant="elevated" withFooter /> },
    { name: "无 footer", render: () => <Demo variant="outline" withFooter={false} /> },
  ],
  renderWithProps: (p) => (
    <Demo variant={p.variant as "outline" | "elevated"} withFooter={p.withFooter as boolean} />
  ),
  toCode: (p) =>
    `<Card variant="${p.variant}">\n  <CardHeader>瑚琏卡片</CardHeader>\n  <CardBody>...</CardBody>${
      p.withFooter ? "\n  <CardFooter>footer 区</CardFooter>" : ""
    }\n</Card>`,
};
