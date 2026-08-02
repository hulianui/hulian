"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Form } from "../../../../packages/ui/src/form/form";
import { useForm } from "../../../../packages/ui/src/form/use-form";
import { FormList } from "../../../../packages/ui/src/form/form-list";
import { Field } from "../../../../packages/ui/src/field";
import { Input } from "../../../../packages/ui/src/input";
import { Button } from "../../../../packages/ui/src/button";
function Demo() {
    const [submitted, setSubmitted] = useState<string | null>(null);
    return (<Form className="w-72" onFormSubmit={(v) => setSubmitted(JSON.stringify(v))}>
      <Field label="Email" name="email">
        <Input name="email" type="email" placeholder="you@example.com" required/>
      </Field>
      <Field label="Username" name="username">
        <Input name="username" placeholder="Hulian user" required/>
      </Field>
      <Button type="submit" size="sm">
        Submit
      </Button>
      {submitted && <p className="text-xs text-muted">Submitted:{submitted}</p>}
    </Form>);
}
function ValidationDemo() {
    const form = useForm({ initialValues: { email: "", pwd: "", confirm: "" } });
    const [done, setDone] = useState<string | null>(null);
    const email = form.register("email", { rules: [{ required: true, message: "Please fill in your email address" }, { pattern: /^[^@]+@[^@]+$/, message: "The email format is incorrect" }] });
    const pwd = form.register("pwd", { rules: [{ required: true, min: 6, message: "At least 6 people" }] });
    const confirm = form.register("confirm", {
        dependencies: ["pwd"],
        rules: [{ validator: (v, values) => { if (v !== values.pwd)
                    throw new Error("The two passwords are inconsistent"); } }],
    });
    return (<form className="w-72 space-y-4" onSubmit={form.submit((values) => setDone(JSON.stringify(values)), () => setDone(null))} noValidate>
      <Field label="Email" error={email.error}>
        <Input value={email.value as string} onChange={email.onChange} onBlur={email.onBlur} placeholder="you@example.com"/>
      </Field>
      <Field label="Password" error={pwd.error}>
        <Input type="password" value={pwd.value as string} onChange={pwd.onChange} onBlur={pwd.onBlur}/>
      </Field>
      <Field label="Confirm password" error={confirm.error}>
        <Input type="password" value={confirm.value as string} onChange={confirm.onChange} onBlur={confirm.onBlur}/>
      </Field>
      <Button type="submit" size="sm">
        Submit
      </Button>
      {done && <p className="text-xs text-muted">By:{done}</p>}
    </form>);
}
function FormListDemo() {
    const [rows, setRows] = useState<{
        name: string;
    }[]>([{ name: "" }]);
    return (<div className="w-80 space-y-3">
      <FormList<{
        name: string;
    }> value={rows} onChange={setRows}>
        {(fields, ops, value) => (<>
            {fields.map((f) => (<div key={f.key} className="flex items-center gap-2">
                <Input className="flex-1" placeholder={`Contact ${f.name + 1}`} value={value[f.name]?.name ?? ""} onChange={(e) => {
                    const next = [...value];
                    next[f.name] = { name: (e.target as HTMLInputElement).value };
                    setRows(next);
                }}/>
                <Button type="button" variant="ghost" size="sm" onClick={() => ops.move(f.name, Math.max(0, f.name - 1))}>
                  Move up
                </Button>
                <Button type="button" variant="outline" size="sm" tone="danger" onClick={() => ops.remove(f.name)}>
                  Delete
                </Button>
              </div>))}
            <Button type="button" variant="outline" size="sm" onClick={() => ops.add({ name: "" })}>
              + Add contact
            </Button>
          </>)}
      </FormList>
    </div>);
}
export const formShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Base UI Form container, you get the structured values (preventDefault) when submitting.",
            code: `<Form className="w-72" onFormSubmit={(v) => console.log(v)}>
  <Field label="Email" name="email">
    <Input name="email" type="email" placeholder="you@example.com" required />
  </Field>
  <Field label="Username" name="username">
    <Input name="username" placeholder="Hulian user" required />
  </Field>
  <Button type="submit" size="sm">Submit</Button>
</Form>`,
            render: () => (<Form className="w-72" onFormSubmit={() => { }}>
          <Field label="Email" name="email">
            <Input name="email" type="email" placeholder="you@example.com" required/>
          </Field>
          <Field label="Username" name="username">
            <Input name="username" placeholder="Hulian user" required/>
          </Field>
          <Button type="submit" size="sm">
            Submit
          </Button>
        </Form>),
        },
        {
            title: "Server error",
            description: "errors According to Field name mapping, the external/server verification results are echoed to the corresponding fields.",
            code: `<Form
  className="w-72"
  errors={{ email: "This email address has been registered" }}
  onFormSubmit={(v) => console.log(v)}
>
  <Field label="Email" name="email">
    <Input name="email" type="email" defaultValue="taken@example.com" />
  </Field>
  <Button type="submit" size="sm">Submit</Button>
</Form>`,
            render: () => (<Form className="w-72" errors={{ email: "This email address has been registered" }} onFormSubmit={() => { }}>
          <Field label="Email" name="email">
            <Input name="email" type="email" defaultValue="taken@example.com"/>
          </Field>
          <Button type="submit" size="sm">
            Submit
          </Button>
        </Form>),
        },
        {
            title: "Verification rules + field linkage (useForm)",
            description: "useForm controller: register declares rules, dependencies does field linkage, and submit packages are submitted.",
            code: `const form = useForm({ initialValues: { email: "", pwd: "", confirm: "" } });
const email = form.register("email", {
  rules: [
    { required: true, message: "Please fill in your email address" },
    { pattern: /^[^@]+@[^@]+$/, message: "The email format is incorrect" },
  ],
});
const pwd = form.register("pwd", { rules: [{ required: true, min: 6, message: "At least 6 digits" }] });
const confirm = form.register("confirm", {
  dependencies: ["pwd"],
  rules: [{ validator: (v, values) => { if (v !== values.pwd) throw new Error("Two passwords are inconsistent"); } }],
When
});

<form onSubmit={form.submit(onFinish, onFinishFailed)} noValidate>
  <Field label="Email" error={email.error}>
    <Input value={email.value} onChange={email.onChange} onBlur={email.onBlur} />
  </Field>
  <Field label="Password" error={pwd.error}>
    <Input type="password" value={pwd.value} onChange={pwd.onChange} onBlur={pwd.onBlur} />
  </Field>
  <Field label="Confirm password" error={confirm.error}>
    <Input type="password" value={confirm.value} onChange={confirm.onChange} onBlur={confirm.onBlur} />
  </Field>
  <Button type="submit" size="sm">Submit</Button>
</form>`,
            render: () => <ValidationDemo />,
        },
        {
            title: "Dynamic list (FormList)",
            description: "FormList manages repeating field rows that can be added, deleted, and moved.",
            code: `<FormList<{ name: string }> value={rows} onChange={setRows}>
  {(fields, ops, value) => (
    <>
      {fields.map((f) => (
        <div key={f.key} className="flex items-center gap-2">
          <Input value={value[f.name]?.name ?? ""} onChange={...} />
          <Button onClick={() => ops.remove(f.name)}>Delete</Button>
        </div>
      ))}
      <Button onClick={() => ops.add({ name: "" })}>+ Add Contact</Button>
    </>
  )}
</FormList>`,
            render: () => <FormListDemo />,
        },
    ],
    controls: [],
    states: [
        { name: "Basics (Base UI submitted)", render: () => <Demo /> },
        { name: "Verification rules + field linkage", render: () => <ValidationDemo /> },
        { name: "FormList dynamic list", render: () => <FormListDemo /> },
    ],
    renderWithProps: () => <Demo />,
    toCode: () => `const form = useForm({ initialValues: { email: "" } });
const email = form.register("email", { rules: [{ required: true }] });
<form onSubmit={form.submit(onFinish, onFinishFailed)}>
  <Field label="Email" error={email.error}>
    <Input value={email.value} onChange={email.onChange} onBlur={email.onBlur} />
  </Field>
</form>`,
};
