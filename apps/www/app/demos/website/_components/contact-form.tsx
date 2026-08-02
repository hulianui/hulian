"use client";
import { copy } from "./contact-form.content";

import { useState } from "react";
import {
  Field,
  Input,
  Textarea,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  Button,
  Heading,
  Text,
  Spinner,
  Alert,
  toast,
} from "@hulianui/ui";
import { Send, AlertCircle } from "lucide-react";
import { usePending } from "../../lib/async";

const inquiryTypes = [
  { value: "sales", label: copy("learnAboutPackagesAndQuotes") },
  { value: "demo", label: copy("bookAProductDemo") },
  { value: "migration", label: copy("migrationAndTechnologyAssessment") },
  { value: "support", label: copy("technicalSupport") },
  { value: "other", label: copy("other") },
];

interface FormState {
  name: string;
  email: string;
  company: string;
  type: string;
  message: string;
}

type Errors = Partial<Record<keyof FormState, string>>;

const empty: FormState = { name: "", email: "", company: "", type: "", message: "" };

function validate(values: FormState): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = copy("enterYourName");
  if (!values.email.trim()) errors.email = copy("enterYourEmailAddress");
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = copy("enterAValidEmailAddress");
  if (!values.type) errors.type = copy("selectAnInquiryType");
  if (!values.message.trim()) errors.message = copy("brieflyDescribeWhatYouNeed");
  return errors;
}

// 演示：第一次提交模拟失败（展示错误 Alert），第二次成功。
let _submitCount = 0;

export function ContactForm() {
  const [values, setValues] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, run] = usePending();

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      toast({ title: copy("pleaseCheckTheForm"), description: copy("completeTheRequiredFieldsAndCorrectAnyInvalidEntries"), tone: "danger" });
      return;
    }
    setSubmitError(null);
    void run(async () => {
      _submitCount += 1;
      // 演示：第一次提交模拟后端 500，展示内联 Alert 错误态；第二次成功。
      if (_submitCount === 1) {
        setSubmitError(copy("theServerIsBusyTryAgainShortlySimulatedDemoFailure"));
        return;
      }
      const email = values.email;
      setValues(empty);
      toast({
        title: copy("receivedThankYou"),
        description: `${copy("ourTeamWillContactYouAt")}${email}${copy("shortly")}`,
        tone: "success",
      });
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <Heading level={2} size="xl" weight="semibold" className="text-foreground">

          {copy("contactUs")}
        </Heading>
        <Text tone="muted" size="sm" className="mt-1">

          {copy("leaveYourDetailsAndWeLlReplyWithinOneBusinessDay")}
        </Text>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={copy("name")} error={errors.name} name="name">
          <Input
            placeholder={copy("yourName")}
            value={values.name}
            invalid={Boolean(errors.name)}
            onChange={(e) => set("name", e.target.value)}
          />
        </Field>
        <Field label={copy("companyEmail")} error={errors.email} name="email">
          <Input
            type="email"
            placeholder="you@company.com"
            value={values.email}
            invalid={Boolean(errors.email)}
            onChange={(e) => set("email", e.target.value)}
          />
        </Field>
      </div>

      <Field label={copy("companyTeam")} description={copy("optional")} name="company">
        <Input
          placeholder={copy("companyOrTeamName")}
          value={values.company}
          onChange={(e) => set("company", e.target.value)}
        />
      </Field>

      <Field label={copy("inquiryType")} error={errors.type} name="type">
        <Select
          items={inquiryTypes}
          placeholder={copy("pleaseSelect")}
          value={values.type || null}
          onValueChange={(v) => set("type", (v as string) ?? "")}
        >
          <SelectTrigger invalid={Boolean(errors.type)} />
          <SelectContent>
            {inquiryTypes.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label={copy("leaveAMessage")} error={errors.message} name="message">
        <Textarea
          placeholder={copy("brieflyDescribeYourBusinessScenarioAndGoals")}
          rows={4}
          autoResize
          value={values.message}
          invalid={Boolean(errors.message)}
          onChange={(e) => set("message", e.target.value)}
        />
      </Field>

      {submitError && (
        <Alert
          tone="danger"
          variant="soft"
          icon={<AlertCircle />}
          title={copy("submissionFailed")}
          onClose={() => setSubmitError(null)}
        >
          {submitError}{copy("tryAgainTheDemoWillSimulateASuccessfulSubmission")}
        </Alert>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="w-full sm:w-auto"
      >
        {pending ? (
          <Spinner size="sm" tone="current" className="mr-2" />
        ) : (
          <Send className="mr-2 size-4" aria-hidden />
        )}
        {pending ? copy("submitting") : copy("submitInquiry")}
      </Button>
    </form>
  );
}
