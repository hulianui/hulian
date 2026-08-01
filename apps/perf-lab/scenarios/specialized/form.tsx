import { useState } from "react";

import { Button } from "@hulianui/ui/button";
import { Field } from "@hulianui/ui/field";
import { Input } from "@hulianui/ui/input";
import { useForm } from "@hulianui/ui/form";
import { definePerformanceScenario } from "@hulianui/hulian-scan/browser";

import { inputValue, invoke, nextPaint, rootFor, type ScenarioController } from "./shared";

export const formParameters = { fields: 20 } as const;
const id = "form/validation";
const controller: ScenarioController = {};

function Fixture() {
  const [key, setKey] = useState(0);
  const [visible, setVisible] = useState(true);
  controller["type"] = () => {
    const input = rootFor(id).querySelector<HTMLInputElement>("input");
    if (!input) throw new Error("form input is missing");
    inputValue(input, "hulian scan");
  };
  controller["validate"] = () => {
    rootFor(id).querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
  };
  controller["reset"] = () => setKey((value) => value + 1);
  controller["unmount"] = () => setVisible(false);
  return <div data-hulian-scan-scenario={id}>{visible ? <FormBody key={key} /> : null}</div>;
}

function FormBody() {
  const initialValues = Object.fromEntries(
    Array.from({ length: formParameters.fields }, (_, index) => [`field${index}`, ""]),
  );
  const form = useForm({ initialValues });
  return (
    <form onSubmit={form.submit(() => undefined)} noValidate>
      {Array.from({ length: formParameters.fields }, (_, index) => {
        const binding = form.register(`field${index}`, {
          rules: [{ required: true, message: `字段 ${index} 必填` }],
        });
        return (
          <Field key={index} label={`字段 ${index}`} error={binding.error}>
            <Input
              value={binding.value as string}
              onChange={binding.onChange}
              onBlur={binding.onBlur}
            />
          </Field>
        );
      })}
      <Button type="submit">校验</Button>
    </form>
  );
}

async function action(name: string): Promise<void> {
  await invoke(controller, name);
  await nextPaint();
}

export const formScenario = definePerformanceScenario({
  id,
  component: "Form",
  entry: "@hulianui/ui/form",
  category: "core",
  render: () => <Fixture />,
  steps: [
    {
      id: "type-field",
      kind: "interaction",
      label: "Type in a controlled field",
      run: () => action("type"),
    },
    {
      id: "validate-20-fields",
      kind: "interaction",
      label: "Validate 20 fields",
      run: () => action("validate"),
    },
    { id: "reset", kind: "props-update", run: () => action("reset") },
    { id: "unmount", kind: "unmount", run: () => action("unmount") },
  ],
  budgets: {},
});
