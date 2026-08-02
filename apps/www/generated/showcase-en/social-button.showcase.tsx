"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { SocialButton } from "../../../../packages/ui/src/social-button/social-button";
import type { SocialProvider } from "../../../../packages/ui/src/social-button/social-button.types";
const CHINA: SocialProvider[] = ["wechat", "alipay", "qq", "weibo"];
const GLOBAL: SocialProvider[] = ["github", "google", "apple", "x"];
export const socialButtonShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Pass provider to get the brand logo + default login copy.",
            code: `<SocialButton provider="wechat" />`,
            render: () => <SocialButton provider="wechat"/>,
        },
        {
            title: "Domestic / International Platform",
            description: "Built-in WeChat/Alipay/QQ/Weibo and GitHub/Google/Apple/X and other brands.",
            code: `<>
  <SocialButton provider="wechat" />
  <SocialButton provider="alipay" />
  <SocialButton provider="github" />
  <SocialButton provider="google" />
</>`,
            render: () => (<div className="flex flex-wrap gap-3">
          <SocialButton provider="wechat"/>
          <SocialButton provider="alipay"/>
          <SocialButton provider="github"/>
          <SocialButton provider="google"/>
        </div>),
        },
        {
            title: "Filled variant",
            description: "variant=solid Fill with brand color (black and white brand follows the theme foreground).",
            code: `<>
  <SocialButton provider="wechat" variant="solid" />
  <SocialButton provider="github" variant="solid" />
</>`,
            render: () => (<div className="flex flex-wrap gap-3">
          <SocialButton provider="wechat" variant="solid"/>
          <SocialButton provider="github" variant="solid"/>
        </div>),
        },
        {
            title: "Pure logo square button",
            description: "shape=icon Renders only brand logo, suitable for compact toolbars.",
            code: `<>
  <SocialButton provider="wechat" shape="icon" />
  <SocialButton provider="alipay" shape="icon" variant="solid" />
</>`,
            render: () => (<div className="flex flex-wrap gap-2">
          <SocialButton provider="wechat" shape="icon"/>
          <SocialButton provider="alipay" shape="icon" variant="solid"/>
        </div>),
        },
        {
            title: "Size/Load/Disable",
            description: "size third gear; loading circles and disables, disabled blocks interaction.",
            code: `<>
  <SocialButton provider="wechat" size="sm" />
  <SocialButton provider="wechat" size="lg" />
  <SocialButton provider="github" loading />
  <SocialButton provider="google" disabled />
</>`,
            render: () => (<div className="flex flex-wrap items-center gap-3">
          <SocialButton provider="wechat" size="sm"/>
          <SocialButton provider="wechat" size="lg"/>
          <SocialButton provider="github" loading/>
          <SocialButton provider="google" disabled/>
        </div>),
        },
    ],
    controls: [
        { prop: "provider", type: "select", options: ["wechat", "alipay", "qq", "weibo", "github", "google", "apple", "x"], defaultValue: "wechat" },
        { prop: "variant", type: "select", options: ["outline", "solid"], defaultValue: "outline" },
        { prop: "shape", type: "select", options: ["button", "icon"], defaultValue: "button" },
    ],
    states: [
        {
            name: "Domestic platform (outline)",
            render: () => (<div className="flex flex-col gap-3">
          {CHINA.map((p) => (<SocialButton key={p} provider={p} className="w-56"/>))}
        </div>),
        },
        {
            name: "International platform (outline)",
            render: () => (<div className="flex flex-col gap-3">
          {GLOBAL.map((p) => (<SocialButton key={p} provider={p} className="w-56"/>))}
        </div>),
        },
        {
            name: "solid Fill",
            render: () => (<div className="flex flex-wrap gap-3">
          {(["wechat", "alipay", "weibo", "github", "apple"] as SocialProvider[]).map((p) => (<SocialButton key={p} provider={p} variant="solid"/>))}
        </div>),
        },
        {
            name: "Pure logo square button",
            render: () => (<div className="flex flex-wrap gap-2">
          {[...CHINA, ...GLOBAL].map((p) => (<SocialButton key={p} provider={p} shape="icon"/>))}
        </div>),
        },
        {
            name: "Pure logo square button (solid)",
            render: () => (<div className="flex flex-wrap gap-2">
          {[...CHINA, ...GLOBAL].map((p) => (<SocialButton key={p} provider={p} shape="icon" variant="solid"/>))}
        </div>),
        },
        {
            name: "Dimensions",
            render: () => (<div className="flex items-center gap-3">
          <SocialButton provider="wechat" size="sm"/>
          <SocialButton provider="wechat" size="md"/>
          <SocialButton provider="wechat" size="lg"/>
        </div>),
        },
        {
            name: "Load / Disable",
            render: () => (<div className="flex flex-wrap gap-3">
          <SocialButton provider="github" loading/>
          <SocialButton provider="google" disabled/>
        </div>),
        },
    ],
    renderWithProps: (p) => (<SocialButton provider={(p.provider as SocialProvider) ?? "wechat"} variant={(p.variant as "outline" | "solid") ?? "outline"} shape={(p.shape as "button" | "icon") ?? "button"}/>),
    toCode: (p) => `<SocialButton provider="${p.provider ?? "wechat"}"${p.variant && p.variant !== "outline" ? ` variant="${p.variant}"` : ""}${p.shape && p.shape !== "button" ? ` shape="${p.shape}"` : ""} />`,
};
