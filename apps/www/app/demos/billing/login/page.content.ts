import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "wechat": "微信",
    "alipay": "支付宝",
    "han": "瀚",
    "loginSuccessfulEnteringTheConsole": "登录成功，正在进入控制台",
    "email": "邮箱",
    "password": "密码",
    "login": "登录",
    "orUseTheFollowing": "或使用以下方式",
    "alreadyLoggedInViaValue": "已通过{0}登录",
    "login2": "使用 {0} 登录",
    "logInUsingValue": "使用 {0} 登录",
    "alreadyLoggedInWithValue": "已通过 {0} 登录",
    "demonstrationEnvironmentFillInAnyFormOr": "演示环境：任意填写或点任一方式即可进入控制台",
  },
  en: {
    "wechat": "WeChat",
    "alipay": "Alipay",
    "han": "Han",
    "loginSuccessfulEnteringTheConsole": "Signed in. Opening the console...",
    "email": "Email",
    "password": "Password",
    "login": "Login",
    "orUseTheFollowing": "Or continue with",
    "alreadyLoggedInViaValue": "Signed in with {0}",
    "login2": "Continue with {0}",
    "logInUsingValue": "Continue with {0}",
    "alreadyLoggedInWithValue": "Signed in with {0}",
    "demonstrationEnvironmentFillInAnyFormOr": "Demo environment: use any credentials or sign-in method to continue.",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-billing-login-page",
  content: t(content),
};

export default dictionary;
