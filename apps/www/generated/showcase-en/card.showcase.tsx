"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Card, CardHeader, CardBody, CardFooter } from "../../../../packages/ui/src/card/card";
type CardVariant = "outline" | "elevated" | "featured";
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
            title: "None footer",
            description: "All three sections are optional, only Header + Body is also established.",
            code: `<Card variant="outline" className="w-64">
  <CardHeader>Hulian Card</CardHeader>
  <CardBody> Ancestral temple jade, extremely beautiful and useful. Appearance + ease of use are the primary productivity. </CardBody>
</Card>`,
            render: () => <Demo variant="outline" withFooter={false}/>,
        },
    ],
    controls: [
        { prop: "variant", type: "select", options: ["outline", "elevated", "featured"], defaultValue: "outline" },
        { prop: "withFooter", type: "boolean", defaultValue: true, label: "Show footer" },
    ],
    states: [
        { name: "outline", render: () => <Demo variant="outline" withFooter/> },
        { name: "elevated", render: () => <Demo variant="elevated" withFooter/> },
        { name: "featured", render: () => <Demo variant="featured" withFooter/> },
        { name: "None footer", render: () => <Demo variant="outline" withFooter={false}/> },
    ],
    renderWithProps: (p) => (<Demo variant={p.variant as CardVariant} withFooter={p.withFooter as boolean}/>),
    toCode: (p) => `<Card variant="${p.variant}">
  <CardHeader>Hulian Card</CardHeader>
  <CardBody>...</CardBody>${p.withFooter ? "\n  <CardFooter>footer District</CardFooter>" : ""}
</Card>`,
};
