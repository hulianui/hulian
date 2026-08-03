"use client";
import { Home, Search, Bell, Settings, User } from "lucide-react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Dock, DockIcon } from "../../../../packages/ui/src/dock/dock";
function Demo() {
    return (<Dock>
      <DockIcon><Home className="size-5"/></DockIcon>
      <DockIcon><Search className="size-5"/></DockIcon>
      <DockIcon><Bell className="size-5"/></DockIcon>
      <DockIcon><Settings className="size-5"/></DockIcon>
      <DockIcon><User className="size-5"/></DockIcon>
    </Dock>);
}
export const dockShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "DockIcon package icon, when the mouse is close to it, the icon will be enlarged according to the horizontal distance (macOS magnification dock effect).",
            code: `<Dock>
  <DockIcon><Home className="size-5" /></DockIcon>
  <DockIcon><Search className="size-5" /></DockIcon>
  <DockIcon><Bell className="size-5" /></DockIcon>
  <DockIcon><Settings className="size-5" /></DockIcon>
  <DockIcon><User className="size-5" /></DockIcon>
</Dock>`,
            render: () => <Demo />,
        },
        {
            title: "Stronger amplification",
            description: "magnification increases the peak size and distance increases the range of influence to obtain a more exaggerated amplification effect.",
            code: `<Dock magnification={84} distance={160}>
  <DockIcon><Home className="size-5" /></DockIcon>
  <DockIcon><Search className="size-5" /></DockIcon>
  <DockIcon><Bell className="size-5" /></DockIcon>
</Dock>`,
            render: () => (<Dock magnification={84} distance={160}>
          <DockIcon><Home className="size-5"/></DockIcon>
          <DockIcon><Search className="size-5"/></DockIcon>
          <DockIcon><Bell className="size-5"/></DockIcon>
        </Dock>),
        },
        {
            title: "Custom resting size",
            description: "iconSize Sets the base size when not hovering, adapting to more compact or looser docks.",
            code: `<Dock iconSize={32}>
  <DockIcon><Home className="size-4" /></DockIcon>
  <DockIcon><Search className="size-4" /></DockIcon>
  <DockIcon><Settings className="size-4" /></DockIcon>
</Dock>`,
            render: () => (<Dock iconSize={32}>
          <DockIcon><Home className="size-4"/></DockIcon>
          <DockIcon><Search className="size-4"/></DockIcon>
          <DockIcon><Settings className="size-4"/></DockIcon>
        </Dock>),
        },
    ],
    controls: [],
    states: [{ name: "default", render: () => <Demo /> }],
    renderWithProps: () => <Demo />,
    toCode: () => `<Dock>
  <DockIcon><Home /></DockIcon>
  <DockIcon><Search /></DockIcon>
</Dock>`,
};
