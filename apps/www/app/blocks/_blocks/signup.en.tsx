"use client";
import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { AuthPanel, Brand, Field, Input, Checkbox, Button, Divider, SocialButton, Heading, Text, AuroraText, Spinner, toast, } from "@hulianui/ui";
import { Rocket } from "lucide-react";
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
interface FormState {
    name: string;
    email: string;
    password: string;
}
type Errors = Partial<Record<keyof FormState | "agree", string>>;
const empty: FormState = { name: "", email: "", password: "" };
function scorePassword(pw: string): number {
    let score = 0;
    if (pw.length >= 8)
        score += 1;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw))
        score += 1;
    if (/\d/.test(pw))
        score += 1;
    if (/[^A-Za-z0-9]/.test(pw))
        score += 1;
    return score;
}
const strengthMeta = [
    { label: "Very weak", tone: "var(--color-danger)" },
    { label: "Weak", tone: "var(--color-danger)" },
    { label: "Fair", tone: "var(--color-warning)" },
    { label: "Not bad", tone: "var(--color-success)" },
    { label: "Very strong", tone: "var(--color-success)" },
] as const;
const highlights = [
    "Start free; compute scales to zero when idle",
    "From git push to a global edge deployment",
    "End-to-end observability pinpoints incidents in seconds",
];
export function SignupBlock() {
    const [values, setValues] = useState<FormState>(empty);
    const [agree, setAgree] = useState(false);
    const [errors, setErrors] = useState<Errors>({});
    const [pending, setPending] = useState(false);
    const strength = useMemo(() => scorePassword(values.password), [values.password]);
    const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
        setValues((v) => ({ ...v, [key]: value }));
        setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
    }, []);
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const found: Errors = {};
        if (!values.name.trim())
            found.name = "Enter your name";
        if (!values.email.trim())
            found.email = "Enter your email address";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
            found.email = "Enter a valid email address";
        if (!values.password)
            found.password = "Please set a password";
        else if (values.password.length < 8)
            found.password = "Password must be at least 8 characters";
        if (!agree)
            found.agree = "Read and accept the Terms of Service";
        if (Object.keys(found).length > 0) {
            setErrors(found);
            toast({ title: "Please check the form", description: "Complete the required fields and correct any invalid entries.", tone: "danger" });
            return;
        }
        setPending(true);
        void (async () => {
            try {
                await sleep(700);
                const email = values.email;
                setValues(empty);
                setAgree(false);
                toast({ title: "Registration successful", description: `Verification email has been sent to ${email}.`, tone: "success" });
            }
            finally {
                setPending(false);
            }
        })();
    };
    return (<section className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[var(--radius)] border border-border bg-surface shadow-sm md:grid-cols-2">

      <AuthPanel className="hidden md:flex" brand={<Brand name="HanCloud" mark="Han"/>} title={<>
            Take your ideas to the <AuroraText>global edge</AuroraText>
          </>} description="Create an account and start your first project in five minutes. No credit card required." highlights={highlights}/>


      <div className="p-8 sm:p-10">
        <Heading level={1} size="xl" weight="semibold" className="text-foreground">
          Create your account
        </Heading>
        <Text tone="muted" size="sm" className="mt-1">
          Already have an account?{" "}
          <Link href="#" className="font-medium text-primary underline-offset-4 hover:underline">
            Log in directly
          </Link>
        </Text>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
          <Field label="name" error={errors.name} name="name">
            <Input placeholder="your name" value={values.name} invalid={Boolean(errors.name)} onChange={(e) => set("name", e.target.value)}/>
          </Field>

          <Field label="Email" error={errors.email} name="email">
            <Input type="email" placeholder="you@company.com" value={values.email} invalid={Boolean(errors.email)} onChange={(e) => set("email", e.target.value)}/>
          </Field>

          <Field label="Password" error={errors.password} description={!errors.password ? "At least 8 characters, preferably uppercase and lowercase letters, numbers and symbols" : undefined} name="password">
            <Input type="password" placeholder="Set a secure password" value={values.password} invalid={Boolean(errors.password)} onChange={(e) => set("password", e.target.value)}/>
          </Field>


          {values.password.length > 0 && (<div aria-live="polite">
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map((i) => (<span key={i} className="h-1.5 flex-1 rounded-full bg-surface-hover" style={i < strength ? { background: strengthMeta[strength].tone } : undefined}/>))}
              </div>
              <Text size="xs" tone="muted" className="mt-1.5">
                Password strength:{strengthMeta[strength].label}
              </Text>
            </div>)}

          <div>
            <Checkbox checked={agree} onCheckedChange={(c) => {
            setAgree(c);
            if (c)
                setErrors((e) => (e.agree ? { ...e, agree: undefined } : e));
        }} label={<span className="text-sm text-foreground">
                  I have read and agree to the{" "}
                  <Link href="#" className="text-primary underline-offset-4 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-primary underline-offset-4 hover:underline">
                    Privacy Policy
                  </Link>
                </span>}/>
            {errors.agree && (<Text size="xs" className="mt-1.5 text-danger">
                {errors.agree}
              </Text>)}
          </div>

          <Button type="submit" size="lg" disabled={pending} className="w-full">
            {pending ? (<Spinner size="sm" tone="current" className="mr-2"/>) : (<Rocket className="mr-2 size-4" aria-hidden/>)}
            {pending ? "Creating..." : "Create account"}
          </Button>
        </form>

        <Divider plain className="my-6 text-muted-foreground">
          Or sign up with
        </Divider>

        <div className="grid gap-3 sm:grid-cols-2">
          <SocialButton provider="github" className="w-full justify-center">
            GitHub
          </SocialButton>
          <SocialButton provider="google" className="w-full justify-center">
            Google
          </SocialButton>
        </div>
      </div>
    </section>);
}
