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

/** per-step 导航控制：nextDisabled 闸门 + nextText 自定义文案 + 末步 showNav=false 自带操作。 */
function NavControlDemo() {
  const [agreed, setAgreed] = useState(false);
  const [current, setCurrent] = useState(0);
  return (
    <div className="w-full max-w-xl">
      <StepsForm
        current={current}
        onCurrentChange={setCurrent}
        onStepValidate={async (step) => {
          // 模拟异步校验/提交：pending 期间前进按钮 loading
          if (step === 1) await new Promise((res) => setTimeout(res, 800));
          return true;
        }}
        steps={[
          {
            title: "确认协议",
            nextDisabled: !agreed,
            content: (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                我已阅读并同意导入协议（勾选后才能继续）
              </label>
            ),
          },
          {
            title: "执行导入",
            nextText: "开始导入",
            content: <p className="text-sm text-muted">点击「开始导入」触发异步校验，期间按钮 loading。</p>,
          },
          {
            title: "完成",
            showNav: false,
            content: (
              <div className="flex flex-col gap-3 text-sm">
                <p>导入完成（本步 showNav=false，导航由内容自带）。</p>
                <button
                  type="button"
                  className="self-start text-primary underline"
                  onClick={() => {
                    setAgreed(false);
                    setCurrent(0);
                  }}
                >
                  再来一遍
                </button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

export const stepsFormShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "Steps 指示器 + 上一步/下一步/提交导航；仅当前步内容挂载，值由消费者 useForm 跨步保留。",
      code: `<StepsForm
  onFinish={async () => { await api.save(); }}
  steps={[
    { title: "基本信息", content: <Field label="姓名"><Input /></Field> },
    { title: "公司信息", content: <Field label="公司"><Input /></Field> },
    { title: "联系方式", content: <Field label="邮箱"><Input /></Field> },
  ]}
/>`,
      render: () => (
        <div className="w-full max-w-xl">
          <StepsForm
            onFinish={() => {}}
            steps={[
              {
                title: "基本信息",
                description: "姓名",
                content: (
                  <Field label="姓名">
                    <Input placeholder="必填" />
                  </Field>
                ),
              },
              {
                title: "公司信息",
                description: "公司",
                content: (
                  <Field label="公司">
                    <Input placeholder="必填" />
                  </Field>
                ),
              },
              {
                title: "联系方式",
                description: "邮箱",
                content: (
                  <Field label="邮箱">
                    <Input placeholder="含 @" />
                  </Field>
                ),
              },
            ]}
          />
        </div>
      ),
    },
    {
      title: "逐步校验",
      description: "onStepValidate 在前进前校验本步字段；返回 false / reject 阻止前进，pending 期间按钮 loading。",
      code: `<StepsForm
  onStepValidate={async (step) =>
    (await form.validateField(fieldsOf(step))) == null
  }
  steps={steps}
/>`,
      render: () => (
        <div className="w-full max-w-xl">
          <StepsForm
            onStepValidate={async () => true}
            onFinish={() => {}}
            steps={[
              {
                title: "上传",
                content: (
                  <Field label="文件">
                    <Input placeholder="选择文件" />
                  </Field>
                ),
              },
              {
                title: "确认",
                content: (
                  <Field label="备注">
                    <Input />
                  </Field>
                ),
              },
            ]}
          />
        </div>
      ),
    },
    {
      title: "竖向步骤",
      description: "direction=vertical 让步骤指示器纵向排列，适合窄侧栏。",
      code: `<StepsForm direction="vertical" steps={steps} />`,
      render: () => (
        <div className="w-full max-w-xl">
          <StepsForm
            direction="vertical"
            onFinish={() => {}}
            steps={[
              {
                title: "第一步",
                content: (
                  <Field label="字段 A">
                    <Input />
                  </Field>
                ),
              },
              {
                title: "第二步",
                content: (
                  <Field label="字段 B">
                    <Input />
                  </Field>
                ),
              },
            ]}
          />
        </div>
      ),
    },
  ],
  controls: [],
  states: [
    { name: "分步表单 · 逐步校验 + 跨步保值 + 提交", render: () => <Demo /> },
    {
      name: "per-step 导航控制 · nextDisabled / nextText / showNav=false + 校验 loading",
      render: () => <NavControlDemo />,
    },
  ],
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
