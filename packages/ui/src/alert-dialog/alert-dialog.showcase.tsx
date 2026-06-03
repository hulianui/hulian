"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogClose } from "./alert-dialog";

const triggerCls =
  "inline-flex h-9 items-center rounded-[var(--radius)] border border-danger px-4 text-sm font-medium text-danger outline-none transition-colors hover:bg-danger/10 focus-visible:ring-2 focus-visible:ring-ring";
const cancelCls =
  "inline-flex h-8 items-center rounded-[var(--radius)] border border-border bg-surface px-3 text-sm text-foreground outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring";
const dangerCls =
  "inline-flex h-8 items-center rounded-[var(--radius)] bg-danger px-3 text-sm font-medium text-danger-foreground outline-none transition-colors hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring";

function Demo() {
  return (
    <AlertDialog>
      <AlertDialogTrigger className={triggerCls}>删除项目</AlertDialogTrigger>
      <AlertDialogContent title="删除项目？" description="此操作不可撤销，项目数据将被永久删除。">
        <AlertDialogClose className={cancelCls}>取消</AlertDialogClose>
        <AlertDialogClose className={dangerCls}>删除</AlertDialogClose>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const alertDialogShowcase: ShowcaseSpec = {
  controls: [],
  states: [{ name: "default", render: () => <Demo /> }],
  renderWithProps: () => <Demo />,
  toCode: () =>
    `<AlertDialog>\n  <AlertDialogTrigger>删除项目</AlertDialogTrigger>\n  <AlertDialogContent title="删除项目？" description="此操作不可撤销。">\n    <AlertDialogClose>取消</AlertDialogClose>\n    <AlertDialogClose>删除</AlertDialogClose>\n  </AlertDialogContent>\n</AlertDialog>`,
};
