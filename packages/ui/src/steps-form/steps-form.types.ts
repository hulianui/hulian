import type { ReactNode } from "react";

export interface StepsFormStep {
  title: ReactNode;
  description?: ReactNode;
  /** 该步骤的表单内容（字段）。仅当前步渲染；值由消费者 useForm 持有以跨步保留。 */
  content: ReactNode;
  /**
   * 禁用本步的前进按钮（下一步/提交），如「未上传文件不可继续」。
   * @default false
   */
  nextDisabled?: boolean;
  /** 本步前进按钮的自定义文案（如「开始导入」）。缺省走 locale（下一步/提交）。 */
  nextText?: ReactNode;
  /**
   * 是否渲染本步底部导航（上一步/下一步/提交）。结果步自带操作按钮时置 false。
   * @default true
   */
  showNav?: boolean;
}

export interface StepsFormProps {
  steps: StepsFormStep[];
  /** 受控当前步（0 起）。 */
  current?: number;
  /** 非受控初始步。 */
  defaultCurrent?: number;
  onCurrentChange?: (current: number) => void;
  /**
   * 进入下一步/提交前的校验（收到即将离开的步骤号）。
   * 返回 false 或 reject 则阻止前进 —— 通常在此调用 form.validateField 校验本步字段。
   * 返回 pending Promise 期间前进按钮呈 loading（防重复点击）。
   */
  onStepValidate?: (currentStep: number) => boolean | Promise<boolean>;
  /** 最后一步提交。返回 Promise → 提交按钮 loading。 */
  onFinish?: () => void | Promise<void>;
  direction?: "horizontal" | "vertical";
  className?: string;
}
