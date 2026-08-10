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
      {result && <p className="mt-3 text-sm text-muted-foreground">已提交：{result}</p>}
    </div>
  );
}

function GridDemo() {
  const form = useForm({
    initialValues: { first: "瑚", last: "琏", phone: "", city: "", addr: "", note: "" },
  });
  const reg = {
    first: form.register("first"),
    last: form.register("last"),
    phone: form.register("phone"),
    city: form.register("city"),
    addr: form.register("addr"),
    note: form.register("note"),
  };
  const bind = (f: typeof reg.first) => ({ value: f.value as string, onChange: f.onChange, onBlur: f.onBlur });

  // 容器宽度演示：拖动这个外框变窄到 ~512px 以下，栅格会自动塌为单列（容器查询，非视口断点）
  return (
    <div className="w-full max-w-2xl resize-x overflow-auto rounded-[var(--radius)] border border-dashed border-border p-4">
      <ProForm form={form} columns={2} submitText="保存" onFinish={() => {}}>
        <Field label="名">
          <Input {...bind(reg.first)} />
        </Field>
        <Field label="姓">
          <Input {...bind(reg.last)} />
        </Field>
        <Field label="手机">
          <Input {...bind(reg.phone)} placeholder="选填" />
        </Field>
        <Field label="城市">
          <Input {...bind(reg.city)} placeholder="选填" />
        </Field>
        <Field label="详细地址" colSpan="full">
          <Input {...bind(reg.addr)} placeholder="colSpan=full · 跨整行" />
        </Field>
        <Field label="备注" colSpan="full">
          <Input {...bind(reg.note)} placeholder="colSpan=full · 跨整行" />
        </Field>
      </ProForm>
    </div>
  );
}

export const proFormShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "内联表单：自带提交 / 重置 footer，提交走 onFinish。",
      code: `<ProForm onFinish={(values) => api.save(values)}>
  <Field label="姓名">
    <Input placeholder="必填" />
  </Field>
  <Field label="邮箱">
    <Input placeholder="含 @" />
  </Field>
</ProForm>`,
      render: () => (
        <div className="w-full max-w-md">
          <ProForm onFinish={() => {}}>
            <Field label="姓名">
              <Input placeholder="必填" />
            </Field>
            <Field label="邮箱">
              <Input placeholder="含 @" />
            </Field>
          </ProForm>
        </div>
      ),
    },
    {
      title: "响应式栅格",
      description: "columns=2 按容器宽度自适应（容器查询，非视口断点）；单字段跨整行用 Field colSpan=full。",
      code: `<ProForm columns={2} submitText="保存">
  <Field label="名"><Input /></Field>
  <Field label="姓"><Input /></Field>
  <Field label="详细地址" colSpan="full"><Input /></Field>
</ProForm>`,
      render: () => (
        <div className="w-full max-w-2xl">
          <ProForm columns={2} submitText="保存" onFinish={() => {}}>
            <Field label="名">
              <Input defaultValue="瑚" />
            </Field>
            <Field label="姓">
              <Input defaultValue="琏" />
            </Field>
            <Field label="详细地址" colSpan="full">
              <Input placeholder="colSpan=full · 跨整行" />
            </Field>
          </ProForm>
        </div>
      ),
    },
    {
      title: "底部右对齐",
      description: "footerAlign=right 让操作区贴右；隐藏重置用 showReset={false}。",
      code: `<ProForm footerAlign="right" showReset={false} submitText="提交">
  <Field label="备注">
    <Input />
  </Field>
</ProForm>`,
      render: () => (
        <div className="w-full max-w-md">
          <ProForm footerAlign="right" showReset={false} submitText="提交" onFinish={() => {}}>
            <Field label="备注">
              <Input placeholder="选填" />
            </Field>
          </ProForm>
        </div>
      ),
    },
  ],
  controls: [],
  states: [
    { name: "内联表单 · useForm 校验 + 异步提交 + 重置", render: () => <Demo /> },
    { name: "响应式栅格 · columns 容器查询(窄到单列) + Field colSpan 跨列", render: () => <GridDemo /> },
  ],
  renderWithProps: () => <Demo />,
  toCode: () =>
    `// columns 用容器查询自适应：表单变窄自动塌为单列，无需手写断点；跨行字段用 colSpan="full"
<ProForm form={form} columns={2}>
  <Field label="名"><Input {...bindFirst} /></Field>
  <Field label="姓"><Input {...bindLast} /></Field>
  <Field label="详细地址" colSpan="full"><Input {...bindAddr} /></Field>
</ProForm>`,
};
