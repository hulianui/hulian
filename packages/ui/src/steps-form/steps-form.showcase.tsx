"use client";
import { useState } from "react";
import { Field } from "../field";
import { useForm } from "../form/use-form";
import { Input } from "../input";
import type { ShowcaseSpec } from "../showcase/types";
import { StepsForm } from "./steps-form";

function Demo() {
  const form = useForm({ initialValues: { name: "", company: "", email: "" } });
  const [done, setDone] = useState<string | null>(null);
  const name = form.register("name", { rules: [{ required: true, message: "请输入姓名" }] });
  const company = form.register("company", { rules: [{ required: true, message: "请输入公司" }] });
  const email = form.register("email", { rules: [{ pattern: /@/, message: "邮箱需含 @" }] });

  return (
    <div className="w-full max-w-xl">
      <StepsForm
        onStepValidate={async (step) => {
          // 仅校验本步字段
          if (step === 0) return (await form.validateField("name")) == null;
          if (step === 1) return (await form.validateField("company")) == null;
          return true;
        }}
        onFinish={async () => {
          const r = await form.validate();
          if (!r.ok) return;
          await new Promise((res) => setTimeout(res, 600));
          setDone(JSON.stringify(r.values));
        }}
        steps={[
          {
            title: "基本信息",
            description: "姓名",
            content: (
              <Field label="姓名" error={name.error}>
                <Input value={name.value as string} onChange={name.onChange} onBlur={name.onBlur} />
              </Field>
            ),
          },
          {
            title: "公司信息",
            description: "公司",
            content: (
              <Field label="公司" error={company.error}>
                <Input value={company.value as string} onChange={company.onChange} onBlur={company.onBlur} />
              </Field>
            ),
          },
          {
            title: "联系方式",
            description: "邮箱",
            content: (
              <Field label="邮箱" error={email.error}>
                <Input value={email.value as string} onChange={email.onChange} onBlur={email.onBlur} placeholder="含 @" />
              </Field>
            ),
          },
        ]}
      />
      {done && <p className="mt-3 text-sm text-muted">已提交：{done}</p>}
    </div>
  );
}

export const stepsFormShowcase: ShowcaseSpec = {
  controls: [],
  states: [{ name: "分步表单 · 逐步校验 + 跨步保值 + 提交", render: () => <Demo /> }],
  renderWithProps: () => <Demo />,
  toCode: () =>
    `<StepsForm
  onStepValidate={async (step) => (await form.validateField(fieldsOf(step))) == null}
  onFinish={async () => { const r = await form.validate(); if (r.ok) await api.save(r.values); }}
  steps={[
    { title: "基本信息", content: <Field>...</Field> },
    { title: "公司信息", content: <Field>...</Field> },
    { title: "联系方式", content: <Field>...</Field> },
  ]}
/>`,
};
