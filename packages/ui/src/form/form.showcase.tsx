"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Form } from "./form";
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
      {submitted && <p className="text-xs text-muted">已提交：{submitted}</p>}
    </Form>
  );
}

export const formShowcase: ShowcaseSpec = {
  controls: [],
  states: [{ name: "default", render: () => <Demo /> }],
  renderWithProps: () => <Demo />,
  toCode: () =>
    `<Form onFormSubmit={(values) => console.log(values)}>\n  <Field label="邮箱" name="email">\n    <Input name="email" type="email" required />\n  </Field>\n  <Button type="submit">提交</Button>\n</Form>`,
};
