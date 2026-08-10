"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Form } from "./form";
import { useForm } from "./use-form";
import { FormList } from "./form-list";
import { Field } from "../field";
import { Input } from "../input";
import { Button } from "../button";

function Demo() {
  const [submitted, setSubmitted] = useState<string | null>(null);
  return (
    <Form className="w-72" onFormSubmit={(v) => setSubmitted(JSON.stringify(v))}>
      <Field label="邮箱" name="email">
        <Input name="email" type="email" placeholder="you@example.com" required />
      </Field>
      <Field label="用户名" name="username">
        <Input name="username" placeholder="瑚琏用户" required />
      </Field>
      <Button type="submit" size="sm">
        提交
      </Button>
      {submitted && <p className="text-xs text-muted-foreground">已提交：{submitted}</p>}
    </Form>
  );
}

// 校验规则引擎 + 字段联动（useForm 控制器）
function ValidationDemo() {
  const form = useForm({ initialValues: { email: "", pwd: "", confirm: "" } });
  const [done, setDone] = useState<string | null>(null);
  const email = form.register("email", { rules: [{ required: true, message: "请填邮箱" }, { pattern: /^[^@]+@[^@]+$/, message: "邮箱格式不正确" }] });
  const pwd = form.register("pwd", { rules: [{ required: true, min: 6, message: "至少 6 位" }] });
  const confirm = form.register("confirm", {
    dependencies: ["pwd"],
    rules: [{ validator: (v, values) => { if (v !== values.pwd) throw new Error("两次密码不一致"); } }],
  });
  return (
    <form
      className="w-72 space-y-4"
      onSubmit={form.submit(
        (values) => setDone(JSON.stringify(values)),
        () => setDone(null),
      )}
      noValidate
    >
      <Field label="邮箱" error={email.error}>
        <Input value={email.value as string} onChange={email.onChange} onBlur={email.onBlur} placeholder="you@example.com" />
      </Field>
      <Field label="密码" error={pwd.error}>
        <Input type="password" value={pwd.value as string} onChange={pwd.onChange} onBlur={pwd.onBlur} />
      </Field>
      <Field label="确认密码" error={confirm.error}>
        <Input type="password" value={confirm.value as string} onChange={confirm.onChange} onBlur={confirm.onBlur} />
      </Field>
      <Button type="submit" size="sm">
        提交
      </Button>
      {done && <p className="text-xs text-muted-foreground">通过：{done}</p>}
    </form>
  );
}

// 动态列表 FormList（增删行 + 移动）
function FormListDemo() {
  const [rows, setRows] = useState<{ name: string }[]>([{ name: "" }]);
  return (
    <div className="w-80 space-y-3">
      <FormList<{ name: string }> value={rows} onChange={setRows}>
        {(fields, ops, value) => (
          <>
            {fields.map((f) => (
              <div key={f.key} className="flex items-center gap-2">
                <Input
                  className="flex-1"
                  placeholder={`联系人 ${f.name + 1}`}
                  value={value[f.name]?.name ?? ""}
                  onChange={(e) => {
                    const next = [...value];
                    next[f.name] = { name: (e.target as HTMLInputElement).value };
                    setRows(next);
                  }}
                />
                <Button type="button" variant="ghost" size="sm" onClick={() => ops.move(f.name, Math.max(0, f.name - 1))}>
                  上移
                </Button>
                <Button type="button" variant="outline" size="sm" tone="danger" onClick={() => ops.remove(f.name)}>
                  删除
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => ops.add({ name: "" })}>
              + 添加联系人
            </Button>
          </>
        )}
      </FormList>
    </div>
  );
}

export const formShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "Base UI Form 容器，提交时拿到结构化 values（已 preventDefault）。",
      code: `<Form className="w-72" onFormSubmit={(v) => console.log(v)}>
  <Field label="邮箱" name="email">
    <Input name="email" type="email" placeholder="you@example.com" required />
  </Field>
  <Field label="用户名" name="username">
    <Input name="username" placeholder="瑚琏用户" required />
  </Field>
  <Button type="submit" size="sm">提交</Button>
</Form>`,
      render: () => (
        <Form className="w-72" onFormSubmit={() => {}}>
          <Field label="邮箱" name="email">
            <Input name="email" type="email" placeholder="you@example.com" required />
          </Field>
          <Field label="用户名" name="username">
            <Input name="username" placeholder="瑚琏用户" required />
          </Field>
          <Button type="submit" size="sm">
            提交
          </Button>
        </Form>
      ),
    },
    {
      title: "服务端错误",
      description: "errors 按 Field name 映射，把外部/服务端校验结果回显到对应字段。",
      code: `<Form
  className="w-72"
  errors={{ email: "该邮箱已被注册" }}
  onFormSubmit={(v) => console.log(v)}
>
  <Field label="邮箱" name="email">
    <Input name="email" type="email" defaultValue="taken@example.com" />
  </Field>
  <Button type="submit" size="sm">提交</Button>
</Form>`,
      render: () => (
        <Form className="w-72" errors={{ email: "该邮箱已被注册" }} onFormSubmit={() => {}}>
          <Field label="邮箱" name="email">
            <Input name="email" type="email" defaultValue="taken@example.com" />
          </Field>
          <Button type="submit" size="sm">
            提交
          </Button>
        </Form>
      ),
    },
    {
      title: "校验规则 + 字段联动（useForm）",
      description: "useForm 控制器：register 声明规则，dependencies 做字段联动，submit 包裹提交。",
      code: `const form = useForm({ initialValues: { email: "", pwd: "", confirm: "" } });
const email = form.register("email", {
  rules: [
    { required: true, message: "请填邮箱" },
    { pattern: /^[^@]+@[^@]+$/, message: "邮箱格式不正确" },
  ],
});
const pwd = form.register("pwd", { rules: [{ required: true, min: 6, message: "至少 6 位" }] });
const confirm = form.register("confirm", {
  dependencies: ["pwd"],
  rules: [{ validator: (v, values) => { if (v !== values.pwd) throw new Error("两次密码不一致"); } }],
});

<form onSubmit={form.submit(onFinish, onFinishFailed)} noValidate>
  <Field label="邮箱" error={email.error}>
    <Input value={email.value} onChange={email.onChange} onBlur={email.onBlur} />
  </Field>
  <Field label="密码" error={pwd.error}>
    <Input type="password" value={pwd.value} onChange={pwd.onChange} onBlur={pwd.onBlur} />
  </Field>
  <Field label="确认密码" error={confirm.error}>
    <Input type="password" value={confirm.value} onChange={confirm.onChange} onBlur={confirm.onBlur} />
  </Field>
  <Button type="submit" size="sm">提交</Button>
</form>`,
      render: () => <ValidationDemo />,
    },
    {
      title: "动态列表（FormList）",
      description: "FormList 管理可增删、可移动的重复字段行。",
      code: `<FormList<{ name: string }> value={rows} onChange={setRows}>
  {(fields, ops, value) => (
    <>
      {fields.map((f) => (
        <div key={f.key} className="flex items-center gap-2">
          <Input value={value[f.name]?.name ?? ""} onChange={...} />
          <Button onClick={() => ops.remove(f.name)}>删除</Button>
        </div>
      ))}
      <Button onClick={() => ops.add({ name: "" })}>+ 添加联系人</Button>
    </>
  )}
</FormList>`,
      render: () => <FormListDemo />,
    },
  ],
  controls: [],
  states: [
    { name: "基础(Base UI 提交)", render: () => <Demo /> },
    { name: "校验规则 + 字段联动", render: () => <ValidationDemo /> },
    { name: "FormList 动态列表", render: () => <FormListDemo /> },
  ],
  renderWithProps: () => <Demo />,
  toCode: () =>
    `const form = useForm({ initialValues: { email: "" } });\nconst email = form.register("email", { rules: [{ required: true }] });\n<form onSubmit={form.submit(onFinish, onFinishFailed)}>\n  <Field label="邮箱" error={email.error}>\n    <Input value={email.value} onChange={email.onChange} onBlur={email.onBlur} />\n  </Field>\n</form>`,
};
