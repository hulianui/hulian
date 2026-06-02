"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Menu, MenuTrigger, MenuContent, MenuItem, MenuSeparator, MenuGroup, MenuGroupLabel } from "./menu";
import { Button } from "../button/button";

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

function Demo({ side = "bottom", align = "start", withGroup = false }: { side?: Side; align?: Align; withGroup?: boolean }) {
  return (
    <Menu>
      <MenuTrigger render={<Button variant="outline">菜单</Button>} />
      <MenuContent side={side} align={align}>
        {withGroup ? (
          <MenuGroup>
            <MenuGroupLabel>操作</MenuGroupLabel>
            <MenuItem>编辑</MenuItem>
            <MenuItem>复制</MenuItem>
          </MenuGroup>
        ) : (
          <>
            <MenuItem>编辑</MenuItem>
            <MenuItem>复制</MenuItem>
            <MenuItem disabled>归档（禁用）</MenuItem>
          </>
        )}
        <MenuSeparator />
        <MenuItem variant="danger">删除</MenuItem>
      </MenuContent>
    </Menu>
  );
}

export const menuShowcase: ShowcaseSpec = {
  controls: [
    { prop: "side", type: "select", options: ["top", "right", "bottom", "left"], defaultValue: "bottom" },
    { prop: "align", type: "select", options: ["start", "center", "end"], defaultValue: "start" },
    { prop: "withGroup", type: "boolean", defaultValue: false, label: "分组" },
  ],
  states: [
    { name: "default", render: () => <Demo /> },
    { name: "分组", render: () => <Demo withGroup /> },
    { name: "right", render: () => <Demo side="right" /> },
    { name: "top", render: () => <Demo side="top" /> },
  ],
  renderWithProps: (p) => (
    <Demo side={p.side as Side} align={p.align as Align} withGroup={p.withGroup as boolean} />
  ),
  toCode: (p) =>
    `<Menu>\n  <MenuTrigger render={<Button>菜单</Button>} />\n  <MenuContent side="${p.side}" align="${p.align}">\n    <MenuItem>编辑</MenuItem>\n    <MenuSeparator />\n    <MenuItem variant="danger">删除</MenuItem>\n  </MenuContent>\n</Menu>`,
};
