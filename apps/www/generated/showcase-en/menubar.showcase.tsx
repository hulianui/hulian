"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator, MenubarGroupLabel, } from "../../../../packages/ui/src/menubar/menubar";
type Orientation = "horizontal" | "vertical";
function Demo({ orientation = "horizontal" as Orientation }: {
    orientation?: Orientation;
}) {
    return (<Menubar orientation={orientation}>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New window</MenubarItem>
          <MenubarItem>Open...</MenubarItem>
          <MenubarSeparator />
          <MenubarItem variant="danger">Exit</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Withdrawal</MenubarItem>
          <MenubarItem>Redo</MenubarItem>
          <MenubarSeparator />
          <MenubarGroupLabel>Clipboard</MenubarGroupLabel>
          <MenubarItem>Copy</MenubarItem>
          <MenubarItem>Paste</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Enlarge</MenubarItem>
          <MenubarItem>Zoom out</MenubarItem>
          <MenubarItem>Full screen</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>);
}
export const menubarShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Multiple MenubarMenu form a horizontal menu bar. Open one and hover to switch to the adjacent menu.",
            code: `<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>New window</MenubarItem>
      <MenubarItem>Open...</MenubarItem>
      <MenubarSeparator />
      <MenubarItem variant="danger">Exit</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
  <MenubarMenu>
    <MenubarTrigger>Edit</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>Cancel</MenubarItem>
      <MenubarItem>Rework</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>`,
            render: () => (<Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>New window</MenubarItem>
              <MenubarItem>Open...</MenubarItem>
              <MenubarSeparator />
              <MenubarItem variant="danger">Exit</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Withdrawal</MenubarItem>
              <MenubarItem>Redo</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>),
        },
        {
            title: "Group title",
            description: "Use MenubarGroupLabel to add a subtitle to a group of items in the drop-down content.",
            code: `<Menubar>
  <MenubarMenu>
    <MenubarTrigger>Edit</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>Cancel</MenubarItem>
      <MenubarSeparator />
      <MenubarGroupLabel>Clipboard</MenubarGroupLabel>
      <MenubarItem>Copy</MenubarItem>
      <MenubarItem>Paste</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>`,
            render: () => (<Menubar>
          <MenubarMenu>
            <MenubarTrigger>Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Withdrawal</MenubarItem>
              <MenubarSeparator />
              <MenubarGroupLabel>Clipboard</MenubarGroupLabel>
              <MenubarItem>Copy</MenubarItem>
              <MenubarItem>Paste</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>),
        },
        {
            title: "Vertical menu bar",
            description: "orientation=\"vertical\" Arrange the menu bar vertically, suitable for side scenes.",
            code: `<Menubar orientation="vertical">
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>New window</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
  <MenubarMenu>
    <MenubarTrigger>View</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>Zoom in</MenubarItem>
      <MenubarItem>Zoom out</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>`,
            render: () => <Demo orientation="vertical"/>,
        },
    ],
    controls: [
        {
            prop: "orientation",
            type: "select",
            options: ["horizontal", "vertical"],
            defaultValue: "horizontal",
            label: "Direction",
        },
    ],
    states: [
        { name: "Horizontal menu bar (File/Edit/View)", render: () => <Demo /> },
        { name: "Vertical menu bar", render: () => <Demo orientation="vertical"/> },
    ],
    renderWithProps: (p) => <Demo orientation={(p.orientation as Orientation) ?? "horizontal"}/>,
    toCode: () => `<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>New window</MenubarItem>
      <MenubarSeparator />
      <MenubarItem variant="danger">Exit</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
  {/* More top-level menus... */}
</Menubar>`,
};
