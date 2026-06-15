"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { SocialButton } from "./social-button";
import type { SocialProvider } from "./social-button.types";

const CHINA: SocialProvider[] = ["wechat", "alipay", "qq", "weibo"];
const GLOBAL: SocialProvider[] = ["github", "google", "apple", "x"];

export const socialButtonShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "传 provider 即得品牌 logo + 默认登录文案。",
      code: `<SocialButton provider="wechat" />`,
      render: () => <SocialButton provider="wechat" />,
    },
    {
      title: "国内 / 国际平台",
      description: "内置微信/支付宝/QQ/微博与 GitHub/Google/Apple/X 等品牌。",
      code: `<>
  <SocialButton provider="wechat" />
  <SocialButton provider="alipay" />
  <SocialButton provider="github" />
  <SocialButton provider="google" />
</>`,
      render: () => (
        <div className="flex flex-wrap gap-3">
          <SocialButton provider="wechat" />
          <SocialButton provider="alipay" />
          <SocialButton provider="github" />
          <SocialButton provider="google" />
        </div>
      ),
    },
    {
      title: "填充变体",
      description: "variant=solid 用品牌色填充（黑白系品牌随主题前景）。",
      code: `<>
  <SocialButton provider="wechat" variant="solid" />
  <SocialButton provider="github" variant="solid" />
</>`,
      render: () => (
        <div className="flex flex-wrap gap-3">
          <SocialButton provider="wechat" variant="solid" />
          <SocialButton provider="github" variant="solid" />
        </div>
      ),
    },
    {
      title: "纯 logo 方钮",
      description: "shape=icon 只渲染品牌 logo，适合紧凑工具条。",
      code: `<>
  <SocialButton provider="wechat" shape="icon" />
  <SocialButton provider="alipay" shape="icon" variant="solid" />
</>`,
      render: () => (
        <div className="flex flex-wrap gap-2">
          <SocialButton provider="wechat" shape="icon" />
          <SocialButton provider="alipay" shape="icon" variant="solid" />
        </div>
      ),
    },
    {
      title: "尺寸 / 加载 / 禁用",
      description: "size 三档；loading 转圈并禁用，disabled 屏蔽交互。",
      code: `<>
  <SocialButton provider="wechat" size="sm" />
  <SocialButton provider="wechat" size="lg" />
  <SocialButton provider="github" loading />
  <SocialButton provider="google" disabled />
</>`,
      render: () => (
        <div className="flex flex-wrap items-center gap-3">
          <SocialButton provider="wechat" size="sm" />
          <SocialButton provider="wechat" size="lg" />
          <SocialButton provider="github" loading />
          <SocialButton provider="google" disabled />
        </div>
      ),
    },
  ],
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
