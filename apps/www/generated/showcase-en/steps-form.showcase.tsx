"use client";
import { useState } from "react";
import { Field } from "../../../../packages/ui/src/field";
import { useForm } from "../../../../packages/ui/src/form/use-form";
import { Input } from "../../../../packages/ui/src/input";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { StepsForm } from "../../../../packages/ui/src/steps-form/steps-form";
function Demo() {
    const form = useForm({ initialValues: { name: "", company: "", email: "" } });
    const [done, setDone] = useState<string | null>(null);
    const name = form.register("name", { rules: [{ required: true, message: "Please enter your name" }] });
    const company = form.register("company", { rules: [{ required: true, message: "Please enter company" }] });
    const email = form.register("email", { rules: [{ pattern: /@/, message: "Email must contain @" }] });
    return (<div className="w-full max-w-xl">
      <StepsForm onStepValidate={async (step) => {
            if (step === 0)
                return (await form.validateField("name")) == null;
            if (step === 1)
                return (await form.validateField("company")) == null;
            return true;
        }} onFinish={async () => {
            const r = await form.validate();
            if (!r.ok)
                return;
            await new Promise((res) => setTimeout(res, 600));
            setDone(JSON.stringify(r.values));
        }} steps={[
            {
                title: "Basic information",
                description: "Name",
                content: (<Field label="Name" error={name.error}>
                <Input value={name.value as string} onChange={name.onChange} onBlur={name.onBlur}/>
              </Field>),
            },
            {
                title: "Company Information",
                description: "Company",
                content: (<Field label="Company" error={company.error}>
                <Input value={company.value as string} onChange={company.onChange} onBlur={company.onBlur}/>
              </Field>),
            },
            {
                title: "Contact information",
                description: "Email",
                content: (<Field label="Email" error={email.error}>
                <Input value={email.value as string} onChange={email.onChange} onBlur={email.onBlur} placeholder="Contains @"/>
              </Field>),
            },
        ]}/>
      {done && <p className="mt-3 text-sm text-muted">Submitted:{done}</p>}
    </div>);
}
function NavControlDemo() {
    const [agreed, setAgreed] = useState(false);
    const [current, setCurrent] = useState(0);
    return (<div className="w-full max-w-xl">
      <StepsForm current={current} onCurrentChange={setCurrent} onStepValidate={async (step) => {
            if (step === 1)
                await new Promise((res) => setTimeout(res, 800));
            return true;
        }} steps={[
            {
                title: "Confirm Agreement",
                nextDisabled: !agreed,
                content: (<label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}/>
                I have read and agreed to the import agreement (check to continue)
              </label>),
            },
            {
                title: "Execute import",
                nextText: "Start importing",
                content: <p className="text-sm text-muted">Click "Start Import" to trigger asynchronous verification, during which button loading.</p>,
            },
            {
                title: "Complete",
                showNav: false,
                content: (<div className="flex flex-col gap-3 text-sm">
                <p>The import is completed (this step is showNav=false, the navigation is provided by the content).</p>
                <button type="button" className="self-start text-primary underline" onClick={() => {
                        setAgreed(false);
                        setCurrent(0);
                    }}>
                  Do it again
                </button>
              </div>),
            },
        ]}/>
    </div>);
}
export const stepsFormShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Steps indicator + Previous/Next/Submit navigation; only the current step content is mounted, the value is retained by the consumer useForm step.",
            code: `<StepsForm
  onFinish={async () => { await api.save(); }}
  steps={[
    { title: "Basic information", content: <Field label="Name"><Input /></Field> },
    { title: "Company Information", content: <Field label="Company"><Input /></Field> },
    { title: "Contact Information", content: <Field label="Email"><Input /></Field> },
  ]}
/>`,
            render: () => (<div className="w-full max-w-xl">
          <StepsForm onFinish={() => { }} steps={[
                    {
                        title: "Basic information",
                        description: "Name",
                        content: (<Field label="Name">
                    <Input placeholder="Required"/>
                  </Field>),
                    },
                    {
                        title: "Company Information",
                        description: "Company",
                        content: (<Field label="Company">
                    <Input placeholder="Required"/>
                  </Field>),
                    },
                    {
                        title: "Contact information",
                        description: "Email",
                        content: (<Field label="Email">
                    <Input placeholder="Contains @"/>
                  </Field>),
                    },
                ]}/>
        </div>),
        },
        {
            title: "Step by step verification",
            description: "onStepValidate Verify this step field before moving forward; return false / reject to prevent moving forward, pending during button loading.",
            code: `<StepsForm
  onStepValidate={async (step) =>
    (await form.validateField(fieldsOf(step))) == null
  }
  steps={steps}
/>`,
            render: () => (<div className="w-full max-w-xl">
          <StepsForm onStepValidate={async () => true} onFinish={() => { }} steps={[
                    {
                        title: "Upload",
                        content: (<Field label="File">
                    <Input placeholder="Select file"/>
                  </Field>),
                    },
                    {
                        title: "Confirm",
                        content: (<Field label="Remarks">
                    <Input />
                  </Field>),
                    },
                ]}/>
        </div>),
        },
        {
            title: "Vertical steps",
            description: "direction=vertical Makes step indicators line up vertically to fit into narrow sidebars.",
            code: `<StepsForm direction="vertical" steps={steps} />`,
            render: () => (<div className="w-full max-w-xl">
          <StepsForm direction="vertical" onFinish={() => { }} steps={[
                    {
                        title: "First step",
                        content: (<Field label="Field A">
                    <Input />
                  </Field>),
                    },
                    {
                        title: "Step 2",
                        content: (<Field label="Field B">
                    <Input />
                  </Field>),
                    },
                ]}/>
        </div>),
        },
    ],
    controls: [],
    states: [
        { name: "Step-by-step form \u00B7 Step-by-step verification + step-by-step preservation + submission", render: () => <Demo /> },
        {
            name: "per-step Navigation Control \u00B7 nextDisabled / nextText / showNav=false + Check loading",
            render: () => <NavControlDemo />,
        },
    ],
    renderWithProps: () => <Demo />,
    toCode: () => `<StepsForm
  onStepValidate={async (step) => (await form.validateField(fieldsOf(step))) == null}
  onFinish={async () => { const r = await form.validate(); if (r.ok) await api.save(r.values); }}
  steps={[
    { title: "Basic information", content: <Field>...</Field> },
    { title: "Company Information", content: <Field>...</Field> },
    { title: "Contact Information", content: <Field>...</Field> },
  ]}
/>`,
};
