"use client";

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
  { value: "sales", label: "了解套餐与报价" },
  { value: "demo", label: "预约产品演示" },
  { value: "migration", label: "迁移与技术评估" },
  { value: "support", label: "技术支持" },
  { value: "other", label: "其他" },
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
  if (!values.name.trim()) errors.name = "请填写称呼";
  if (!values.email.trim()) errors.email = "请填写邮箱";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "邮箱格式不正确";
  if (!values.type) errors.type = "请选择需求类型";
  if (!values.message.trim()) errors.message = "请简单描述你的需求";
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
      toast({ title: "请检查表单", description: "还有必填项未填写或格式不正确。", tone: "danger" });
      return;
    }
    setSubmitError(null);
    void run(async () => {
      _submitCount += 1;
      // 演示：第一次提交模拟后端 500，展示内联 Alert 错误态；第二次成功。
      if (_submitCount === 1) {
        setSubmitError("服务器繁忙，请稍后重试（演示模拟失败）。");
        return;
      }
      const email = values.email;
      setValues(empty);
      toast({
        title: "已收到，谢谢！",
        description: `我们的团队会尽快通过 ${email} 与你联系。`,
        tone: "info",
      });
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <Heading level={2} size="xl" weight="semibold" className="text-foreground">
          联系我们
        </Heading>
        <Text tone="muted" size="sm" className="mt-1">
          留下信息，我们会在一个工作日内回复。
        </Text>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="称呼" error={errors.name} name="name">
          <Input
            placeholder="你怎么称呼"
            value={values.name}
            invalid={Boolean(errors.name)}
            onChange={(e) => set("name", e.target.value)}
          />
        </Field>
        <Field label="公司邮箱" error={errors.email} name="email">
          <Input
            type="email"
            placeholder="you@company.com"
            value={values.email}
            invalid={Boolean(errors.email)}
            onChange={(e) => set("email", e.target.value)}
          />
        </Field>
      </div>

      <Field label="公司 / 团队" description="选填" name="company">
        <Input
          placeholder="公司或团队名称"
          value={values.company}
          onChange={(e) => set("company", e.target.value)}
        />
      </Field>

      <Field label="需求类型" error={errors.type} name="type">
        <Select
          items={inquiryTypes}
          placeholder="请选择"
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

      <Field label="留言" error={errors.message} name="message">
        <Textarea
          placeholder="简单描述你的业务场景与目标……"
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
          title="提交失败"
          onClose={() => setSubmitError(null)}
        >
          {submitError}再点一次试试，演示将模拟成功提交。
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
        {pending ? "提交中…" : "提交需求"}
      </Button>
    </form>
  );
}
