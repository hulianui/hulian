"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuGroup, ContextMenuGroupLabel, ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent, } from "../../../../packages/ui/src/context-menu/context-menu";
function Demo({ withGroup = false, withSub = false }: {
    withGroup?: boolean;
    withSub?: boolean;
}) {
    return (<ContextMenu>
      <ContextMenuTrigger className="flex h-28 w-full max-w-sm select-none items-center justify-center rounded-[var(--radius)] border border-dashed border-border bg-surface text-sm text-muted-foreground">
        Right click on this area
      </ContextMenuTrigger>
      <ContextMenuContent>
        {withGroup ? (<ContextMenuGroup>
            <ContextMenuGroupLabel>Actions</ContextMenuGroupLabel>
            <ContextMenuItem>Edit</ContextMenuItem>
            <ContextMenuItem>Copy</ContextMenuItem>
          </ContextMenuGroup>) : (<>
            <ContextMenuItem>Edit</ContextMenuItem>
            <ContextMenuItem>Copy</ContextMenuItem>
            <ContextMenuItem disabled>Archive (disabled)</ContextMenuItem>
          </>)}
        {withSub && (<ContextMenuSub>
            <ContextMenuSubTrigger>Move to</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>Inbox</ContextMenuItem>
              <ContextMenuItem>Project A</ContextMenuItem>
              <ContextMenuItem>Project B</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuSub>
                <ContextMenuSubTrigger>More groups</ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  <ContextMenuItem>Archive</ContextMenuItem>
                  <ContextMenuItem>Star</ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
            </ContextMenuSubContent>
          </ContextMenuSub>)}
        <ContextMenuSeparator />
        <ContextMenuItem variant="danger">Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>);
}
export const contextMenuShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Right-click (or long-press) on the Trigger area to pop up a menu, and the menu is anchored to the cursor. Item supports disabled and variant=\"danger\".",
            code: `<ContextMenu>
  <ContextMenuTrigger className="...right-click this area">
    Right click on this area
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>Edit</ContextMenuItem>
    <ContextMenuItem>Copy</ContextMenuItem>
    <ContextMenuItem disabled>Archive (Disabled)</ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem variant="danger">Delete</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>`,
            render: () => <Demo />,
        },
        {
            title: "Group with title",
            description: "Use ContextMenuGroup + ContextMenuGroupLabel to add a group title to a group of commands.",
            code: `<ContextMenuContent>
  <ContextMenuGroup>
    <ContextMenuGroupLabel>Operation</ContextMenuGroupLabel>
    <ContextMenuItem>Edit</ContextMenuItem>
    <ContextMenuItem>Copy</ContextMenuItem>
  </ContextMenuGroup>
  <ContextMenuSeparator />
  <ContextMenuItem variant="danger">Delete</ContextMenuItem>
</ContextMenuContent>`,
            render: () => <Demo withGroup/>,
        },
        {
            title: "Cascading submenu",
            description: "ContextMenuSub nests SubTrigger + SubContent, expanded from the right side of the parent item, supporting multi-level nesting.",
            code: `<ContextMenuSub>
  <ContextMenuSubTrigger>Move to</ContextMenuSubTrigger>
  <ContextMenuSubContent>
    <ContextMenuItem>Inbox</ContextMenuItem>
    <ContextMenuItem>Project A</ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuSub>
      <ContextMenuSubTrigger>More groups</ContextMenuSubTrigger>
      <ContextMenuSubContent>
        <ContextMenuItem>Archive</ContextMenuItem>
        <ContextMenuItem>Star</ContextMenuItem>
      </ContextMenuSubContent>
    </ContextMenuSub>
  </ContextMenuSubContent>
</ContextMenuSub>`,
            render: () => <Demo withSub/>,
        },
    ],
    controls: [
        { prop: "withGroup", type: "boolean", defaultValue: false, label: "Grouping" },
        { prop: "withSub", type: "boolean", defaultValue: true, label: "Cascading submenu" },
    ],
    states: [
        { name: "default", render: () => <Demo /> },
        { name: "Grouping", render: () => <Demo withGroup/> },
        { name: "Cascading submenu", render: () => <Demo withSub/> },
    ],
    renderWithProps: (p) => (<Demo withGroup={p.withGroup as boolean} withSub={p.withSub as boolean}/>),
    toCode: () => `<ContextMenu>
  <ContextMenuTrigger>Right-click this area</ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>Edit</ContextMenuItem>
    <ContextMenuSub>
      <ContextMenuSubTrigger>Move to</ContextMenuSubTrigger>
      <ContextMenuSubContent>
        <ContextMenuItem>Project A</ContextMenuItem>
      </ContextMenuSubContent>
    </ContextMenuSub>
    <ContextMenuSeparator />
    <ContextMenuItem variant="danger">Delete</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>`,
};
