"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Tabs, TabsList, TabsTab, TabsPanel } from "../../../../packages/ui/src/tabs/tabs";
import type { TabsTone } from "../../../../packages/ui/src/tabs/tabs.types";
import { Tag } from "../../../../packages/ui/src/tag";
function Demo({ variant, size, tone, }: {
    variant: "underline" | "solid";
    size?: "sm" | "md";
    tone?: TabsTone;
}) {
    return (<Tabs defaultValue="account" className="w-80">
      <TabsList variant={variant} size={size} tone={tone}>
        <TabsTab value="account">Account</TabsTab>
        <TabsTab value="password">Password</TabsTab>
        <TabsTab value="team" disabled>
          Team
        </TabsTab>
      </TabsList>
      <TabsPanel value="account">Manage your account information and preferences.</TabsPanel>
      <TabsPanel value="password">Change the login password here.</TabsPanel>
      <TabsPanel value="team">Invite members and assign roles.</TabsPanel>
    </Tabs>);
}
export const tabsShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "TabsList installs TabsTab, and each TabsPanel corresponds to value; defaultValue sets the initial selection page.",
            code: `<Tabs defaultValue="account" className="w-80">
  <TabsList>
    <TabsTab value="account">Account</TabsTab>
    <TabsTab value="password">Password</TabsTab>
  </TabsList>
  <TabsPanel value="account">Manage your account information and preferences. </TabsPanel>
  <TabsPanel value="password">Change the login password here. </TabsPanel>
</Tabs>`,
            render: () => (<Tabs defaultValue="account" className="w-80">
          <TabsList>
            <TabsTab value="account">Account</TabsTab>
            <TabsTab value="password">Password</TabsTab>
          </TabsList>
          <TabsPanel value="account">Manage your account information and preferences.</TabsPanel>
          <TabsPanel value="password">Change the login password here.</TabsPanel>
        </Tabs>),
        },
        {
            title: "Segmented Pill Skin",
            description: "TabsList Add variant=\"solid\" to switch to segmented pill track, and the selected state will slide smoothly by the slider.",
            code: `<Tabs defaultValue="account" className="w-80">
  <TabsList variant="solid">
    <TabsTab value="account">Account</TabsTab>
    <TabsTab value="password">Password</TabsTab>
    <TabsTab value="team">Team</TabsTab>
  </TabsList>
  <TabsPanel value="account">Account panel. </TabsPanel>
  <TabsPanel value="password">Password panel. </TabsPanel>
  <TabsPanel value="team">Team Panel. </TabsPanel>
</Tabs>`,
            render: () => (<Tabs defaultValue="account" className="w-80">
          <TabsList variant="solid">
            <TabsTab value="account">Account</TabsTab>
            <TabsTab value="password">Password</TabsTab>
            <TabsTab value="team">Team</TabsTab>
          </TabsList>
          <TabsPanel value="account">Account Panel.</TabsPanel>
          <TabsPanel value="password">Password panel.</TabsPanel>
          <TabsPanel value="team">Team Panel.</TabsPanel>
        </Tabs>),
        },
        {
            title: "Semantic tone",
            description: "Adding tone to TabsList gives the selected state a semantic colour: solid keeps a white pill with a semantic label, and the underline indicator follows along. The neutral default keeps the existing neutral selected state, so passing nothing changes nothing.",
            code: `<Tabs defaultValue="account" className="w-80">
  <TabsList variant="solid" tone="brand">
    <TabsTab value="account">Account</TabsTab>
    <TabsTab value="password">Password</TabsTab>
    <TabsTab value="team">Team</TabsTab>
  </TabsList>
  <TabsPanel value="account">Account panel. </TabsPanel>
  <TabsPanel value="password">Password panel. </TabsPanel>
  <TabsPanel value="team">Team Panel. </TabsPanel>
</Tabs>`,
            render: () => (<div className="flex flex-col gap-4">
          <Tabs defaultValue="account" className="w-80">
            <TabsList variant="solid" tone="brand">
              <TabsTab value="account">Account</TabsTab>
              <TabsTab value="password">Password</TabsTab>
              <TabsTab value="team">Team</TabsTab>
            </TabsList>
            <TabsPanel value="account">Account Panel.</TabsPanel>
            <TabsPanel value="password">Password panel.</TabsPanel>
            <TabsPanel value="team">Team Panel.</TabsPanel>
          </Tabs>
          <Tabs defaultValue="account" className="w-80">
            <TabsList tone="brand">
              <TabsTab value="account">Account</TabsTab>
              <TabsTab value="password">Password</TabsTab>
              <TabsTab value="team">Team</TabsTab>
            </TabsList>
            <TabsPanel value="account">Account Panel.</TabsPanel>
            <TabsPanel value="password">Password panel.</TabsPanel>
            <TabsPanel value="team">Team Panel.</TabsPanel>
          </Tabs>
        </div>),
        },
        {
            title: "Inline switcher (size=sm)",
            description: "Use sm when the tab bar shares a row with a heading or a search box: 28px track and 24px tab for text only, against 40 / 32 for md. Give the count Tag its own size=\"sm\" as well, or the default md at 24px pushes the tab back up.",
            code: `<div className="flex items-center gap-2">
  <span className="text-sm font-semibold">Reports by title group</span>
  <Tabs defaultValue="title">
    <TabsList variant="solid" size="sm">
      <TabsTab value="title">Title orders<Tag size="sm" className="ml-1.5">2</Tag></TabsTab>
      <TabsTab value="paper">Paper orders<Tag size="sm" className="ml-1.5">7</Tag></TabsTab>
    </TabsList>
    <TabsPanel value="title">Title order list.</TabsPanel>
    <TabsPanel value="paper">Paper order list.</TabsPanel>
  </Tabs>
</div>`,
            render: () => (<div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Reports by title group</span>
          <Tabs defaultValue="title">
            <TabsList variant="solid" size="sm">
              <TabsTab value="title">
                Title orders
                <Tag size="sm" className="ml-1.5">
                  2
                </Tag>
              </TabsTab>
              <TabsTab value="paper">
                Paper orders
                <Tag size="sm" className="ml-1.5">
                  7
                </Tag>
              </TabsTab>
            </TabsList>
            <TabsPanel value="title">Title order list.</TabsPanel>
            <TabsPanel value="paper">Paper order list.</TabsPanel>
          </Tabs>
        </div>),
        },
        {
            title: "Disable a page",
            description: "Add disabled to TabsTab. This page cannot be clicked or keyboard focused, and other pages can be switched normally.",
            code: `<Tabs defaultValue="a" className="w-80">
  <TabsList>
    <TabsTab value="a">Available</TabsTab>
    <TabsTab value="b" disabled>Disable</TabsTab>
    <TabsTab value="c">Available</TabsTab>
  </TabsList>
  <TabsPanel value="a">First panel. </TabsPanel>
  <TabsPanel value="b">Unreachable. </TabsPanel>
  <TabsPanel value="c">Third panel. </TabsPanel>
</Tabs>`,
            render: () => (<Tabs defaultValue="a" className="w-80">
          <TabsList>
            <TabsTab value="a">Available</TabsTab>
            <TabsTab value="b" disabled>
              Disabled
            </TabsTab>
            <TabsTab value="c">Available</TabsTab>
          </TabsList>
          <TabsPanel value="a">First panel.</TabsPanel>
          <TabsPanel value="b">Not reachable.</TabsPanel>
          <TabsPanel value="c">Third panel.</TabsPanel>
        </Tabs>),
        },
        {
            title: "Vertical arrangement",
            description: "Tabs Add orientation=\"vertical\", tab lines are arranged vertically, and the direction keys switch up and down.",
            code: `<Tabs defaultValue="general" orientation="vertical" className="flex w-96 gap-4">
  <TabsList className="flex-col items-stretch border-b-0 border-r border-border">
    <TabsTab value="general">General</TabsTab>
    <TabsTab value="security">Safety</TabsTab>
    <TabsTab value="billing">Bill</TabsTab>
  </TabsList>
  <div className="flex-1">
    <TabsPanel value="general">General settings. </TabsPanel>
    <TabsPanel value="security">Security settings. </TabsPanel>
    <TabsPanel value="billing">Bill settings. </TabsPanel>
  </div>
</Tabs>`,
            render: () => (<Tabs defaultValue="general" orientation="vertical" className="flex w-96 gap-4">
          <TabsList className="flex-col items-stretch border-b-0 border-r border-border">
            <TabsTab value="general">General</TabsTab>
            <TabsTab value="security">Security</TabsTab>
            <TabsTab value="billing">Bill</TabsTab>
          </TabsList>
          <div className="flex-1">
            <TabsPanel value="general">General settings.</TabsPanel>
            <TabsPanel value="security">Security settings.</TabsPanel>
            <TabsPanel value="billing">Billing settings.</TabsPanel>
          </div>
        </Tabs>),
        },
    ],
    controls: [
        {
            prop: "variant",
            type: "select",
            options: ["underline", "solid"],
            defaultValue: "underline",
            label: "Skin",
        },
        {
            prop: "size",
            type: "select",
            options: ["sm", "md"],
            defaultValue: "md",
            label: "Size",
        },
        {
            prop: "tone",
            type: "select",
            options: ["neutral", "brand", "success", "warning", "danger"],
            defaultValue: "neutral",
            label: "Semantic tones",
        },
    ],
    states: [
        { name: "underline", render: () => <Demo variant="underline"/> },
        { name: "solid", render: () => <Demo variant="solid"/> },
        { name: "solid \u00B7 size=sm", render: () => <Demo variant="solid" size="sm"/> },
        { name: "solid \u00B7 tone=brand", render: () => <Demo variant="solid" tone="brand"/> },
        { name: "underline \u00B7 tone=danger", render: () => <Demo variant="underline" tone="danger"/> },
        {
            name: "disabled tab",
            render: () => (<Tabs defaultValue="a" className="w-80">
          <TabsList>
            <TabsTab value="a">Available</TabsTab>
            <TabsTab value="b" disabled>
              Disabled
            </TabsTab>
            <TabsTab value="c">Available</TabsTab>
          </TabsList>
          <TabsPanel value="a">First panel.</TabsPanel>
          <TabsPanel value="b">Not reachable.</TabsPanel>
          <TabsPanel value="c">Third panel.</TabsPanel>
        </Tabs>),
        },
    ],
    renderWithProps: (p) => (<Demo variant={(p.variant as "underline" | "solid") ?? "underline"} size={(p.size as "sm" | "md") ?? "md"} tone={(p.tone as TabsTone) ?? "neutral"}/>),
    toCode: (p) => `<Tabs defaultValue="account">
  <TabsList variant="${p.variant ?? "underline"}" size="${p.size ?? "md"}"${p.tone && p.tone !== "neutral" ? ` tone="${p.tone}"` : ""}>
    <TabsTab value="account">Account</TabsTab>
    <TabsTab value="password">Password</TabsTab>
  </TabsList>
  <TabsPanel value="account">\u2026</TabsPanel>
  <TabsPanel value="password">\u2026</TabsPanel>
</Tabs>`,
};
