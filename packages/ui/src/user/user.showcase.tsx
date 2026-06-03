"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { User } from "./user";

export const userShowcase: ShowcaseSpec = {
  controls: [],
  states: [
    {
      name: "with-avatar",
      render: () => (
        <User
          name="瑚琏"
          description="zhangzhiwei@hulian.dev"
          avatarProps={{ src: "/demo/avatar-12.jpg", alt: "瑚琏" }}
        />
      ),
    },
    {
      name: "fallback-initials",
      render: () => <User name="李四" description="产品经理" avatarProps={{ fallback: "李" }} />,
    },
    {
      name: "name-only",
      render: () => <User name="无描述用户" avatarProps={{ fallback: "U" }} />,
    },
  ],
  renderWithProps: () => (
    <User
      name="瑚琏"
      description="组件库设计系统"
      avatarProps={{ src: "/demo/avatar-12.jpg", alt: "瑚琏" }}
    />
  ),
  toCode: () =>
    `<User\n  name="瑚琏"\n  description="组件库设计系统"\n  avatarProps={{ src: "/avatar.png", alt: "瑚琏" }}\n/>`,
};
