import type { ReactNode } from "react";

export interface LoginValues {
  username: string;
  password: string;
  remember: boolean;
}

export interface LoginFormProps {
  /** 标题（默认 locale.loginForm.title）。 */
  title?: ReactNode;
  /** 品牌 logo（标题上方居中）。 */
  logo?: ReactNode;
  /** 提交回调（校验通过后）。返回 Promise → 提交按钮 loading。 */
  onFinish?: (values: LoginValues) => void | Promise<void>;
  /** 外部 loading 覆盖（如父层托管提交态）。 */
  loading?: boolean;
  /** 显示「记住我」，默认 true。 */
  showRemember?: boolean;
  /** 底部附加区（忘记密码 / 注册链接等）。 */
  footer?: ReactNode;
  className?: string;
}
