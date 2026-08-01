import type { ReactNode } from "react";
import type { FormRule } from "../form/rules";

export interface LoginValues {
  username: string;
  password: string;
  remember: boolean;
}

/** 字段级校验规则（沿用 useForm / Form 的 FormRule 形状）。内置必填规则始终先跑，这里的规则在其后追加。 */
export interface LoginFormRules {
  username?: FormRule[];
  password?: FormRule[];
}

export interface LoginFormProps {
  /** 标题（默认 locale.loginForm.title）。 */
  title?: ReactNode;
  /** 副标题（标题下方的引导文案，左对齐·muted）。 */
  subtitle?: ReactNode;
  /** 品牌 logo（头部左上·作为品牌标）。 */
  logo?: ReactNode;
  /** 提交回调（校验 + beforeSubmit 通过后）。返回 Promise → 提交按钮 loading。 */
  onFinish?: (values: LoginValues) => void | Promise<void>;
  /** 外部 loading 覆盖（如父层托管提交态）。 */
  loading?: boolean;
  /** 显示「记住我」，默认 true。 */
  showRemember?: boolean;
  /**
   * 「记住我」的标签文案，覆盖 locale 默认值。
   * 这个勾选并不总是「下次免登录」的体验糖——有的系统里它是**刷新令牌能力开关**
   * （勾上才下发 refresh_token），文案是刻意写的，锁死在 locale 就没法用了
   * （hulianui/hulian#64）。
   */
  rememberLabel?: ReactNode;
  /** 「记住我」下方的一行说明（解释这个勾选到底意味着什么）。 */
  rememberDescription?: ReactNode;
  /** 底部附加区（忘记密码 / 注册链接等）。 */
  footer?: ReactNode;
  /** 字段级校验规则（追加在内置必填之后）。 */
  rules?: LoginFormRules;
  /**
   * 受控值：传入即受控（外部持有 username/password/remember 的实时值），
   * 需配合 onValuesChange 回写；不传则维持组件内部自管。
   */
  values?: Partial<LoginValues>;
  /** 任一字段变化时回调：(本次变化项, 全量值)。受控时用它回写，非受控时可用于实时观察。 */
  onValuesChange?: (changed: Partial<LoginValues>, all: LoginValues) => void;
  /**
   * 提交前的异步拦截（校验通过后、onFinish 之前执行）：
   * 返回 `false` 或抛错即中止提交——验证码等前置步骤挂这里。执行期间提交按钮保持 loading。
   */
  beforeSubmit?: (values: LoginValues) => boolean | void | Promise<boolean | void>;
  /** 密码字段与「记住我」之间的附加区（验证码、租户选择等）。 */
  extra?: ReactNode;
  className?: string;
}
