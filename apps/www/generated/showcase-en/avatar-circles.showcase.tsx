"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { AvatarCircles } from "../../../../packages/ui/src/avatar-circles/avatar-circles";
const avatars = [
    { src: "/demo/avatar-1.jpg", alt: "u1" },
    { src: "/demo/avatar-2.jpg", alt: "u2" },
    { src: "/demo/avatar-3.jpg", alt: "u3" },
    { src: "/demo/avatar-4.jpg", alt: "u4" },
];
export const avatarCirclesShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "avatars are stacked in order (the latter over the former) to form an overlapping avatar group.",
            code: `const avatars = [
  { src: "/demo/avatar-1.jpg", alt: "u1" },
  { src: "/demo/avatar-2.jpg", alt: "u2" },
  { src: "/demo/avatar-3.jpg", alt: "u3" },
  { src: "/demo/avatar-4.jpg", alt: "u4" },
];

<AvatarCircles avatars={avatars} />`,
            render: () => <AvatarCircles avatars={avatars}/>,
        },
        {
            title: "Extra Count",
            description: "extraCount Add a \"+N\" circle at the end to indicate the number of people overflowing.",
            code: `<AvatarCircles avatars={avatars} extraCount={9} />`,
            render: () => <AvatarCircles avatars={avatars} extraCount={9}/>,
        },
        {
            title: "Dimensions",
            description: "size Control circle diameter and overlap spacing: sm / md / lg.",
            code: `<>
  <AvatarCircles avatars={avatars} extraCount={9} size="sm" />
  <AvatarCircles avatars={avatars} extraCount={9} size="md" />
  <AvatarCircles avatars={avatars} extraCount={9} size="lg" />
</>`,
            render: () => (<div className="flex flex-col items-start gap-3">
          <AvatarCircles avatars={avatars} extraCount={9} size="sm"/>
          <AvatarCircles avatars={avatars} extraCount={9} size="md"/>
          <AvatarCircles avatars={avatars} extraCount={9} size="lg"/>
        </div>),
        },
    ],
    controls: [{ prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" }],
    states: [
        { name: "with-count", render: () => <AvatarCircles avatars={avatars} extraCount={9}/> },
        { name: "no-count", render: () => <AvatarCircles avatars={avatars}/> },
        { name: "lg", render: () => <AvatarCircles avatars={avatars} extraCount={20} size="lg"/> },
    ],
    renderWithProps: (p) => (<AvatarCircles avatars={avatars} extraCount={9} size={(p.size as "sm" | "md" | "lg") ?? "md"}/>),
    toCode: (p) => `<AvatarCircles avatars={avatars} extraCount={9} size="${(p.size as string) ?? "md"}" />`,
};
