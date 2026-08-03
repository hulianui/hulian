"use client";
import { useState } from "react";
import { Button } from "../../../../packages/ui/src/button";
import { Field } from "../../../../packages/ui/src/field";
import { useForm } from "../../../../packages/ui/src/form/use-form";
import { Input } from "../../../../packages/ui/src/input";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { DrawerForm, ModalForm } from "../../../../packages/ui/src/form-dialog/form-dialog";
function Demo() {
    const form = useForm({ initialValues: { name: "", email: "" } });
    const [submitted, setSubmitted] = useState<string | null>(null);
    const name = form.register("name", { rules: [{ required: true, message: "Please enter your name" }] });
    const email = form.register("email", { rules: [{ pattern: /@/, message: "Email must contain @" }] });
    const fields = (<>
      <Field label="Name" error={name.error}>
        <Input value={name.value as string} onChange={name.onChange} onBlur={name.onBlur} placeholder="Required"/>
      </Field>
      <Field label="Email" error={email.error}>
        <Input value={email.value as string} onChange={email.onChange} onBlur={email.onBlur} placeholder="Passed only if it contains @"/>
      </Field>
    </>);
    return (<div className="flex flex-col items-start gap-3">
      <div className="flex gap-2">
        <ModalForm title="New employees" form={form} trigger={<Button>Pop-up form</Button>} onFinish={async (v) => {
            await new Promise((r) => setTimeout(r, 600));
            setSubmitted(JSON.stringify(v));
            form.resetFields();
        }}>
          {fields}
        </ModalForm>

        <DrawerForm title="Editor Staff" form={form} trigger={<Button variant="outline">Drawer form</Button>} onFinish={(v) => {
            setSubmitted(JSON.stringify(v));
            form.resetFields();
        }}>
          {fields}
        </DrawerForm>
      </div>
      {submitted && <p className="text-sm text-muted">Submitted:{submitted}</p>}
      <p className="text-xs text-muted">Submission of unfilled name points will be blocked by verification and the pop-up window will not be closed; if the submission is successful (simulation 600ms), it will be closed automatically.</p>
    </div>);
}
export const formDialogShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Pop-up form",
            description: "trigger triggers opening, and submission is successful (onFinish resolve) automatically closes.",
            code: `<ModalForm
  title="New employee"
  trigger={<Button>New</Button>}
  onFinish={async (values) => {
    await api.create(values);
  }}
>
  <Field label="Name">
    <Input placeholder="Required" />
  </Field>
</ModalForm>`,
            render: () => (<ModalForm title="New employees" trigger={<Button>New</Button>} onFinish={async () => {
                    await new Promise((r) => setTimeout(r, 600));
                }}>
          <Field label="Name">
            <Input placeholder="Required"/>
          </Field>
        </ModalForm>),
        },
        {
            title: "Drawer form",
            description: "DrawerForm reuses the same arrangement and slides out from the right edge, suitable for editing scenarios with many fields.",
            code: `<DrawerForm
  title="Edit Staff"
  trigger={<Button variant="outline">Edit</Button>}
  onFinish={(values) => api.update(values)}
>
  <Field label="Name">
    <Input />
  </Field>
  <Field label="Email">
    <Input />
  </Field>
</DrawerForm>`,
            render: () => (<DrawerForm title="Editor Staff" trigger={<Button variant="outline">Edit</Button>} onFinish={() => { }}>
          <Field label="Name">
            <Input />
          </Field>
          <Field label="Email">
            <Input />
          </Field>
        </DrawerForm>),
        },
        {
            title: "Drawer welt direction",
            description: "DrawerForm controls the welt direction through side (left / right).",
            code: `<DrawerForm title="Filter" side="left" trigger={<Button variant="outline">Left drawer</Button>}>
  <Field label="Keywords">
    <Input />
  </Field>
</DrawerForm>`,
            render: () => (<DrawerForm title="Filter" side="left" trigger={<Button variant="outline">Left drawer</Button>}>
          <Field label="Keywords">
            <Input />
          </Field>
        </DrawerForm>),
        },
        {
            title: "Custom button copy",
            description: "submitText / cancelText overrides the default submit/cancel copy.",
            code: `<ModalForm
  title="Export report"
  submitText="Export now"
  cancelText="Think again"
  trigger={<Button>Export</Button>}
>
  <Field label="file name">
    <Input placeholder="report.xlsx" />
  </Field>
</ModalForm>`,
            render: () => (<ModalForm title="Export report" submitText="Export now" cancelText="Think again" trigger={<Button>Export</Button>}>
          <Field label="file name">
            <Input placeholder="report.xlsx"/>
          </Field>
        </ModalForm>),
        },
    ],
    controls: [],
    states: [{ name: "Pop-up window / drawer form \u00B7 useForm verification + asynchronous submission", render: () => <Demo /> }],
    renderWithProps: () => <Demo />,
    toCode: () => `const form = useForm({ initialValues: { name: "" } });
const name = form.register("name", { rules: [{ required: true, message: "Please enter your name" }] });

<ModalForm
  title="New employee"
  form={form}
  trigger={<Button>New</Button>}
  onFinish={async (values) => { await api.create(values); }} // Automatically close after verification + success
>
  <Field label="Name" error={name.error}>
    <Input value={name.value} onChange={name.onChange} onBlur={name.onBlur} />
  </Field>
</ModalForm>`,
};
