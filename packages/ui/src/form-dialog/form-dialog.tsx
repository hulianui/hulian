"use client";
import { useId, useState, type FormEvent, type ReactElement } from "react";
import { Button } from "../button";
import { useLocale } from "../config/locale";
import { Dialog, DialogContent, DialogTrigger } from "../dialog";
import { Drawer, DrawerContent, DrawerTrigger } from "../drawer";
import type { FormInstance, FormValues } from "../form/use-form";
import type { DrawerFormProps, ModalFormProps } from "./form-dialog.types";

// ModalForm / DrawerForm = 弹窗/抽屉表单（列表页「新增/编辑」编排件）。复用 Dialog/Drawer 容器 + useForm
// 控制器 + Button footer。共享 useFormDialogSubmit：提交前(有 form 则) validate()，async onFinish 成功关闭/失败保持。
//
// 按钮走 DialogContent/DrawerContent 的 footer 槽而非塞进 children：children 落在正文的
// overflow-y-auto 滚动区里，长表单时按钮会跟着内容滚出视野（footer 槽本就是为钉底而做的，
// 早期实现绕过了它），且按钮的阴影/焦点环会被滚动容器裁掉。
// 代价是按钮与 <form> 不再是父子关系 —— 用 HTML 的 form 属性按 id 把外部 submit 按钮关联回表单。

function useOpenState(open: boolean | undefined, defaultOpen: boolean | undefined, onOpenChange?: (o: boolean) => void) {
  const [internal, setInternal] = useState(defaultOpen ?? false);
  const value = open ?? internal;
  const set = (o: boolean) => {
    if (open === undefined) setInternal(o);
    onOpenChange?.(o);
  };
  return [value, set] as const;
}

interface SubmitOptions {
  form?: FormInstance;
  onFinish?: (values: FormValues) => void | boolean | Promise<void | boolean>;
  onClose: () => void;
}

// 提交状态提到 ModalForm/DrawerForm 这一层：正文(<form>)与按钮(footer 槽)已被容器分到两棵子树，
// loading / handleSubmit 必须由共同祖先持有才能同时喂给两边。抽成 hook 供两个编排件共用，避免各写一份。
function useFormDialogSubmit({ form, onFinish, onClose }: SubmitOptions) {
  // 用 id 关联外部提交按钮，故必须是 SSR/CSR 一致且同页多实例不撞的稳定值
  const formId = useId();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    let values: FormValues = form ? form.values : {};
    if (form) {
      const r = await form.validate();
      if (!r.ok) return; // 校验不过：保持打开，错误由 Field 展示
      values = r.values;
    }
    const ret = onFinish?.(values);
    if (ret && typeof (ret as Promise<unknown>).then === "function") {
      setLoading(true);
      try {
        const v = await ret;
        if (v !== false) onClose();
      } catch {
        /* 失败：保持打开，错误反馈交消费者 */
      } finally {
        setLoading(false);
      }
    } else if (ret !== false) {
      onClose();
    }
  };

  return { formId, loading, handleSubmit };
}

interface FooterProps {
  /** 关联到正文 <form> 的 id：提交按钮在 form 之外，靠它把点击回送给 onSubmit。 */
  formId: string;
  loading: boolean;
  submitText?: string;
  cancelText?: string;
  onClose: () => void;
}

function FormDialogFooter({ formId, loading, submitText, cancelText, onClose }: FooterProps) {
  const loc = useLocale().modalForm;
  // 不包 div：footer 槽自身已是 flex + justify-end + gap-2 的行容器，再套一层会破坏其对齐
  return (
    <>
      <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
        {cancelText ?? loc.cancel}
      </Button>
      <Button type="submit" form={formId} loading={loading}>
        {submitText ?? loc.submit}
      </Button>
    </>
  );
}

export function ModalForm({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  form,
  onFinish,
  submitText,
  cancelText,
  className,
  children,
}: ModalFormProps) {
  const [isOpen, setOpen] = useOpenState(open, defaultOpen, onOpenChange);
  const onClose = () => setOpen(false);
  const { formId, loading, handleSubmit } = useFormDialogSubmit({ form, onFinish, onClose });
  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger as ReactElement<Record<string, unknown>>} />}
      <DialogContent
        title={title}
        className={className}
        footer={
          <FormDialogFooter
            formId={formId}
            loading={loading}
            submitText={submitText}
            cancelText={cancelText}
            onClose={onClose}
          />
        }
      >
        {/* 按钮已移出，form 内只剩字段，保留 space-y-4 的字段间距即可 */}
        <form id={formId} onSubmit={handleSubmit} className="space-y-4">
          {children}
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DrawerForm({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  form,
  onFinish,
  submitText,
  cancelText,
  className,
  side = "right",
  children,
}: DrawerFormProps) {
  const [isOpen, setOpen] = useOpenState(open, defaultOpen, onOpenChange);
  const onClose = () => setOpen(false);
  const { formId, loading, handleSubmit } = useFormDialogSubmit({ form, onFinish, onClose });
  return (
    <Drawer open={isOpen} onOpenChange={setOpen}>
      {trigger && <DrawerTrigger render={trigger as ReactElement<Record<string, unknown>>} />}
      <DrawerContent
        side={side}
        title={title}
        className={className}
        footer={
          <FormDialogFooter
            formId={formId}
            loading={loading}
            submitText={submitText}
            cancelText={cancelText}
            onClose={onClose}
          />
        }
      >
        <form id={formId} onSubmit={handleSubmit} className="space-y-4">
          {children}
        </form>
      </DrawerContent>
    </Drawer>
  );
}
