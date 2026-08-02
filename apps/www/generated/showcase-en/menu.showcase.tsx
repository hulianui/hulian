"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Menu, MenuTrigger, MenuContent, MenuItem, MenuSeparator, MenuGroup, MenuGroupLabel } from "../../../../packages/ui/src/menu/menu";
import { Button } from "../../../../packages/ui/src/button/button";
type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";
function Demo({ side = "bottom", align = "start", withGroup = false }: {
    side?: Side;
    align?: Align;
    withGroup?: boolean;
}) {
    return (<Menu>
      <MenuTrigger render={<Button variant="outline">Menu</Button>}/>
      <MenuContent side={side} align={align}>
        {withGroup ? (<MenuGroup>
            <MenuGroupLabel>Actions</MenuGroupLabel>
            <MenuItem>Edit</MenuItem>
            <MenuItem>Copy</MenuItem>
          </MenuGroup>) : (<>
            <MenuItem>Edit</MenuItem>
            <MenuItem>Copy</MenuItem>
            <MenuItem disabled>Archive (disabled)</MenuItem>
          </>)}
        <MenuSeparator />
        <MenuItem variant="danger">Delete</MenuItem>
      </MenuContent>
    </Menu>);
}
export const menuShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Trigger uses render to take over any trigger element, Content contains MenuItem, and Separator separates it.",
            code: `<Menu>
  <MenuTrigger render={<Button variant="outline">Menu</Button>} />
  <MenuContent>
    <MenuItem>Edit</MenuItem>
    <MenuItem>Copy</MenuItem>
    <MenuSeparator />
    <MenuItem variant="danger">Delete</MenuItem>
  </MenuContent>
</Menu>`,
            render: () => (<Menu>
          <MenuTrigger render={<Button variant="outline">Menu</Button>}/>
          <MenuContent>
            <MenuItem>Edit</MenuItem>
            <MenuItem>Copy</MenuItem>
            <MenuSeparator />
            <MenuItem variant="danger">Delete</MenuItem>
          </MenuContent>
        </Menu>),
        },
        {
            title: "Prohibited Items",
            description: "MenuItem cannot be highlighted or clicked after adding disabled.",
            code: `<Menu>
  <MenuTrigger render={<Button variant="outline">Menu</Button>} />
  <MenuContent>
    <MenuItem>Edit</MenuItem>
    <MenuItem disabled>Archive (Disabled)</MenuItem>
  </MenuContent>
</Menu>`,
            render: () => (<Menu>
          <MenuTrigger render={<Button variant="outline">Menu</Button>}/>
          <MenuContent>
            <MenuItem>Edit</MenuItem>
            <MenuItem disabled>Archive (disabled)</MenuItem>
          </MenuContent>
        </Menu>),
        },
        {
            title: "Grouping",
            description: "MenuGroup + MenuGroupLabel Add a subtitle to a group of menu items.",
            code: `<Menu>
  <MenuTrigger render={<Button variant="outline">Menu</Button>} />
  <MenuContent>
    <MenuGroup>
      <MenuGroupLabel>Operation</MenuGroupLabel>
      <MenuItem>Edit</MenuItem>
      <MenuItem>Copy</MenuItem>
    </MenuGroup>
    <MenuSeparator />
    <MenuItem variant="danger">Delete</MenuItem>
  </MenuContent>
</Menu>`,
            render: () => (<Menu>
          <MenuTrigger render={<Button variant="outline">Menu</Button>}/>
          <MenuContent>
            <MenuGroup>
              <MenuGroupLabel>Actions</MenuGroupLabel>
              <MenuItem>Edit</MenuItem>
              <MenuItem>Copy</MenuItem>
            </MenuGroup>
            <MenuSeparator />
            <MenuItem variant="danger">Delete</MenuItem>
          </MenuContent>
        </Menu>),
        },
        {
            title: "Pop-up direction",
            description: "side / align of MenuContent controls the orientation of the floating layer relative to the trigger.",
            code: `<Menu>
  <MenuTrigger render={<Button variant="outline">Menu</Button>} />
  <MenuContent side="right" align="start">
    <MenuItem>Edit</MenuItem>
    <MenuItem>Copy</MenuItem>
  </MenuContent>
</Menu>`,
            render: () => (<Menu>
          <MenuTrigger render={<Button variant="outline">Menu</Button>}/>
          <MenuContent side="right" align="start">
            <MenuItem>Edit</MenuItem>
            <MenuItem>Copy</MenuItem>
          </MenuContent>
        </Menu>),
        },
    ],
    controls: [
        { prop: "side", type: "select", options: ["top", "right", "bottom", "left"], defaultValue: "bottom" },
        { prop: "align", type: "select", options: ["start", "center", "end"], defaultValue: "start" },
        { prop: "withGroup", type: "boolean", defaultValue: false, label: "Grouping" },
    ],
    states: [
        { name: "default", render: () => <Demo /> },
        { name: "Grouping", render: () => <Demo withGroup/> },
        { name: "right", render: () => <Demo side="right"/> },
        { name: "top", render: () => <Demo side="top"/> },
    ],
    renderWithProps: (p) => (<Demo side={p.side as Side} align={p.align as Align} withGroup={p.withGroup as boolean}/>),
    toCode: (p) => `<Menu>
  <MenuTrigger render={<Button>Menu</Button>} />
  <MenuContent side="${p.side}" align="${p.align}">
    <MenuItem>Edit</MenuItem>
    <MenuSeparator />
    <MenuItem variant="danger">Delete</MenuItem>
  </MenuContent>
</Menu>`,
};
