"use client";
import { useCallback, useState } from "react";
import { Field, Input, Textarea, Select, SelectTrigger, SelectContent, SelectItem, Button, Heading, Text, Spinner, Alert, toast, } from "@hulianui/ui";
import { Send, AlertCircle } from "lucide-react";
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const jitter = (min = 300, max = 600) => min + Math.floor(Math.random() * (max - min));
function usePending() {
    const [pending, setPending] = useState(false);
    const run = useCallback(async (fn: () => void | Promise<void>) => {
        setPending(true);
        try {
            await sleep(jitter());
            await fn();
        }
        finally {
            setPending(false);
        }
    }, []);
    return [pending, run] as const;
}
const inquiryTypes = [
    { value: "sales", label: "Learn about packages and quotes" },
    { value: "demo", label: "Book a product demo" },
    { value: "migration", label: "Migration and Technology Assessment" },
    { value: "support", label: "Technical support" },
    { value: "other", label: "Other" },
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
    if (!values.name.trim())
        errors.name = "Enter your name";
    if (!values.email.trim())
        errors.email = "Enter your email address";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
        errors.email = "Enter a valid email address";
    if (!values.type)
        errors.type = "Select an inquiry type";
    if (!values.message.trim())
        errors.message = "Briefly describe what you need";
    return errors;
}
let _submitCount = 0;
export function ContactFormBlock() {
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
            toast({ title: "Please check the form", description: "Complete the required fields and correct any invalid entries.", tone: "danger" });
            return;
        }
        setSubmitError(null);
        void run(async () => {
            _submitCount += 1;
            if (_submitCount === 1) {
                setSubmitError("The server is busy. Try again shortly (simulated demo failure).");
                return;
            }
            const email = values.email;
            setValues(empty);
            toast({
                title: "Received, thank you!",
                description: `Our team will contact you at ${email} shortly.`,
                tone: "success",
            });
        });
    };
    return (<form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <Heading level={2} size="xl" weight="semibold" className="text-foreground">
          Contact us
        </Heading>
        <Text tone="muted" size="sm" className="mt-1">
          Leave your details and we'll reply within one business day.
        </Text>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" error={errors.name} name="name">
          <Input placeholder="Your name" value={values.name} invalid={Boolean(errors.name)} onChange={(e) => set("name", e.target.value)}/>
        </Field>
        <Field label="Company email" error={errors.email} name="email">
          <Input type="email" placeholder="you@company.com" value={values.email} invalid={Boolean(errors.email)} onChange={(e) => set("email", e.target.value)}/>
        </Field>
      </div>

      <Field label="Company / team" description="Optional" name="company">
        <Input placeholder="Company or team name" value={values.company} onChange={(e) => set("company", e.target.value)}/>
      </Field>

      <Field label="Inquiry type" error={errors.type} name="type">
        <Select items={inquiryTypes} placeholder="Please select" value={values.type || null} onValueChange={(v) => set("type", (v as string) ?? "")}>
          <SelectTrigger invalid={Boolean(errors.type)}/>
          <SelectContent>
            {inquiryTypes.map((t) => (<SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Leave a message" error={errors.message} name="message">
        <Textarea placeholder="Briefly describe your business scenario and goals..." rows={4} autoResize value={values.message} invalid={Boolean(errors.message)} onChange={(e) => set("message", e.target.value)}/>
      </Field>

      {submitError && (<Alert tone="danger" variant="soft" icon={<AlertCircle />} title="Submission failed" onClose={() => setSubmitError(null)}>
          {submitError}Try again; the demo will simulate a successful submission.
        </Alert>)}

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? (<Spinner size="sm" tone="current" className="mr-2"/>) : (<Send className="mr-2 size-4" aria-hidden/>)}
        {pending ? "Submitting..." : "Submit inquiry"}
      </Button>
    </form>);
}
