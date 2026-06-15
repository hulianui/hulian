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
  examples: [
    {
      title: "基础用法",
      description: "销毁/不可逆操作前的强制确认：默认不响应点遮罩 / Esc 关闭，必须显式点按钮决策。",
      code: `<AlertDialog>
  <AlertDialogTrigger>删除项目</AlertDialogTrigger>
  <AlertDialogContent title="删除项目？" description="此操作不可撤销，项目数据将被永久删除。">
    <AlertDialogClose>取消</AlertDialogClose>
    <AlertDialogClose>删除</AlertDialogClose>
  </AlertDialogContent>
</AlertDialog>`,
      render: () => (
        <AlertDialog>
          <AlertDialogTrigger className={triggerCls}>删除项目</AlertDialogTrigger>
          <AlertDialogContent title="删除项目？" description="此操作不可撤销，项目数据将被永久删除。">
            <AlertDialogClose className={cancelCls}>取消</AlertDialogClose>
            <AlertDialogClose className={dangerCls}>删除</AlertDialogClose>
          </AlertDialogContent>
        </AlertDialog>
      ),
    },
    {
      title: "仅说明无描述",
      description: "description 可省略，只保留标题作为 a11y label。",
      code: `<AlertDialog>
  <AlertDialogTrigger>退出登录</AlertDialogTrigger>
  <AlertDialogContent title="确认退出登录？">
    <AlertDialogClose>取消</AlertDialogClose>
    <AlertDialogClose>退出</AlertDialogClose>
  </AlertDialogContent>
</AlertDialog>`,
      render: () => (
        <AlertDialog>
          <AlertDialogTrigger className={triggerCls}>退出登录</AlertDialogTrigger>
          <AlertDialogContent title="确认退出登录？">
            <AlertDialogClose className={cancelCls}>取消</AlertDialogClose>
            <AlertDialogClose className={dangerCls}>退出</AlertDialogClose>
          </AlertDialogContent>
        </AlertDialog>
      ),
    },
    {
      title: "默认打开",
      description: "用非受控 defaultOpen 让对话框初始即展开（受控请用 open + onOpenChange）。",
      code: `<AlertDialog defaultOpen>
  <AlertDialogTrigger>清空回收站</AlertDialogTrigger>
  <AlertDialogContent title="清空回收站？" description="其中 28 个文件将被永久删除，无法恢复。">
    <AlertDialogClose>取消</AlertDialogClose>
    <AlertDialogClose>清空</AlertDialogClose>
  </AlertDialogContent>
</AlertDialog>`,
      render: () => (
        <AlertDialog defaultOpen>
          <AlertDialogTrigger className={triggerCls}>清空回收站</AlertDialogTrigger>
          <AlertDialogContent title="清空回收站？" description="其中 28 个文件将被永久删除，无法恢复。">
            <AlertDialogClose className={cancelCls}>取消</AlertDialogClose>
            <AlertDialogClose className={dangerCls}>清空</AlertDialogClose>
          </AlertDialogContent>
        </AlertDialog>
      ),
    },
  ],
  controls: [],
  states: [{ name: "default", render: () => <Demo /> }],
  renderWithProps: () => <Demo />,
  toCode: () =>
    `<AlertDialog>\n  <AlertDialogTrigger>删除项目</AlertDialogTrigger>\n  <AlertDialogContent title="删除项目？" description="此操作不可撤销。">\n    <AlertDialogClose>取消</AlertDialogClose>\n    <AlertDialogClose>删除</AlertDialogClose>\n  </AlertDialogContent>\n</AlertDialog>`,
};
