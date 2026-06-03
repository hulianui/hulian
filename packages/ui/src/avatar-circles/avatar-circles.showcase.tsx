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
