"use client";
import { Home, Search, Bell, Settings, User } from "lucide-react";
import type { ShowcaseSpec } from "../showcase/types";
import { Dock, DockIcon } from "./dock";

function Demo() {
  return (
    <Dock>
      <DockIcon><Home className="size-5" /></DockIcon>
      <DockIcon><Search className="size-5" /></DockIcon>
      <DockIcon><Bell className="size-5" /></DockIcon>
      <DockIcon><Settings className="size-5" /></DockIcon>
      <DockIcon><User className="size-5" /></DockIcon>
    </Dock>
  );
}

export const dockShowcase: ShowcaseSpec = {
  controls: [],
  states: [{ name: "default", render: () => <Demo /> }],
  renderWithProps: () => <Demo />,
  toCode: () =>
    `<Dock>\n  <DockIcon><Home /></DockIcon>\n  <DockIcon><Search /></DockIcon>\n</Dock>`,
};
