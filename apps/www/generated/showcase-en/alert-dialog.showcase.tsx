"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogClose } from "../../../../packages/ui/src/alert-dialog/alert-dialog";
const triggerCls = "inline-flex h-9 items-center rounded-[var(--radius)] border border-danger px-4 text-sm font-medium text-danger outline-none transition-colors hover:bg-danger/10 focus-visible:ring-2 focus-visible:ring-ring";
const cancelCls = "inline-flex h-8 items-center rounded-[var(--radius)] border border-border bg-surface px-3 text-sm text-foreground outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring";
const dangerCls = "inline-flex h-8 items-center rounded-[var(--radius)] bg-danger px-3 text-sm font-medium text-danger-foreground outline-none transition-colors hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring";
function Demo() {
    return (<AlertDialog>
      <AlertDialogTrigger className={triggerCls}>Delete item</AlertDialogTrigger>
      <AlertDialogContent title="Delete project?" description="This operation is irreversible and the project data will be permanently deleted.">
        <AlertDialogClose className={cancelCls}>Cancel</AlertDialogClose>
        <AlertDialogClose className={dangerCls}>Delete</AlertDialogClose>
      </AlertDialogContent>
    </AlertDialog>);
}
export const alertDialogShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Forced confirmation before destruction/irreversible operation: default does not respond to point mask / Esc closed, must explicitly click button decision.",
            code: `<AlertDialog>
  <AlertDialogTrigger>Delete item</AlertDialogTrigger>
  <AlertDialogContent title="Delete project?" description="This operation is irreversible and the project data will be permanently deleted.">
    <AlertDialogClose>Cancel</AlertDialogClose>
    <AlertDialogClose>Delete</AlertDialogClose>
  </AlertDialogContent>
</AlertDialog>`,
            render: () => (<AlertDialog>
          <AlertDialogTrigger className={triggerCls}>Delete item</AlertDialogTrigger>
          <AlertDialogContent title="Delete project?" description="This operation is irreversible and the project data will be permanently deleted.">
            <AlertDialogClose className={cancelCls}>Cancel</AlertDialogClose>
            <AlertDialogClose className={dangerCls}>Delete</AlertDialogClose>
          </AlertDialogContent>
        </AlertDialog>),
        },
        {
            title: "Only description without description",
            description: "description can be omitted, leaving just the title as a11y label.",
            code: `<AlertDialog>
  <AlertDialogTrigger>Log out</AlertDialogTrigger>
  <AlertDialogContent title="Confirm to log out?">
    <AlertDialogClose>Cancel</AlertDialogClose>
    <AlertDialogClose>Exit</AlertDialogClose>
  </AlertDialogContent>
</AlertDialog>`,
            render: () => (<AlertDialog>
          <AlertDialogTrigger className={triggerCls}>Log out</AlertDialogTrigger>
          <AlertDialogContent title="Confirm to log out?">
            <AlertDialogClose className={cancelCls}>Cancel</AlertDialogClose>
            <AlertDialogClose className={dangerCls}>Exit</AlertDialogClose>
          </AlertDialogContent>
        </AlertDialog>),
        },
        {
            title: "Open by default",
            description: "Use uncontrolled defaultOpen to expand the dialog box initially (for controlled use, use open + onOpenChange).",
            code: `<AlertDialog defaultOpen>
  <AlertDialogTrigger>Empty Recycle Bin</AlertDialogTrigger>
  <AlertDialogContent title="Empty the Recycle Bin?" description="28 of the files will be permanently deleted and cannot be recovered.">
    <AlertDialogClose>Cancel</AlertDialogClose>
    <AlertDialogClose>Clear</AlertDialogClose>
  </AlertDialogContent>
</AlertDialog>`,
            render: () => (<AlertDialog defaultOpen>
          <AlertDialogTrigger className={triggerCls}>Empty the Recycle Bin</AlertDialogTrigger>
          <AlertDialogContent title="Empty Recycle Bin?" description="28 of these files will be permanently deleted and cannot be recovered.">
            <AlertDialogClose className={cancelCls}>Cancel</AlertDialogClose>
            <AlertDialogClose className={dangerCls}>Clear</AlertDialogClose>
          </AlertDialogContent>
        </AlertDialog>),
        },
    ],
    controls: [],
    states: [{ name: "default", render: () => <Demo /> }],
    renderWithProps: () => <Demo />,
    toCode: () => `<AlertDialog>
  <AlertDialogTrigger>Delete item</AlertDialogTrigger>
  <AlertDialogContent title="Delete item?" description="This action cannot be undone.">
    <AlertDialogClose>Cancel</AlertDialogClose>
    <AlertDialogClose>Delete</AlertDialogClose>
  </AlertDialogContent>
</AlertDialog>`,
};
