"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { User } from "./user";
import { demoAsset } from "../lib/demo-asset";

const AVATAR = demoAsset("/demo/avatar-12.jpg");

export const userShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "头像 + 名称 + 次级描述（邮箱/角色/@handle）。",
      code: `<User
  name="瑚琏"
  description="zhangzhiwei@hulian.dev"
  avatarProps={{ src: "/avatar.png", alt: "瑚琏" }}
/>`,
      render: () => (
        <User
          name="瑚琏"
          description="zhangzhiwei@hulian.dev"
          avatarProps={{ src: AVATAR, alt: "瑚琏" }}
        />
      ),
    },
    {
      title: "首字母兜底",
      description: "无头像图时用 fallback 渲染首字母占位。",
      code: `<User name="李四" description="产品经理" avatarProps={{ fallback: "李" }} />`,
      render: () => (
        <User name="李四" description="产品经理" avatarProps={{ fallback: "李" }} />
      ),
    },
    {
      title: "仅名称",
      description: "省略 description 时只渲染单行名称。",
      code: `<User name="无描述用户" avatarProps={{ fallback: "U" }} />`,
      render: () => <User name="无描述用户" avatarProps={{ fallback: "U" }} />,
    },
    {
      title: "头像尺寸",
      description: "通过 avatarProps.size 调整头像大小。",
      code: `<>
  <User name="小号" description="size=sm" avatarProps={{ fallback: "S", size: "sm" }} />
  <User name="大号" description="size=lg" avatarProps={{ fallback: "L", size: "lg" }} />
</>`,
      render: () => (
        <div className="flex flex-col gap-4">
          <User name="小号" description="size=sm" avatarProps={{ fallback: "S", size: "sm" }} />
          <User name="大号" description="size=lg" avatarProps={{ fallback: "L", size: "lg" }} />
        </div>
      ),
    },
  ],
  controls: [],
  states: [
    {
      name: "with-avatar",
      render: () => (
        <User
          name="瑚琏"
          description="zhangzhiwei@hulian.dev"
          avatarProps={{ src: AVATAR, alt: "瑚琏" }}
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
      avatarProps={{ src: AVATAR, alt: "瑚琏" }}
    />
  ),
  toCode: () =>
    `<User\n  name="瑚琏"\n  description="组件库设计系统"\n  avatarProps={{ src: "/avatar.png", alt: "瑚琏" }}\n/>`,
};
