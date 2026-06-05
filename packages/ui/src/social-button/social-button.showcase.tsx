"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { SocialButton } from "./social-button";
import type { SocialProvider } from "./social-button.types";

const CHINA: SocialProvider[] = ["wechat", "alipay", "qq", "weibo"];
const GLOBAL: SocialProvider[] = ["github", "google", "apple", "x"];

export const socialButtonShowcase: ShowcaseSpec = {
  controls: [
    { prop: "provider", type: "select", options: ["wechat", "alipay", "qq", "weibo", "github", "google", "apple", "x"], defaultValue: "wechat" },
    { prop: "variant", type: "select", options: ["outline", "solid"], defaultValue: "outline" },
    { prop: "shape", type: "select", options: ["button", "icon"], defaultValue: "button" },
  ],
  states: [
    {
      name: "国内平台（outline）",
      render: () => (
        <div className="flex flex-col gap-3">
          {CHINA.map((p) => (
            <SocialButton key={p} provider={p} className="w-56" />
          ))}
        </div>
      ),
    },
    {
      name: "国际平台（outline）",
      render: () => (
        <div className="flex flex-col gap-3">
          {GLOBAL.map((p) => (
            <SocialButton key={p} provider={p} className="w-56" />
          ))}
        </div>
      ),
    },
    {
      name: "solid 填充",
      render: () => (
        <div className="flex flex-wrap gap-3">
          {(["wechat", "alipay", "weibo", "github", "apple"] as SocialProvider[]).map((p) => (
            <SocialButton key={p} provider={p} variant="solid" />
          ))}
        </div>
      ),
    },
    {
      name: "纯 logo 方钮",
      render: () => (
        <div className="flex flex-wrap gap-2">
          {[...CHINA, ...GLOBAL].map((p) => (
            <SocialButton key={p} provider={p} shape="icon" />
          ))}
        </div>
      ),
    },
    {
      name: "纯 logo 方钮（solid）",
      render: () => (
        <div className="flex flex-wrap gap-2">
          {[...CHINA, ...GLOBAL].map((p) => (
            <SocialButton key={p} provider={p} shape="icon" variant="solid" />
          ))}
        </div>
      ),
    },
    {
      name: "尺寸",
      render: () => (
        <div className="flex items-center gap-3">
          <SocialButton provider="wechat" size="sm" />
          <SocialButton provider="wechat" size="md" />
          <SocialButton provider="wechat" size="lg" />
        </div>
      ),
    },
    {
      name: "加载 / 禁用",
      render: () => (
        <div className="flex flex-wrap gap-3">
          <SocialButton provider="github" loading />
          <SocialButton provider="google" disabled />
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <SocialButton
      provider={(p.provider as SocialProvider) ?? "wechat"}
      variant={(p.variant as "outline" | "solid") ?? "outline"}
      shape={(p.shape as "button" | "icon") ?? "button"}
    />
  ),
  toCode: (p) =>
    `<SocialButton provider="${p.provider ?? "wechat"}"${p.variant && p.variant !== "outline" ? ` variant="${p.variant}"` : ""}${p.shape && p.shape !== "button" ? ` shape="${p.shape}"` : ""} />`,
};
