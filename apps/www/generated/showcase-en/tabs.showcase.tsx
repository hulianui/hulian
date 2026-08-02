"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Tabs, TabsList, TabsTab, TabsPanel } from "../../../../packages/ui/src/tabs/tabs";
function Demo({ variant }: {
    variant: "underline" | "solid";
}) {
    return (<Tabs defaultValue="account" className="w-80">
      <TabsList variant={variant}>
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
            description: "TabsList is installed with TabsTab, and each TabsPanel is corresponding with value; defaultValue sets the initial selection page.",
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
  <TabsPanel value="account">Account Panel. </TabsPanel>
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
    <TabsPanel value="billing">Billing settings. </TabsPanel>
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
    ],
    states: [
        { name: "underline", render: () => <Demo variant="underline"/> },
        { name: "solid", render: () => <Demo variant="solid"/> },
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
    renderWithProps: (p) => <Demo variant={(p.variant as "underline" | "solid") ?? "underline"}/>,
    toCode: (p) => `<Tabs defaultValue="account">
  <TabsList variant="${p.variant ?? "underline"}">
    <TabsTab value="account">Account</TabsTab>
    <TabsTab value="password">Password</TabsTab>
  </TabsList>
  <TabsPanel value="account">\u2026</TabsPanel>
  <TabsPanel value="password">\u2026</TabsPanel>
</Tabs>`,
};
