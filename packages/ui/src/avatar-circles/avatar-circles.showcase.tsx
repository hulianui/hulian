"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { AvatarCircles } from "./avatar-circles";

const avatars = [
  { src: "https://i.pravatar.cc/64?img=1", alt: "u1" },
  { src: "https://i.pravatar.cc/64?img=2", alt: "u2" },
  { src: "https://i.pravatar.cc/64?img=3", alt: "u3" },
  { src: "https://i.pravatar.cc/64?img=4", alt: "u4" },
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
