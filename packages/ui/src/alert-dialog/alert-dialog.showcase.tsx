"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogClose } from "./alert-dialog";

const triggerCls =
  "inline-flex h-9 items-center rounded-[var(--radius)] border border-danger px-4 text-sm font-medium text-danger outline-none transition-colors hover:bg-danger/10 focus-visible:ring-2 focus-visible:ring-ring";
const cancelCls =
  "inline-flex h-8 items-center rounded-[var(--radius)] border border-border bg-surface px-3 text-sm text-foreground outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring";
const dangerCls =
  "inline-flex h-8 items-center rounded-[var(--radius)] bg-danger px-3 text-sm font-medium text-danger-foreground outline-none transition-colors hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring";

// 警示图标：库内不导出图标资产，示例用内联 svg（消费方通常来自 lucide 等图标库）。
// 颜色不写在组件里，由调用方给 token 类 —— 危险 text-danger / 警告 text-warning。
const WarnIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="text-danger">
    <path
      d="M10 2.5 1.8 16.5h16.4L10 2.5Zm0 5v4.2M10 14.2h.01"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
      title: "正文块 + 状态图标",
      description:
        "body 放块级正文（删除对象摘要卡这类），渲染在说明之下、动作区之上；description 只能放 phrasing content（它是 <p>）。icon 落在标题行左侧，颜色由调用方给 token 类。",
      code: `<AlertDialogContent
  icon={<WarnIcon className="text-danger" />}
  title="确认删除合同模板"
  description="将从合同库 / 公开库 / 各公司库中一并移除，无法恢复。"
  body={
    <div className="rounded-[var(--radius)] border border-border p-3">
      <div className="font-medium">冠亚/全日制劳动合同</div>
      <div className="text-xs text-muted-foreground">副本冠亚-全日制劳动合同文本.docx</div>
    </div>
  }
>
  <AlertDialogClose>取消</AlertDialogClose>
  <AlertDialogClose>永久删除</AlertDialogClose>
</AlertDialogContent>`,
      render: () => (
        <AlertDialog>
          <AlertDialogTrigger className={triggerCls}>删除合同模板</AlertDialogTrigger>
          <AlertDialogContent
            icon={<WarnIcon />}
            title="确认删除合同模板"
            description="将从合同库 / 公开库 / 各公司库中一并移除，无法恢复。"
            body={
              <div className="rounded-[var(--radius)] border border-border p-3">
                <div className="font-medium">冠亚/全日制劳动合同</div>
                <div className="text-xs text-muted-foreground">
                  副本冠亚-全日制劳动合同文本.docx
                </div>
              </div>
            }
          >
            <AlertDialogClose className={cancelCls}>取消</AlertDialogClose>
            <AlertDialogClose className={dangerCls}>永久删除</AlertDialogClose>
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
