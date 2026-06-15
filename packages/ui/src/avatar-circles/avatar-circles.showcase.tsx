"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { AvatarCircles } from "./avatar-circles";

const avatars = [
  { src: "/demo/avatar-1.jpg", alt: "u1" },
  { src: "/demo/avatar-2.jpg", alt: "u2" },
  { src: "/demo/avatar-3.jpg", alt: "u3" },
  { src: "/demo/avatar-4.jpg", alt: "u4" },
];

export const avatarCirclesShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "avatars 按序堆叠（后者压前者），形成重叠头像组。",
      code: `const avatars = [
  { src: "/demo/avatar-1.jpg", alt: "u1" },
  { src: "/demo/avatar-2.jpg", alt: "u2" },
  { src: "/demo/avatar-3.jpg", alt: "u3" },
  { src: "/demo/avatar-4.jpg", alt: "u4" },
];

<AvatarCircles avatars={avatars} />`,
      render: () => <AvatarCircles avatars={avatars} />,
    },
    {
      title: "额外计数",
      description: "extraCount 在末尾追加 “+N” 圆，表示溢出人数。",
      code: `<AvatarCircles avatars={avatars} extraCount={9} />`,
      render: () => <AvatarCircles avatars={avatars} extraCount={9} />,
    },
    {
      title: "尺寸",
      description: "size 控制圆直径与重叠间距：sm / md / lg。",
      code: `<>
  <AvatarCircles avatars={avatars} extraCount={9} size="sm" />
  <AvatarCircles avatars={avatars} extraCount={9} size="md" />
  <AvatarCircles avatars={avatars} extraCount={9} size="lg" />
</>`,
      render: () => (
        <div className="flex flex-col items-start gap-3">
          <AvatarCircles avatars={avatars} extraCount={9} size="sm" />
          <AvatarCircles avatars={avatars} extraCount={9} size="md" />
          <AvatarCircles avatars={avatars} extraCount={9} size="lg" />
        </div>
      ),
    },
  ],
  controls: [{ prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" }],
  states: [
    { name: "with-count", render: () => <AvatarCircles avatars={avatars} extraCount={9} /> },
    { name: "no-count", render: () => <AvatarCircles avatars={avatars} /> },
    { name: "lg", render: () => <AvatarCircles avatars={avatars} extraCount={20} size="lg" /> },
  ],
  renderWithProps: (p) => (
    <AvatarCircles avatars={avatars} extraCount={9} size={(p.size as "sm" | "md" | "lg") ?? "md"} />
  ),
  toCode: (p) => `<AvatarCircles avatars={avatars} extraCount={9} size="${(p.size as string) ?? "md"}" />`,
};
