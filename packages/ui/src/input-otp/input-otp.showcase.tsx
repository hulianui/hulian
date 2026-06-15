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
  examples: [
    {
      title: "基础用法",
      description: "6 位数字验证码，自动跳格、退格回退、整段粘贴自动分配。",
      code: `<InputOTP length={6} value={otp} onChange={setOtp} onComplete={verify} />`,
      render: () => <InputOTP length={6} defaultValue="123" />,
    },
    {
      title: "分组分隔",
      description: "groupGap 在中间插入横线，呈现 3-3 分组视觉。",
      code: `<InputOTP length={6} groupGap value={otp} onChange={setOtp} />`,
      render: () => <InputOTP length={6} groupGap defaultValue="12" />,
    },
    {
      title: "任意字符",
      description: 'type="text" 接受字母数字混合的兑换码/邀请码。',
      code: `<InputOTP length={6} type="text" value={code} onChange={setCode} />`,
      render: () => <InputOTP length={6} type="text" defaultValue="AB12" />,
    },
    {
      title: "无效态",
      description: "invalid 标红边框，校验失败时提示重输。",
      code: `<InputOTP length={4} invalid value={otp} onChange={setOtp} />`,
      render: () => <InputOTP length={4} invalid defaultValue="9999" />,
    },
  ],
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
