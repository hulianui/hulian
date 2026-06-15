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
  examples: [
    {
      title: "弹窗表单",
      description: "trigger 触发打开，提交成功（onFinish resolve）自动关闭。",
      code: `<ModalForm
  title="新增员工"
  trigger={<Button>新增</Button>}
  onFinish={async (values) => {
    await api.create(values);
  }}
>
  <Field label="姓名">
    <Input placeholder="必填" />
  </Field>
</ModalForm>`,
      render: () => (
        <ModalForm
          title="新增员工"
          trigger={<Button>新增</Button>}
          onFinish={async () => {
            await new Promise((r) => setTimeout(r, 600));
          }}
        >
          <Field label="姓名">
            <Input placeholder="必填" />
          </Field>
        </ModalForm>
      ),
    },
    {
      title: "抽屉表单",
      description: "DrawerForm 复用同一编排，从右侧贴边滑出，适合字段较多的编辑场景。",
      code: `<DrawerForm
  title="编辑员工"
  trigger={<Button variant="outline">编辑</Button>}
  onFinish={(values) => api.update(values)}
>
  <Field label="姓名">
    <Input />
  </Field>
  <Field label="邮箱">
    <Input />
  </Field>
</DrawerForm>`,
      render: () => (
        <DrawerForm title="编辑员工" trigger={<Button variant="outline">编辑</Button>} onFinish={() => {}}>
          <Field label="姓名">
            <Input />
          </Field>
          <Field label="邮箱">
            <Input />
          </Field>
        </DrawerForm>
      ),
    },
    {
      title: "抽屉贴边方向",
      description: "DrawerForm 通过 side 控制贴边方向（left / right）。",
      code: `<DrawerForm title="筛选" side="left" trigger={<Button variant="outline">左侧抽屉</Button>}>
  <Field label="关键词">
    <Input />
  </Field>
</DrawerForm>`,
      render: () => (
        <DrawerForm title="筛选" side="left" trigger={<Button variant="outline">左侧抽屉</Button>}>
          <Field label="关键词">
            <Input />
          </Field>
        </DrawerForm>
      ),
    },
    {
      title: "自定义按钮文案",
      description: "submitText / cancelText 覆盖默认的提交 / 取消文案。",
      code: `<ModalForm
  title="导出报表"
  submitText="立即导出"
  cancelText="再想想"
  trigger={<Button>导出</Button>}
>
  <Field label="文件名">
    <Input placeholder="report.xlsx" />
  </Field>
</ModalForm>`,
      render: () => (
        <ModalForm title="导出报表" submitText="立即导出" cancelText="再想想" trigger={<Button>导出</Button>}>
          <Field label="文件名">
            <Input placeholder="report.xlsx" />
          </Field>
        </ModalForm>
      ),
    },
  ],
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
