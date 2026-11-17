"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Card, CardBody } from "../../../../packages/ui/src/card";
import { Avatar } from "../../../../packages/ui/src/avatar/avatar";
import { demoAsset } from "../../../../packages/ui/src/lib/demo-asset";
const IMG = demoAsset("/demo/avatar-12.jpg");
export const avatarShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Picture with fallback",
            description: "src Displays the image if loading is successful; falls back to fallback (initial letter/text) if failed or omitted.",
            code: `<>
  <Avatar src="/demo/avatar-12.jpg" alt="demo" fallback="ZS" />
  <Avatar fallback="Hu" />
</>`,
            render: () => (<div className="flex items-center gap-3">
          <Avatar src={IMG} alt="demo" fallback="ZS"/>
          <Avatar fallback="Hu"/>
        </div>),
        },
        {
            title: "Size",
            description: "size provides sm / md / lg / xl / 2xl in five diameters.",
            code: `<>
  <Avatar size="sm" fallback="S" />
  <Avatar size="md" fallback="M" />
  <Avatar size="lg" fallback="L" />
  <Avatar size="xl" fallback="XL" />
  <Avatar size="2xl" fallback="2X" />
</>`,
            render: () => (<div className="flex items-center gap-3">
          <Avatar size="sm" fallback="S"/>
          <Avatar size="md" fallback="M"/>
          <Avatar size="lg" fallback="L"/>
          <Avatar size="xl" fallback="XL"/>
          <Avatar size="2xl" fallback="2X"/>
        </div>),
        },
        {
            title: "Accent and ring",
            description: "tone=\"brand\" uses the accent's subtle background with accent text; ring adds a 2px outer ring whose color follows tone, and inside a primary card the neutral ring turns translucent white automatically.",
            code: `<Avatar tone="brand" ring fallback="Lin" />
<Card variant="primary">
  <Avatar ring src="/demo/avatar-12.jpg" alt="Abel" fallback="A" />
</Card>`,
            render: () => (<div className="flex items-center gap-4">
          <Avatar tone="brand" fallback="Lin"/>
          <Avatar tone="brand" ring fallback="Lin"/>
          <Card variant="primary">
            <CardBody>
              <Avatar ring src={IMG} alt="Abel" fallback="A"/>
            </CardBody>
          </Card>
        </div>),
        },
    ],
    controls: [
        { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
        { prop: "src", type: "text", defaultValue: IMG, label: "Picture URL" },
        { prop: "fallback", type: "text", defaultValue: "ZS", label: "fallback" },
    ],
    states: [
        { name: "Pictures", render: () => <Avatar src={IMG} alt="demo" fallback="ZS"/> },
        { name: "fallback", render: () => <Avatar fallback="Hu"/> },
        { name: "sm", render: () => <Avatar size="sm" fallback="S"/> },
        { name: "lg", render: () => <Avatar size="lg" fallback="L"/> },
    ],
    renderWithProps: (p) => (<Avatar size={p.size as "sm" | "md" | "lg"} src={(p.src as string) || undefined} alt="demo" fallback={p.fallback as string}/>),
    toCode: (p) => `<Avatar size="${p.size}" src="${p.src}" fallback="${p.fallback}" />`,
};
