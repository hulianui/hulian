"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Tabs, TabsList, TabsTab, TabsPanel } from "./tabs";
import type { TabsTone } from "./tabs.types";
import { Tag } from "../tag";

function Demo({
  variant,
  size,
  tone,
}: {
  variant: "underline" | "solid";
  size?: "sm" | "md";
  tone?: TabsTone;
}) {
  return (
    <Tabs defaultValue="account" className="w-80">
      <TabsList variant={variant} size={size} tone={tone}>
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
  examples: [
    {
      title: "基础用法",
      description: "TabsList 装 TabsTab，每个 TabsPanel 用 value 与之对应；defaultValue 设初始选中页。",
      code: `<Tabs defaultValue="account" className="w-80">
  <TabsList>
    <TabsTab value="account">账户</TabsTab>
    <TabsTab value="password">密码</TabsTab>
  </TabsList>
  <TabsPanel value="account">管理你的账户资料与偏好设置。</TabsPanel>
  <TabsPanel value="password">在这里修改登录密码。</TabsPanel>
</Tabs>`,
      render: () => (
        <Tabs defaultValue="account" className="w-80">
          <TabsList>
            <TabsTab value="account">账户</TabsTab>
            <TabsTab value="password">密码</TabsTab>
          </TabsList>
          <TabsPanel value="account">管理你的账户资料与偏好设置。</TabsPanel>
          <TabsPanel value="password">在这里修改登录密码。</TabsPanel>
        </Tabs>
      ),
    },
    {
      title: "分段药丸皮肤",
      description: "TabsList 加 variant=\"solid\" 切换为分段药丸轨道，选中态由滑块平滑滑动。",
      code: `<Tabs defaultValue="account" className="w-80">
  <TabsList variant="solid">
    <TabsTab value="account">账户</TabsTab>
    <TabsTab value="password">密码</TabsTab>
    <TabsTab value="team">团队</TabsTab>
  </TabsList>
  <TabsPanel value="account">账户面板。</TabsPanel>
  <TabsPanel value="password">密码面板。</TabsPanel>
  <TabsPanel value="team">团队面板。</TabsPanel>
</Tabs>`,
      render: () => (
        <Tabs defaultValue="account" className="w-80">
          <TabsList variant="solid">
            <TabsTab value="account">账户</TabsTab>
            <TabsTab value="password">密码</TabsTab>
            <TabsTab value="team">团队</TabsTab>
          </TabsList>
          <TabsPanel value="account">账户面板。</TabsPanel>
          <TabsPanel value="password">密码面板。</TabsPanel>
          <TabsPanel value="team">团队面板。</TabsPanel>
        </Tabs>
      ),
    },
    {
      title: "语义色档（tone）",
      description:
        "TabsList 加 tone，选中态就带上语义色：solid 是白药丸配语义文字，underline 的下划线也跟着换。默认 neutral 保持库既有的中性选中态，不传就不变。",
      code: `<Tabs defaultValue="account" className="w-80">
  <TabsList variant="solid" tone="brand">
    <TabsTab value="account">账户</TabsTab>
    <TabsTab value="password">密码</TabsTab>
    <TabsTab value="team">团队</TabsTab>
  </TabsList>
  <TabsPanel value="account">账户面板。</TabsPanel>
  <TabsPanel value="password">密码面板。</TabsPanel>
  <TabsPanel value="team">团队面板。</TabsPanel>
</Tabs>`,
      render: () => (
        <div className="flex flex-col gap-4">
          <Tabs defaultValue="account" className="w-80">
            <TabsList variant="solid" tone="brand">
              <TabsTab value="account">账户</TabsTab>
              <TabsTab value="password">密码</TabsTab>
              <TabsTab value="team">团队</TabsTab>
            </TabsList>
            <TabsPanel value="account">账户面板。</TabsPanel>
            <TabsPanel value="password">密码面板。</TabsPanel>
            <TabsPanel value="team">团队面板。</TabsPanel>
          </Tabs>
          <Tabs defaultValue="account" className="w-80">
            <TabsList tone="brand">
              <TabsTab value="account">账户</TabsTab>
              <TabsTab value="password">密码</TabsTab>
              <TabsTab value="team">团队</TabsTab>
            </TabsList>
            <TabsPanel value="account">账户面板。</TabsPanel>
            <TabsPanel value="password">密码面板。</TabsPanel>
            <TabsPanel value="team">团队面板。</TabsPanel>
          </Tabs>
        </div>
      ),
    },
    {
      title: "行内切换器（size=sm）",
      description:
        "跟标题、搜索框同行时用 sm：纯文字轨道 28px、tab 24px，md 是 40 / 32。计数 Tag 要自己给 size=\"sm\"，否则默认 md 的 24px 会把 tab 顶回去。",
      code: `<div className="flex items-center gap-2">
  <span className="text-sm font-semibold">职称组报表</span>
  <Tabs defaultValue="title">
    <TabsList variant="solid" size="sm">
      <TabsTab value="title">职称订单<Tag size="sm" className="ml-1.5">2</Tag></TabsTab>
      <TabsTab value="paper">论文订单<Tag size="sm" className="ml-1.5">7</Tag></TabsTab>
    </TabsList>
    <TabsPanel value="title">职称订单列表。</TabsPanel>
    <TabsPanel value="paper">论文订单列表。</TabsPanel>
  </Tabs>
</div>`,
      render: () => (
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">职称组报表</span>
          <Tabs defaultValue="title">
            <TabsList variant="solid" size="sm">
              <TabsTab value="title">
                职称订单
                <Tag size="sm" className="ml-1.5">
                  2
                </Tag>
              </TabsTab>
              <TabsTab value="paper">
                论文订单
                <Tag size="sm" className="ml-1.5">
                  7
                </Tag>
              </TabsTab>
            </TabsList>
            <TabsPanel value="title">职称订单列表。</TabsPanel>
            <TabsPanel value="paper">论文订单列表。</TabsPanel>
          </Tabs>
        </div>
      ),
    },
    {
      title: "禁用某一页",
      description: "在 TabsTab 上加 disabled，该页不可点也不可键盘聚焦，其余页正常切换。",
      code: `<Tabs defaultValue="a" className="w-80">
  <TabsList>
    <TabsTab value="a">可用</TabsTab>
    <TabsTab value="b" disabled>禁用</TabsTab>
    <TabsTab value="c">可用</TabsTab>
  </TabsList>
  <TabsPanel value="a">第一个面板。</TabsPanel>
  <TabsPanel value="b">不可达。</TabsPanel>
  <TabsPanel value="c">第三个面板。</TabsPanel>
</Tabs>`,
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
    {
      title: "纵向排布",
      description: "Tabs 加 orientation=\"vertical\"，tab 条竖排，方向键上下切换。",
      code: `<Tabs defaultValue="general" orientation="vertical" className="flex w-96 gap-4">
  <TabsList className="flex-col items-stretch border-b-0 border-r border-border">
    <TabsTab value="general">通用</TabsTab>
    <TabsTab value="security">安全</TabsTab>
    <TabsTab value="billing">账单</TabsTab>
  </TabsList>
  <div className="flex-1">
    <TabsPanel value="general">通用设置。</TabsPanel>
    <TabsPanel value="security">安全设置。</TabsPanel>
    <TabsPanel value="billing">账单设置。</TabsPanel>
  </div>
</Tabs>`,
      render: () => (
        <Tabs defaultValue="general" orientation="vertical" className="flex w-96 gap-4">
          <TabsList className="flex-col items-stretch border-b-0 border-r border-border">
            <TabsTab value="general">通用</TabsTab>
            <TabsTab value="security">安全</TabsTab>
            <TabsTab value="billing">账单</TabsTab>
          </TabsList>
          <div className="flex-1">
            <TabsPanel value="general">通用设置。</TabsPanel>
            <TabsPanel value="security">安全设置。</TabsPanel>
            <TabsPanel value="billing">账单设置。</TabsPanel>
          </div>
        </Tabs>
      ),
    },
  ],
  controls: [
    {
      prop: "variant",
      type: "select",
      options: ["underline", "solid"],
      defaultValue: "underline",
      label: "皮肤",
    },
    {
      prop: "size",
      type: "select",
      options: ["sm", "md"],
      defaultValue: "md",
      label: "尺寸",
    },
    {
      prop: "tone",
      type: "select",
      options: ["neutral", "brand", "success", "warning", "danger"],
      defaultValue: "neutral",
      label: "语义档",
    },
  ],
  states: [
    { name: "underline", render: () => <Demo variant="underline" /> },
    { name: "solid", render: () => <Demo variant="solid" /> },
    { name: "solid · size=sm", render: () => <Demo variant="solid" size="sm" /> },
    { name: "solid · tone=brand", render: () => <Demo variant="solid" tone="brand" /> },
    { name: "underline · tone=danger", render: () => <Demo variant="underline" tone="danger" /> },
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
  renderWithProps: (p) => (
    <Demo
      variant={(p.variant as "underline" | "solid") ?? "underline"}
      size={(p.size as "sm" | "md") ?? "md"}
      tone={(p.tone as TabsTone) ?? "neutral"}
    />
  ),
  toCode: (p) =>
    `<Tabs defaultValue="account">\n  <TabsList variant="${p.variant ?? "underline"}" size="${p.size ?? "md"}"${
      p.tone && p.tone !== "neutral" ? ` tone="${p.tone}"` : ""
    }>\n    <TabsTab value="account">账户</TabsTab>\n    <TabsTab value="password">密码</TabsTab>\n  </TabsList>\n  <TabsPanel value="account">…</TabsPanel>\n  <TabsPanel value="password">…</TabsPanel>\n</Tabs>`,
};
