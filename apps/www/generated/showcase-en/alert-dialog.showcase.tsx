"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogClose } from "../../../../packages/ui/src/alert-dialog/alert-dialog";
const triggerCls = "inline-flex h-9 items-center rounded-[var(--radius)] border border-danger px-4 text-sm font-medium text-danger outline-none transition-colors hover:bg-danger/10 focus-visible:ring-2 focus-visible:ring-ring";
const cancelCls = "inline-flex h-8 items-center rounded-[var(--radius)] border border-border bg-surface px-3 text-sm text-foreground outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring";
const dangerCls = "inline-flex h-8 items-center rounded-[var(--radius)] bg-danger px-3 text-sm font-medium text-danger-foreground outline-none transition-colors hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring";
const WarnIcon = () => (<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="text-danger">
    <path d="M10 2.5 1.8 16.5h16.4L10 2.5Zm0 5v4.2M10 14.2h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>);
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
            title: "Body content and status icon",
            description: "body takes block-level content, such as a summary card of the object being deleted, and renders below the description and above the action row. description accepts phrasing content only, because it renders as a <p>. icon sits to the left of the title row; the caller supplies its color token.",
            code: `<AlertDialogContent
  icon={<WarnIcon className="text-danger" />}
  title="Delete this contract template?"
  description="It will be removed from the contract library, the public library, and every company library at once. This cannot be undone."
  body={
    <div className="rounded-[var(--radius)] border border-border p-3">
      <div className="font-medium">Guanya / Full-time employment contract</div>
      <div className="text-xs text-muted-foreground">copy-guanya-full-time-employment-contract.docx</div>
    </div>
  }
>
  <AlertDialogClose>Cancel</AlertDialogClose>
  <AlertDialogClose>Delete permanently</AlertDialogClose>
</AlertDialogContent>`,
            render: () => (<AlertDialog>
          <AlertDialogTrigger className={triggerCls}>Delete contract template</AlertDialogTrigger>
          <AlertDialogContent icon={<WarnIcon />} title="Delete contract template?" description="Removed from the shared, public, and per-company libraries at once; this cannot be undone." body={<div className="rounded-[var(--radius)] border border-border p-3">
                <div className="font-medium">Full-time employment contract</div>
                <div className="text-xs text-muted-foreground">
                  copy-guanya-full-time-employment-contract.docx
                </div>
              </div>}>
            <AlertDialogClose className={cancelCls}>Cancel</AlertDialogClose>
            <AlertDialogClose className={dangerCls}>Delete permanently</AlertDialogClose>
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
