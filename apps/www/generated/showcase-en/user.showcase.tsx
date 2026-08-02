"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { User } from "../../../../packages/ui/src/user/user";
export const userShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Avatar + name + secondary description (email/role/@handle).",
            code: `<User
  name="Hulian"
  description="zhangzhiwei@hulian.dev"
  avatarProps={{ src: "/avatar.png", alt: "Hulian" }}
/>`,
            render: () => (<User name="Hulian" description="zhangzhiwei@hulian.dev" avatarProps={{ src: "/demo/avatar-12.jpg", alt: "Hulian" }}/>),
        },
        {
            title: "Initials",
            description: "Use fallback to render the initial placeholder when there is no avatar image.",
            code: `<User name="Li Si" description="Product Manager" avatarProps={{ fallback: "Li" }} />`,
            render: () => (<User name="John Doe" description="Product Manager" avatarProps={{ fallback: "Li" }}/>),
        },
        {
            title: "Name only",
            description: "Only single line names are rendered when description is omitted.",
            code: `<User name="User without description" avatarProps={{ fallback: "U" }} />`,
            render: () => <User name="No user description" avatarProps={{ fallback: "U" }}/>,
        },
        {
            title: "Avatar size",
            description: "Adjust avatar size via avatarProps.size.",
            code: `<>
  <User name="small" description="size=sm" avatarProps={{ fallback: "S", size: "sm" }} />
  <User name="Large" description="size=lg" avatarProps={{ fallback: "L", size: "lg" }} />
</>`,
            render: () => (<div className="flex flex-col gap-4">
          <User name="Small" description="size=sm" avatarProps={{ fallback: "S", size: "sm" }}/>
          <User name="Large size" description="size=lg" avatarProps={{ fallback: "L", size: "lg" }}/>
        </div>),
        },
    ],
    controls: [],
    states: [
        {
            name: "with-avatar",
            render: () => (<User name="Hulian" description="zhangzhiwei@hulian.dev" avatarProps={{ src: "/demo/avatar-12.jpg", alt: "Hulian" }}/>),
        },
        {
            name: "fallback-initials",
            render: () => <User name="John Doe" description="Product Manager" avatarProps={{ fallback: "Li" }}/>,
        },
        {
            name: "name-only",
            render: () => <User name="No user description" avatarProps={{ fallback: "U" }}/>,
        },
    ],
    renderWithProps: () => (<User name="Hulian" description="Component library design system" avatarProps={{ src: "/demo/avatar-12.jpg", alt: "Hulian" }}/>),
    toCode: () => `<User
  name="Hulian"
  description="Component library design system"
  avatarProps={{ src: "/avatar.png", alt: "Hulian" }}
/>`,
};
