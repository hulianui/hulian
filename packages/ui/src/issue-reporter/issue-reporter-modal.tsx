"use client";
import { useRef } from "react";
import { useComponentLocale } from "../config/locale-context";
import { ModalForm } from "../form-dialog/form-dialog";
import { IssueReporter } from "./issue-reporter";
import type { IssueReporterApi, IssueReporterModalProps } from "./issue-reporter.types";

// 弹层版：ModalForm 提供外壳 + 钉底的提交/取消按钮，IssueReporter 作正文。
//
// 校验的所有权在 IssueReporter 手上（模板是动态的，外层拿不到字段清单），
// 所以这里不给 ModalForm 传 useForm 实例，改用 apiRef.submit()：
// 返回 null = 没过校验 → 给 ModalForm 回 false 保持弹层打开，错误由 Field 就地展示。
export function IssueReporterModal({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  modalTitle: modalTitleProp,
  submitText,
  cancelText,
  modalClassName,
  ...reporterProps
}: IssueReporterModalProps) {
  // 优先级：modalTitle prop > ConfigProvider 的 locale > 内置中文兜底。
  // hook 必须无条件调用，故先取 locale 再做 ?? 归并。
  const locale = useComponentLocale().issueReporter;
  const modalTitle = modalTitleProp ?? locale?.modalTitle ?? "反馈 issue";
  const apiRef = useRef<IssueReporterApi | null>(null);

  return (
    <ModalForm
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      trigger={trigger}
      title={modalTitle}
      submitText={submitText}
      cancelText={cancelText}
      className={modalClassName}
      onFinish={() => apiRef.current?.submit() != null}
    >
      {/* showSubmit=false：提交按钮由 ModalForm 的 footer 槽提供，正文里再来一个会有两个提交入口 */}
      <IssueReporter {...reporterProps} apiRef={apiRef} showSubmit={false} />
    </ModalForm>
  );
}
