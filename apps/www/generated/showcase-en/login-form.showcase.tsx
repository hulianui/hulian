"use client";
import { useState } from "react";
import { AuthPanel } from "../../../../packages/ui/src/auth-panel/auth-panel";
import { Link } from "../../../../packages/ui/src/link";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { LoginForm } from "../../../../packages/ui/src/login-form/login-form";
const iconProps = {
    "aria-hidden": true,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "size-4",
};
const UserIcon = () => (<svg {...iconProps}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>);
const KeyIcon = () => (<svg {...iconProps}>
    <path d="m15.5 7.5 3 3L22 7l-3-3"/>
    <path d="m21 2-9.6 9.6"/>
    <circle cx="7.5" cy="15.5" r="5.5"/>
  </svg>);
function Demo() {
    const [user, setUser] = useState<string | null>(null);
    return (<div className="flex min-h-[560px] w-full items-center justify-center rounded-[var(--radius)] border border-border p-6" style={{
            background: "radial-gradient(125% 125% at 50% 0%, color-mix(in oklab, var(--color-primary) 8%, var(--color-bg)) 0%, var(--color-bg) 60%)",
        }}>
      <div className="flex w-full max-w-md flex-col items-stretch gap-3">
        <LoginForm logo={<span className="inline-flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">Hu</span>
              <span className="text-base font-semibold tracking-tight">Hulian Admin</span>
            </span>} subtitle="Welcome back, please log in to your management background" onFinish={async (v) => {
            await new Promise((r) => setTimeout(r, 700));
            setUser(`${v.username}${v.remember ? "(remembered)" : ""}`);
        }} footer={<div className="flex justify-between text-sm">
              <Link href="#">Forgot password</Link>
              <Link href="#">Register an account</Link>
            </div>}/>
        {user && (<p className="text-center text-sm text-muted" role="status">
            Logging in:{user}
          </p>)}
      </div>
    </div>);
}
function EscapeHatchDemo() {
    const [values, setValues] = useState({ username: "", password: "", remember: false });
    const [passed, setPassed] = useState(false);
    const [log, setLog] = useState<string | null>(null);
    return (<div className="flex w-full max-w-md flex-col gap-3">
      <LoginForm rules={{
            username: [{ pattern: /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/, message: "The account number must start with a letter, 3~16 characters/numbers/underscores" }],
            password: [{ min: 6, max: 32, message: "Password 6~32 characters" }],
        }} values={values} onValuesChange={(_changed, all) => setValues(all)} extra={<label className="flex items-center gap-2 rounded-[var(--radius)] border border-dashed border-border p-3 text-sm text-muted">
            <input type="checkbox" checked={passed} onChange={(e) => setPassed(e.target.checked)}/>
            Simulated human-machine verification (real scene ClickCaptcha)
          </label>} beforeSubmit={async () => {
            if (!passed) {
                setLog("beforeSubmit Return false \u2192 Submission aborted");
                return false;
            }
            await new Promise((r) => setTimeout(r, 500));
        }} onFinish={({ username }) => setLog(`onFinish:${username} Logging in`)}/>
      <p className="text-xs text-muted">
        External real-time value:{values.username || "\u2014"} / {values.password ? "\u2022".repeat(values.password.length) : "\u2014"}
      </p>
      {log && (<p className="text-xs text-muted" role="status">
          {log}
        </p>)}
    </div>);
}
export const loginFormShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Self-management useForm: Account/Password required + Remember me + Asynchronous submission loading.",
            code: `<LoginForm
  onFinish={async ({ username, password, remember }) => {
    await api.login(username, password, remember);
  }}
/>`,
            render: () => (<div className="w-full max-w-md">
          <LoginForm onFinish={async () => {
                    await new Promise((r) => setTimeout(r, 700));
                }}/>
        </div>),
        },
        {
            title: "Brand logo + Subtitle",
            description: "logo is used as the brand logo on the upper left corner of the head, and subtitle is used as the guidance copy.",
            code: `<LoginForm
  logo={<Logo />}
  subtitle="Welcome back, please log in to your management background"
  onFinish={({ username }) => console.log(username)}
/>`,
            render: () => (<div className="w-full max-w-md">
          <LoginForm logo={<span className="inline-flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                  Hu
                </span>
                <span className="text-base font-semibold tracking-tight">Hulian Admin</span>
              </span>} subtitle="Welcome back, please log in to your management background" onFinish={() => { }}/>
        </div>),
        },
        {
            title: "Bottom link area",
            description: "footer Forgot password/registration and other additional operations, with top divider.",
            code: `<LoginForm
  footer={
    <div className="flex justify-between text-sm">
      <Link href="/forgot">Forgot password</Link>
      <Link href="/register">Register account</Link>
    </div>
  }
  onFinish={() => {}}
/>`,
            render: () => (<div className="w-full max-w-md">
          <LoginForm footer={<div className="flex justify-between text-sm">
                <Link href="#">Forgot password</Link>
                <Link href="#">Register an account</Link>
              </div>} onFinish={() => { }}/>
        </div>),
        },
        {
            title: "Custom verification + controlled value + interception before submission",
            description: "rules adds format constraints (built-in required but still runs first); values/onValuesChange lets the outside get the real-time value; beforeSubmit inserts a step (verification code, etc.) before onFinish, returns false and aborts.",
            code: `<LoginForm
  rules={{
    username: [{ pattern: /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/, message: "The account format is incorrect" }],
    password: [{ min: 6, message: "Password must be at least 6 characters" }],
  }}
  values={values}
  onValuesChange={(_changed, all) => setValues(all)}
  extra={<ClickCaptcha backgroundSrc={captcha.background} onComplete={setPoints} />}
  beforeSubmit={async () => {
    if (points.length < 3) return false; // Verification code not passed \u2192 Abort submission
    await verifyCaptcha(points);
  }}
  onFinish={({ username }) => api.login(username)}
/>`,
            render: () => <EscapeHatchDemo />,
        },
        {
            title: "Field appearance slot (label / placeholder / prefix)",
            description: "fields only covers appearance - value, validation, autoComplete default value is still managed by the template, so changing to label will not lose the browser's account/password autofill. The fields in the business are called \"Administrator Account\", \"Work ID\" and \"Mobile Phone Number\", or use it when you want to put a human/key icon in the frame. There is no need to dismantle the entire template for this purpose.",
            code: `<LoginForm
  fields={{
    username: { label: "Administrator account", placeholder: "Please enter the account number", prefix: <UserRound /> },
    password: { placeholder: "Please enter your password", prefix: <KeyRound /> },
  }}
/>`,
            render: () => (<div className="w-full max-w-md">
          <LoginForm fields={{
                    username: { label: "Administrator account", placeholder: "Please enter your account number", prefix: <UserIcon /> },
                    password: { placeholder: "Please enter password", prefix: <KeyIcon /> },
                }} onFinish={() => { }}/>
        </div>),
        },
        {
            title: "Split-screen login page (surface={false})",
            description: "When the left brand panel + the right form is used, the visual weight is already borne by AuthPanel. Another card on the right half is the card within the card. surface={false} Turn off the border/background/shadow/padding together, and give the surface to the outer layer - there is no need to use className to offset the surface of the inventory item one by one.",
            code: `<div className="grid xl:grid-cols-2">
  <AuthPanel title="Welcome back" description="Unified identity authentication platform" />
  <div className="grid place-items-center p-8">
    <LoginForm surface={false} />
  </div>
</div>`,
            render: () => (<div className="grid overflow-hidden rounded-[var(--radius)] border border-border sm:grid-cols-2">
          <AuthPanel title="Welcome back" description="Unified identity authentication platform" className="hidden sm:flex"/>
          <div className="grid place-items-center p-6">
            <LoginForm surface={false} showRemember={false} onFinish={() => { }}/>
          </div>
        </div>),
        },
        {
            title: "HideRemember Me",
            description: "showRemember={false} Remove the \"Remember Me\" check (if persistent sessions are not supported).",
            code: `<LoginForm showRemember={false} onFinish={() => {}} />`,
            render: () => (<div className="w-full max-w-md">
          <LoginForm showRemember={false} onFinish={() => { }}/>
        </div>),
        },
    ],
    controls: [],
    states: [{ name: "Login template \u00B7 Verification + Remember me + Asynchronous submission", render: () => <Demo /> }],
    renderWithProps: () => <Demo />,
    toCode: () => `<LoginForm
  logo={<Logo />}
  onFinish={async ({ username, password, remember }) => {
    await api.login(username, password, remember);
  }}
  footer={<Link href="/forgot">Forgot password</Link>}
/>`,
};
