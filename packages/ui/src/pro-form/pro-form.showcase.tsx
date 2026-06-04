"use client";
import { useState } from "react";
import { Field } from "../field";
import { useForm } from "../form/use-form";
import { Input } from "../input";
import type { ShowcaseSpec } from "../showcase/types";
import { ProForm } from "./pro-form";

function Demo() {
  const form = useForm({ initialValues: { name: "", email: "" } });
  const [result, setResult] = useState<string | null>(null);
  const name = form.register("name", { rules: [{ required: true, message: "请输入姓名" }] });
  const email = form.register("email", {
    rules: [
      { required: true, message: "请输入邮箱" },
      { pattern: /@/, message: "邮箱需含 @" },
    ],
  });

  return (
    <div className="w-full max-w-md">
      <ProForm
        form={form}
        onFinish={async (v) => {
          await new Promise((r) => setTimeout(r, 600));
          setResult(JSON.stringify(v));
        }}
      >
        <Field label="姓名" error={name.error}>
          <Input value={name.value as string} onChange={name.onChange} onBlur={name.onBlur} placeholder="必填" />
        </Field>
        <Field label="邮箱" error={email.error}>
          <Input value={email.value as string} onChange={email.onChange} onBlur={email.onBlur} placeholder="必填 · 含 @" />
        </Field>
      </ProForm>
      {result && <p className="mt-3 text-sm text-muted">已提交：{result}</p>}
    </div>
  );
}

export const proFormShowcase: ShowcaseSpec = {
  controls: [],
  states: [{ name: "内联表单 · useForm 校验 + 异步提交 + 重置", render: () => <Demo /> }],
  renderWithProps: () => <Demo />,
  toCode: () =>
    `const form = useForm({ initialValues: { name: "" } });
const name = form.register("name", { rules: [{ required: true, message: "请输入姓名" }] });

<ProForm form={form} onFinish={async (values) => { await api.save(values); }}>
  <Field label="姓名" error={name.error}>
    <Input value={name.value} onChange={name.onChange} onBlur={name.onBlur} />
  </Field>
</ProForm>`,
};
