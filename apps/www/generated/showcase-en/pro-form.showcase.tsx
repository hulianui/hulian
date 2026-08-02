"use client";
import { useState } from "react";
import { Field } from "../../../../packages/ui/src/field";
import { useForm } from "../../../../packages/ui/src/form/use-form";
import { Input } from "../../../../packages/ui/src/input";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ProForm } from "../../../../packages/ui/src/pro-form/pro-form";
function Demo() {
    const form = useForm({ initialValues: { name: "", email: "" } });
    const [result, setResult] = useState<string | null>(null);
    const name = form.register("name", { rules: [{ required: true, message: "Please enter your name" }] });
    const email = form.register("email", {
        rules: [
            { required: true, message: "Please enter your email address" },
            { pattern: /@/, message: "Email must contain @" },
        ],
    });
    return (<div className="w-full max-w-md">
      <ProForm form={form} onFinish={async (v) => {
            await new Promise((r) => setTimeout(r, 600));
            setResult(JSON.stringify(v));
        }}>
        <Field label="Name" error={name.error}>
          <Input value={name.value as string} onChange={name.onChange} onBlur={name.onBlur} placeholder="Required"/>
        </Field>
        <Field label="Email" error={email.error}>
          <Input value={email.value as string} onChange={email.onChange} onBlur={email.onBlur} placeholder="Required · Contains @"/>
        </Field>
      </ProForm>
      {result && <p className="mt-3 text-sm text-muted">Submitted:{result}</p>}
    </div>);
}
function GridDemo() {
    const form = useForm({
        initialValues: { first: "Hu", last: "Lian", phone: "", city: "", addr: "", note: "" },
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
    return (<div className="w-full max-w-2xl resize-x overflow-auto rounded-[var(--radius)] border border-dashed border-border p-4">
      <ProForm form={form} columns={2} submitText="Save" onFinish={() => { }}>
        <Field label="name">
          <Input {...bind(reg.first)}/>
        </Field>
        <Field label="Last name">
          <Input {...bind(reg.last)}/>
        </Field>
        <Field label="Mobile phone">
          <Input {...bind(reg.phone)} placeholder="Optional"/>
        </Field>
        <Field label="City">
          <Input {...bind(reg.city)} placeholder="Optional"/>
        </Field>
        <Field label="Detailed address" colSpan="full">
          <Input {...bind(reg.addr)} placeholder="colSpan=full · Across the entire line"/>
        </Field>
        <Field label="Remarks" colSpan="full">
          <Input {...bind(reg.note)} placeholder="colSpan=full · Across the entire line"/>
        </Field>
      </ProForm>
    </div>);
}
export const proFormShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Inline form: comes with submit/reset footer, submit it to onFinish.",
            code: `<ProForm onFinish={(values) => api.save(values)}>
  <Field label="Name">
    <Input placeholder="Required" />
  </Field>
  <Field label="Email">
    <Input placeholder="including @" />
  </Field>
</ProForm>`,
            render: () => (<div className="w-full max-w-md">
          <ProForm onFinish={() => { }}>
            <Field label="Name">
              <Input placeholder="Required"/>
            </Field>
            <Field label="Email">
              <Input placeholder="Contains @"/>
            </Field>
          </ProForm>
        </div>),
        },
        {
            title: "Responsive Grid",
            description: "columns=2 Adapt according to container width (container query, non-viewport breakpoint); use Field colSpan=full for a single field to span the entire row.",
            code: `<ProForm columns={2} submitText="Save">
  <Field label="name"><Input /></Field>
  <Field label="Last name"><Input /></Field>
  <Field label="Detailed address" colSpan="full"><Input /></Field>
</ProForm>`,
            render: () => (<div className="w-full max-w-2xl">
          <ProForm columns={2} submitText="Save" onFinish={() => { }}>
            <Field label="name">
              <Input defaultValue="Hu"/>
            </Field>
            <Field label="Last name">
              <Input defaultValue="Lian"/>
            </Field>
            <Field label="Detailed address" colSpan="full">
              <Input placeholder="colSpan=full · Across the entire line"/>
            </Field>
          </ProForm>
        </div>),
        },
        {
            title: "Bottom right aligned",
            description: "footerAlign=right makes the operation area stick to the right; use showReset={false} to hide the reset.",
            code: `<ProForm footerAlign="right" showReset={false} submitText="Submit">
  <Field label="Remarks">
    <Input />
  </Field>
</ProForm>`,
            render: () => (<div className="w-full max-w-md">
          <ProForm footerAlign="right" showReset={false} submitText="Submit" onFinish={() => { }}>
            <Field label="Remarks">
              <Input placeholder="Optional"/>
            </Field>
          </ProForm>
        </div>),
        },
    ],
    controls: [],
    states: [
        { name: "Inline form \u00B7 useForm validation + asynchronous submission + reset", render: () => <Demo /> },
        { name: "Responsive Raster \u00B7 columns container query (narrow to single column) + Field colSpan across columns", render: () => <GridDemo /> },
    ],
    renderWithProps: () => <Demo />,
    toCode: () => `// columns uses container query to adapt: the form narrows and automatically collapses into a single column, without handwriting breakpoints; for cross-row fields, use colSpan="full"
<ProForm form={form} columns={2}>
  <Field label="name"><Input {...bindFirst} /></Field>
  <Field label="surname"><Input {...bindLast} /></Field>
  <Field label="Detailed address" colSpan="full"><Input {...bindAddr} /></Field>
</ProForm>`,
};
