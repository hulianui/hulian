"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { InputOTP } from "../../../../packages/ui/src/input-otp/input-otp";
function OTPDemo(props: {
    length?: number;
    type?: "numeric" | "text";
    groupGap?: boolean;
    invalid?: boolean;
}) {
    const [v, setV] = useState("");
    return (<div className="flex flex-col items-center gap-2">
      <InputOTP value={v} onChange={setV} {...props}/>
      <span className="text-xs text-muted">{v || "(Enter verification code)"}</span>
    </div>);
}
export const inputOtpShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "6-digit verification code, automatically assigned to skip spaces, backspaces, and paste the entire paragraph.",
            code: `<InputOTP length={6} value={otp} onChange={setOtp} onComplete={verify} />`,
            render: () => <InputOTP length={6} defaultValue="123"/>,
        },
        {
            title: "Group separation",
            description: "groupGap Insert a horizontal line in the middle to present a 3-3 grouping vision.",
            code: `<InputOTP length={6} groupGap value={otp} onChange={setOtp} />`,
            render: () => <InputOTP length={6} groupGap defaultValue="12"/>,
        },
        {
            title: "Any character",
            description: "type=\"text\" Accepts alphanumeric redemption codes/invitation codes.",
            code: `<InputOTP length={6} type="text" value={code} onChange={setCode} />`,
            render: () => <InputOTP length={6} type="text" defaultValue="AB12"/>,
        },
        {
            title: "Invalid state",
            description: "invalid is marked with a red border and will prompt you to re-enter when the verification fails.",
            code: `<InputOTP length={4} invalid value={otp} onChange={setOtp} />`,
            render: () => <InputOTP length={4} invalid defaultValue="9999"/>,
        },
    ],
    controls: [
        { prop: "length", type: "number", defaultValue: 6 },
        { prop: "type", type: "select", options: ["numeric", "text"], defaultValue: "numeric" },
        { prop: "invalid", type: "boolean", defaultValue: false },
    ],
    states: [
        { name: "numeric-6", render: () => <OTPDemo length={6}/> },
        { name: "grouped-3-3", render: () => <OTPDemo length={6} groupGap/> },
        { name: "invalid", render: () => <OTPDemo length={4} invalid/> },
    ],
    renderWithProps: (p) => (<OTPDemo length={(p.length as number) ?? 6} type={(p.type as "numeric" | "text") ?? "numeric"} invalid={Boolean(p.invalid)}/>),
    toCode: (p) => `<InputOTP
  length={${(p.length as number) ?? 6}}
  type="${(p.type as string) ?? "numeric"}"${p.invalid ? "\n  invalid" : ""}
  value={otp}
  onChange={setOtp}
  onComplete={verify}
/>`,
};
