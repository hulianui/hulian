"use client";
import { useState } from "react";
import { Button } from "../button";
import { Field } from "../field";
import { useForm } from "../form/use-form";
import { Input } from "../input";
import type { ShowcaseSpec } from "../showcase/types";
import { DrawerForm, ModalForm } from "./form-dialog";

function Demo() {
  const form = useForm({ initialValues: { name: "", email: "" } });
  const [submitted, setSubmitted] = useState<string | null>(null);
  const name = form.register("name", { rules: [{ required: true, message: "请输入姓名" }] });
  const email = form.register("email", { rules: [{ pattern: /@/, message: "邮箱需含 @" }] });

  const fields = (
    <>
      <Field label="姓名" error={name.error}>
        <Input value={name.value as string} onChange={name.onChange} onBlur={name.onBlur} placeholder="必填" />
      </Field>
      <Field label="邮箱" error={email.error}>
        <Input value={email.value as string} onChange={email.onChange} onBlur={email.onBlur} placeholder="含 @ 才通过" />
      </Field>
    </>
  );

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex gap-2">
        <ModalForm
          title="新增员工"
          form={form}
          trigger={<Button>弹窗表单</Button>}
          onFinish={async (v) => {
            await new Promise((r) => setTimeout(r, 600)); // 模拟提交
            setSubmitted(JSON.stringify(v));
            form.resetFields();
          }}
        >
          {fields}
        </ModalForm>

        <DrawerForm
          title="编辑员工"
          form={form}
          trigger={<Button variant="outline">抽屉表单</Button>}
          onFinish={(v) => {
            setSubmitted(JSON.stringify(v));
            form.resetFields();
          }}
        >
          {fields}
        </DrawerForm>
      </div>
      {submitted && <p className="text-sm text-muted">已提交：{submitted}</p>}
      <p className="text-xs text-muted">未填姓名点提交会被校验拦住、弹窗不关闭；提交成功(模拟 600ms)自动关闭。</p>
    </div>
  );
}

export const formDialogShowcase: ShowcaseSpec = {
  controls: [],
  states: [{ name: "弹窗 / 抽屉表单 · useForm 校验 + 异步提交", render: () => <Demo /> }],
  renderWithProps: () => <Demo />,
  toCode: () =>
    `const form = useForm({ initialValues: { name: "" } });
const name = form.register("name", { rules: [{ required: true, message: "请输入姓名" }] });

<ModalForm
  title="新增员工"
  form={form}
  trigger={<Button>新增</Button>}
  onFinish={async (values) => { await api.create(values); }}  // 校验通过+成功后自动关闭
>
  <Field label="姓名" error={name.error}>
    <Input value={name.value} onChange={name.onChange} onBlur={name.onBlur} />
  </Field>
</ModalForm>`,
};
