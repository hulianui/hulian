import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    h: "瀚",
    welcomeBackSignInToYourHanshopAccount: "欢迎回来，登录您的瀚选账户",
    signedInWelcomeBack: "登录成功，欢迎回来！",
    contactSupportToResetYourPassword: "请联系客服找回密码",
    forgotPassword: "忘记密码？",
    registrationIsComingSoon: "注册功能开发中",
    createAccount: "立即注册",
    demoModeEnterAnyEmailAndPasswordToSignIn: "演示环境：账号 / 密码任意填写即可登录",
  },
  en: {
    h: "H",
    welcomeBackSignInToYourHanshopAccount: "Welcome back. Sign in to your HanShop account.",
    signedInWelcomeBack: "Signed in. Welcome back!",
    contactSupportToResetYourPassword: "Contact support to reset your password",
    forgotPassword: "Forgot password?",
    registrationIsComingSoon: "Registration is coming soon",
    createAccount: "Create account",
    demoModeEnterAnyEmailAndPasswordToSignIn: "Demo mode: enter any email and password to sign in",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = { key: "demo-shop-login-page", content: t(content) };
export default dictionary;
