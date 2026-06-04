import type { ReactNode } from "react";

export interface StepsFormStep {
  title: ReactNode;
  description?: ReactNode;
  /** 该步骤的表单内容（字段）。仅当前步渲染；值由消费者 useForm 持有以跨步保留。 */
  content: ReactNode;
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
   */
  onStepValidate?: (currentStep: number) => boolean | Promise<boolean>;
  /** 最后一步提交。返回 Promise → 提交按钮 loading。 */
  onFinish?: () => void | Promise<void>;
  direction?: "horizontal" | "vertical";
  className?: string;
}
