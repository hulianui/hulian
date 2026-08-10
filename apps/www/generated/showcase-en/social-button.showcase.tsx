"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { SocialButton } from "../../../../packages/ui/src/social-button/social-button";
import type { SocialBrand, SocialProvider } from "../../../../packages/ui/src/social-button/social-button.types";
const CHINA: SocialProvider[] = ["wechat", "alipay", "qq", "weibo"];
const GLOBAL: SocialProvider[] = ["github", "google", "apple", "x", "discord", "gitlab"];
const KEYCLOAK: SocialBrand = {
    label: "Enterprise SSO",
    icon: (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25V9.75H6A2.25 2.25 0 0 0 3.75 12v8.25A2.25 2.25 0 0 0 6 22.5h12a2.25 2.25 0 0 0 2.25-2.25V12A2.25 2.25 0 0 0 18 9.75h-.75V6.75A5.25 5.25 0 0 0 12 1.5Zm0 2.25a3 3 0 0 1 3 3V9.75H9V6.75a3 3 0 0 1 3-3Zm0 10.5a1.875 1.875 0 0 1 .938 3.5V19.5a.938.938 0 0 1-1.876 0v-1.75A1.875 1.875 0 0 1 12 14.25Z"/>
    </svg>),
};
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
            title: "Custom provider (an IdP outside the enum)",
            description: "Pass an object to provider to support self-hosted OIDC or any brand that is not bundled; the skin is identical to the built-in providers. Omitting brandColor selects the monochrome treatment.",
            code: `// Keep it at module scope: the component uses memo, and an inline object breaks memo
const KEYCLOAK: SocialBrand = { label: "Enterprise SSO", icon: <LockIcon /> };

<SocialButton provider={KEYCLOAK} />`,
            render: () => (<div className="flex flex-wrap gap-3">
          <SocialButton provider={KEYCLOAK}/>
          <SocialButton provider={KEYCLOAK} variant="solid"/>
          <SocialButton provider={KEYCLOAK} shape="icon"/>
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
        { prop: "provider", type: "select", options: ["wechat", "alipay", "qq", "weibo", "github", "google", "apple", "x", "discord", "gitlab"], defaultValue: "wechat" },
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
            name: "Custom provider (an IdP outside the enum)",
            render: () => (<div className="flex flex-wrap gap-3">
          <SocialButton provider={KEYCLOAK} className="w-56"/>
          <SocialButton provider={KEYCLOAK} variant="solid" className="w-56"/>
          <SocialButton provider={KEYCLOAK} shape="icon"/>
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
            name: "Size",
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
