"use client";
import { useState, type FormEvent, type ReactElement } from "react";
import { Button } from "../button";
import { useLocale } from "../config/locale";
import { Dialog, DialogContent, DialogTrigger } from "../dialog";
import { Drawer, DrawerContent, DrawerTrigger } from "../drawer";
import type { FormInstance, FormValues } from "../form/use-form";
import type { DrawerFormProps, ModalFormProps } from "./form-dialog.types";

// ModalForm / DrawerForm = 弹窗/抽屉表单（列表页「新增/编辑」编排件）。复用 Dialog/Drawer 容器 + useForm
// 控制器 + Button footer。共享 FormDialogBody：提交前(有 form 则) validate()，async onFinish 成功关闭/失败保持。

function useOpenState(open: boolean | undefined, defaultOpen: boolean | undefined, onOpenChange?: (o: boolean) => void) {
  const [internal, setInternal] = useState(defaultOpen ?? false);
  const value = open ?? internal;
  const set = (o: boolean) => {
    if (open === undefined) setInternal(o);
    onOpenChange?.(o);
  };
  return [value, set] as const;
}

interface BodyProps {
  form?: FormInstance;
  onFinish?: (values: FormValues) => void | boolean | Promise<void | boolean>;
  submitText?: string;
  cancelText?: string;
  onClose: () => void;
  children?: React.ReactNode;
}

function FormDialogBody({ form, onFinish, submitText, cancelText, onClose, children }: BodyProps) {
  const loc = useLocale().modalForm;
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="space-y-4">{children}</div>
      <div className="mt-1 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          {cancelText ?? loc.cancel}
        </Button>
        <Button type="submit" loading={loading}>
          {submitText ?? loc.submit}
        </Button>
      </div>
    </form>
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
  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger as ReactElement<Record<string, unknown>>} />}
      <DialogContent title={title} className={className}>
        <FormDialogBody
          form={form}
          onFinish={onFinish}
          submitText={submitText}
          cancelText={cancelText}
          onClose={() => setOpen(false)}
        >
          {children}
        </FormDialogBody>
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
  return (
    <Drawer open={isOpen} onOpenChange={setOpen}>
      {trigger && <DrawerTrigger render={trigger as ReactElement<Record<string, unknown>>} />}
      <DrawerContent side={side} title={title} className={className}>
        <FormDialogBody
          form={form}
          onFinish={onFinish}
          submitText={submitText}
          cancelText={cancelText}
          onClose={() => setOpen(false)}
        >
          {children}
        </FormDialogBody>
      </DrawerContent>
    </Drawer>
  );
}
