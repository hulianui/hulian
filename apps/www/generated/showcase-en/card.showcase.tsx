"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Card, CardHeader, CardBody, CardFooter } from "../../../../packages/ui/src/card/card";
type CardVariant = "outline" | "elevated" | "featured" | "plain";
function Demo(props: {
    variant?: CardVariant;
    withFooter?: boolean;
}) {
    return (<Card variant={props.variant} className="w-64">
      <CardHeader>Hulian Card</CardHeader>
      <CardBody>The jades from the ancestral temple are both beautiful and useful. Appearance + ease of use are the primary productivity.</CardBody>
      {props.withFooter && <CardFooter>footer area</CardFooter>}
    </Card>);
}
export const cardShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "outline stroke card, composed of three sections: CardHeader / CardBody / CardFooter.",
            code: `<Card variant="outline" className="w-64">
  <CardHeader>Hulian Card</CardHeader>
  <CardBody> Ancestral temple jade, extremely beautiful and useful. Appearance + ease of use are the primary productivity. </CardBody>
  <CardFooter>footer District</CardFooter>
</Card>`,
            render: () => <Demo variant="outline" withFooter/>,
        },
        {
            title: "Floating Card",
            description: "elevated replaces the solid border with shadow, and the shadow deepens in hover.",
            code: `<Card variant="elevated" className="w-64">
  <CardHeader>Hulian Card</CardHeader>
  <CardBody> Ancestral temple jade, extremely beautiful and useful. Appearance + ease of use are the primary productivity. </CardBody>
  <CardFooter>footer District</CardFooter>
</Card>`,
            render: () => <Demo variant="elevated" withFooter/>,
        },
        {
            title: "Highlight Card",
            description: "featured Use primary double-line stroke to highlight recommended items, aligned within the grid without offset.",
            code: `<Card variant="featured" className="w-64">
  <CardHeader>Hulian Card</CardHeader>
  <CardBody> Ancestral temple jade, extremely beautiful and useful. Appearance + ease of use are the primary productivity. </CardBody>
  <CardFooter>footer District</CardFooter>
</Card>`,
            render: () => <Demo variant="featured" withFooter/>,
        },
        {
            title: "No chrome",
            description: "plain draws no border, background, or shadow, leaving only the corner radius and the slot roles. Use it when an outer container already provides the chrome, otherwise you get a doubled border.",
            code: `{/* The outer container owns the chrome, Card owns the structure */}
<div className="rounded-[var(--radius)] border border-primary/40 bg-primary/5 p-1">
  <Card variant="plain" className="w-64">
    <CardHeader>Hulian Card</CardHeader>
    <CardBody> Ancestral temple jade, extremely beautiful and useful. Appearance + ease of use are the primary productivity. </CardBody>
  </Card>
</div>`,
            render: () => (<div className="rounded-[var(--radius)] border border-primary/40 bg-primary/5 p-1">
          <Demo variant="plain" withFooter={false}/>
        </div>),
        },
        {
            title: "None footer",
            description: "All three sections are optional, only Header + Body is also established.",
            code: `<Card variant="outline" className="w-64">
  <CardHeader>Hulian Card</CardHeader>
  <CardBody> Ancestral temple jade, extremely beautiful and useful. Appearance + ease of use are the primary productivity. </CardBody>
</Card>`,
            render: () => <Demo variant="outline" withFooter={false}/>,
        },
        {
            title: "Remove the section rules",
            description: "divided={false} makes the header and the body read as one block, and tightens the padding the rule used to hold open.",
            code: `<Card divided={false} className="w-64">
  <CardHeader>Pending approvals</CardHeader>
  <CardBody>Three items are waiting for review.</CardBody>
</Card>`,
            render: () => (<div className="flex gap-4">
          <Card className="w-56">
            <CardHeader>With a rule</CardHeader>
            <CardBody>The default: a rule cuts the header away from the body.</CardBody>
          </Card>
          <Card divided={false} className="w-56">
            <CardHeader>Without a rule</CardHeader>
            <CardBody>The header and the body are one block.</CardBody>
          </Card>
        </div>),
        },
    ],
    controls: [
        {
            prop: "variant",
            type: "select",
            options: ["outline", "elevated", "featured", "plain"],
            defaultValue: "outline",
        },
        { prop: "withFooter", type: "boolean", defaultValue: true, label: "Show footer" },
    ],
    states: [
        { name: "outline", render: () => <Demo variant="outline" withFooter/> },
        { name: "elevated", render: () => <Demo variant="elevated" withFooter/> },
        { name: "featured", render: () => <Demo variant="featured" withFooter/> },
        {
            name: "plain (no chrome)",
            render: () => (<div className="rounded-[var(--radius)] border border-primary/40 bg-primary/5 p-1">
          <Demo variant="plain" withFooter={false}/>
        </div>),
        },
        { name: "None footer", render: () => <Demo variant="outline" withFooter={false}/> },
        {
            name: "divided={false} (sections without rules)",
            render: () => (<Card divided={false} className="w-64">
          <CardHeader>Pending approvals</CardHeader>
          <CardBody>The header and the content read as a single block.</CardBody>
          <CardFooter>3 items</CardFooter>
        </Card>),
        },
    ],
    renderWithProps: (p) => (<Demo variant={p.variant as CardVariant} withFooter={p.withFooter as boolean}/>),
    toCode: (p) => `<Card variant="${p.variant}">
  <CardHeader>Hulian Card</CardHeader>
  <CardBody>...</CardBody>${p.withFooter ? "\n  <CardFooter>footer District</CardFooter>" : ""}
</Card>`,
};
