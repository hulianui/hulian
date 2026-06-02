"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Tabs, TabsList, TabsTab, TabsPanel } from "./tabs";

function Demo({ variant }: { variant: "underline" | "solid" }) {
  return (
    <Tabs defaultValue="account" className="w-80">
      <TabsList variant={variant}>
        <TabsTab value="account">账户</TabsTab>
        <TabsTab value="password">密码</TabsTab>
        <TabsTab value="team" disabled>
          团队
        </TabsTab>
      </TabsList>
      <TabsPanel value="account">管理你的账户资料与偏好设置。</TabsPanel>
      <TabsPanel value="password">在这里修改登录密码。</TabsPanel>
      <TabsPanel value="team">邀请成员、分配角色。</TabsPanel>
    </Tabs>
  );
}

export const tabsShowcase: ShowcaseSpec = {
  controls: [
    {
      prop: "variant",
      type: "select",
      options: ["underline", "solid"],
      defaultValue: "underline",
      label: "皮肤",
    },
  ],
  states: [
    { name: "underline", render: () => <Demo variant="underline" /> },
    { name: "solid", render: () => <Demo variant="solid" /> },
    {
      name: "disabled tab",
      render: () => (
        <Tabs defaultValue="a" className="w-80">
          <TabsList>
            <TabsTab value="a">可用</TabsTab>
            <TabsTab value="b" disabled>
              禁用
            </TabsTab>
            <TabsTab value="c">可用</TabsTab>
          </TabsList>
          <TabsPanel value="a">第一个面板。</TabsPanel>
          <TabsPanel value="b">不可达。</TabsPanel>
          <TabsPanel value="c">第三个面板。</TabsPanel>
        </Tabs>
      ),
    },
  ],
  renderWithProps: (p) => <Demo variant={(p.variant as "underline" | "solid") ?? "underline"} />,
  toCode: (p) =>
    `<Tabs defaultValue="account">\n  <TabsList variant="${p.variant ?? "underline"}">\n    <TabsTab value="account">账户</TabsTab>\n    <TabsTab value="password">密码</TabsTab>\n  </TabsList>\n  <TabsPanel value="account">…</TabsPanel>\n  <TabsPanel value="password">…</TabsPanel>\n</Tabs>`,
};
