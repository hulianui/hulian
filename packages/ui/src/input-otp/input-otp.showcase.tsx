"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { InputOTP } from "./input-otp";

function OTPDemo(props: { length?: number; type?: "numeric" | "text"; groupGap?: boolean; invalid?: boolean }) {
  const [v, setV] = useState("");
  return (
    <div className="flex flex-col items-center gap-2">
      <InputOTP value={v} onChange={setV} {...props} />
      <span className="text-xs text-muted">{v || "（输入验证码）"}</span>
    </div>
  );
}

export const inputOtpShowcase: ShowcaseSpec = {
  controls: [
    { prop: "length", type: "number", defaultValue: 6 },
    { prop: "type", type: "select", options: ["numeric", "text"], defaultValue: "numeric" },
    { prop: "invalid", type: "boolean", defaultValue: false },
  ],
  states: [
    { name: "numeric-6", render: () => <OTPDemo length={6} /> },
    { name: "grouped-3-3", render: () => <OTPDemo length={6} groupGap /> },
    { name: "invalid", render: () => <OTPDemo length={4} invalid /> },
  ],
  renderWithProps: (p) => (
    <OTPDemo
      length={(p.length as number) ?? 6}
      type={(p.type as "numeric" | "text") ?? "numeric"}
      invalid={Boolean(p.invalid)}
    />
  ),
  toCode: (p) =>
    `<InputOTP\n  length={${(p.length as number) ?? 6}}\n  type="${(p.type as string) ?? "numeric"}"${
      p.invalid ? "\n  invalid" : ""
    }\n  value={otp}\n  onChange={setOtp}\n  onComplete={verify}\n/>`,
};
