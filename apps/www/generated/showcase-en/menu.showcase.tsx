"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Menu, MenuTrigger, MenuContent, MenuItem, MenuCheckboxItem, MenuRadioGroup, MenuRadioItem, MenuSeparator, MenuGroup, MenuGroupLabel, MenuSub, MenuSubTrigger, MenuSubContent, } from "../../../../packages/ui/src/menu/menu";
import { Button } from "../../../../packages/ui/src/button/button";
type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";
function SelectionDemo({ defaultOpen = false }: {
    defaultOpen?: boolean;
}) {
    return (<Menu defaultOpen={defaultOpen} modal={false}>
      <MenuTrigger render={<Button variant="outline">View</Button>}/>
      <MenuContent>
        <MenuGroup>
          <MenuGroupLabel>Display</MenuGroupLabel>
          <MenuCheckboxItem defaultChecked>Show grid</MenuCheckboxItem>
          <MenuCheckboxItem>Show rulers</MenuCheckboxItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuGroup>
          <MenuGroupLabel>Density</MenuGroupLabel>
          <MenuRadioGroup defaultValue="comfortable">
            <MenuRadioItem value="compact">Compact</MenuRadioItem>
            <MenuRadioItem value="comfortable">Comfortable</MenuRadioItem>
            <MenuRadioItem value="loose">Loose</MenuRadioItem>
          </MenuRadioGroup>
        </MenuGroup>
      </MenuContent>
    </Menu>);
}
function SubDemo({ defaultOpen = false }: {
    defaultOpen?: boolean;
}) {
    return (<Menu defaultOpen={defaultOpen} modal={false}>
      <MenuTrigger render={<Button variant="outline">Filter</Button>}/>
      <MenuContent>
        <MenuItem>All tasks</MenuItem>
        <MenuSeparator />
        <MenuSub>
          <MenuSubTrigger>Status</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>To do</MenuItem>
            <MenuItem>Ongoing</MenuItem>
            <MenuItem>Completed</MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuSub>
          <MenuSubTrigger>Priority</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>Low</MenuItem>
            <MenuItem>Medium</MenuItem>
            <MenuItem>High</MenuItem>
          </MenuSubContent>
        </MenuSub>
      </MenuContent>
    </Menu>);
}
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
            title: "Disabled item",
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
            description: "MenuGroup + MenuGroupLabel Add subtitles to a group of menu items.",
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
            title: "Checkbox and radio items",
            description: "MenuCheckboxItem is a setting that toggles on and off (role=menuitemcheckbox); MenuRadioGroup plus MenuRadioItem forms a set of mutually exclusive options (role=menuitemradio). Both carry aria-checked, so a screen reader can announce the current selection, whereas a tick drawn by hand on a plain MenuItem looks identical but loses that semantic. Clicking keeps the menu open by default; pass closeOnClick to dismiss it once a value is picked.",
            code: `<MenuContent>
  <MenuGroup>
    <MenuGroupLabel>Display</MenuGroupLabel>
    <MenuCheckboxItem defaultChecked>Show grid</MenuCheckboxItem>
    <MenuCheckboxItem>Show rulers</MenuCheckboxItem>
  </MenuGroup>
  <MenuSeparator />
  <MenuGroup>
    <MenuGroupLabel>Density</MenuGroupLabel>
    <MenuRadioGroup defaultValue="comfortable">
      <MenuRadioItem value="compact">Compact</MenuRadioItem>
      <MenuRadioItem value="comfortable">Comfortable</MenuRadioItem>
      <MenuRadioItem value="loose">Loose</MenuRadioItem>
    </MenuRadioGroup>
  </MenuGroup>
</MenuContent>`,
            render: () => <SelectionDemo />,
        },
        {
            title: "Cascading submenu",
            description: "MenuSub wraps MenuSubTrigger + MenuSubContent; the sub panel expands from the right side of the parent item and supports multi-level nesting. Grouping options by dimension suits filters that hold dozens of choices, where a flat single-level panel becomes unusable.",
            code: `<MenuContent>
  <MenuItem>All tasks</MenuItem>
  <MenuSeparator />
  <MenuSub>
    <MenuSubTrigger>Status</MenuSubTrigger>
    <MenuSubContent>
      <MenuItem>To do</MenuItem>
      <MenuItem>Ongoing</MenuItem>
      <MenuItem>Completed</MenuItem>
    </MenuSubContent>
  </MenuSub>
</MenuContent>`,
            render: () => <SubDemo />,
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
        { name: "Checkbox and radio items (open)", render: () => <SelectionDemo defaultOpen/> },
        { name: "Cascading submenu (open)", render: () => <SubDemo defaultOpen/> },
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
