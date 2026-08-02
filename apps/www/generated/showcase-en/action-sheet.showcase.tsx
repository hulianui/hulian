"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ActionSheet, ActionSheetContent, ActionSheetTrigger } from "../../../../packages/ui/src/action-sheet/action-sheet";
function Demo() {
    return (<ActionSheet>
      <ActionSheetTrigger className="rounded-[var(--radius)] border border-border bg-surface px-4 py-2 text-sm text-foreground outline-none hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring">
        Open the action panel
      </ActionSheetTrigger>
      <ActionSheetContent title="Picture manipulation" description="Select an action for this picture" actions={[
            { key: "save", label: "Save to album" },
            { key: "share", label: "Share", description: "Send to friends or circle of friends" },
            { key: "delete", label: "Delete", danger: true },
        ]}/>
    </ActionSheet>);
}
export const actionSheetShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Trigger triggers, actions array drives each action; each item is automatically closed after being clicked.",
            code: `<ActionSheet>
  <ActionSheetTrigger>Open the action panel</ActionSheetTrigger>
  <ActionSheetContent
    actions={[
      { key: "save", label: "Save to album" },
      { key: "share", label: "Share" },
    ]}
  />
</ActionSheet>`,
            render: () => (<ActionSheet>
          <ActionSheetTrigger className="rounded-[var(--radius)] border border-border bg-surface px-4 py-2 text-sm text-foreground outline-none hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring">
            Open the action panel
          </ActionSheetTrigger>
          <ActionSheetContent actions={[
                    { key: "save", label: "Save to album" },
                    { key: "share", label: "Share" },
                ]}/>
        </ActionSheet>),
        },
        {
            title: "Title and Description",
            description: "title / description is displayed at the top; action items can have description small characters.",
            code: `<ActionSheetContent
  title="Picture operation"
  description="Select an action on this picture"
  actions={[
    { key: "save", label: "Save to album" },
    { key: "share", label: "Share", description: "Send to friends or circle of friends" },
  ]}
/>`,
            render: () => (<ActionSheet>
          <ActionSheetTrigger className="rounded-[var(--radius)] border border-border bg-surface px-4 py-2 text-sm text-foreground outline-none hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring">
            Open (with title)
          </ActionSheetTrigger>
          <ActionSheetContent title="Picture manipulation" description="Select an action for this picture" actions={[
                    { key: "save", label: "Save to album" },
                    { key: "share", label: "Share", description: "Send to friends or circle of friends" },
                ]}/>
        </ActionSheet>),
        },
        {
            title: "Dangerous action",
            description: "action.danger red highlight; cancelText customized or passed null hidden cancel block.",
            code: `<ActionSheetContent
  title="Delete Confirm"
  cancelText="Think again"
  actions={[
    { key: "delete", label: "Delete", danger: true },
  ]}
/>`,
            render: () => (<ActionSheet>
          <ActionSheetTrigger className="rounded-[var(--radius)] border border-border bg-surface px-4 py-2 text-sm text-foreground outline-none hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring">
            Open (dangerous action)
          </ActionSheetTrigger>
          <ActionSheetContent title="Delete confirmation" cancelText="Think again" actions={[{ key: "delete", label: "Delete", danger: true }]}/>
        </ActionSheet>),
        },
    ],
    controls: [],
    states: [{ name: "Title + Dangerous Action + Cancel", render: () => <Demo /> }],
    renderWithProps: () => <Demo />,
    toCode: () => `<ActionSheet>
  <ActionSheetTrigger>Open</ActionSheetTrigger>
  <ActionSheetContent
    title="Picture operation"
    actions={[
      { key: "save", label: "Save" },
      { key: "delete", label: "Delete", danger: true },
    ]}
  />
</ActionSheet>`,
};
