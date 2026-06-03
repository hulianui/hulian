import type { ReactNode } from "react";

/** render 逃生舱回调上下文。 */
export interface SearchFieldRenderCtx {
  name: string;
  value: unknown;
  onChange: (value: unknown) => void;
}

interface SearchFieldBase {
  /** 值的 key（提交时 values[name]）。 */
  name: string;
  /** 字段标签。 */
  label: ReactNode;
  /** 占位文本。 */
  placeholder?: string;
  /** 跨列数（默认 1，渲染时封顶 columns）。 */
  colSpan?: number;
  /** 非受控时的初始值（受控时由 values 提供）。 */
  defaultValue?: unknown;
}

/** 字段配置（按 type / render 区分；缺省即 input）。 */
export type SearchField =
  | (SearchFieldBase & { type?: "input"; inputType?: string; options?: never; render?: never })
  | (SearchFieldBase & {
      type: "select";
      options: { value: string; label: ReactNode }[];
      inputType?: never;
      render?: never;
    })
  | (SearchFieldBase & { type: "date"; inputType?: never; options?: never; render?: never })
  | (SearchFieldBase & { type: "date-range"; inputType?: never; options?: never; render?: never })
  | (SearchFieldBase & {
      type?: never;
      inputType?: never;
      options?: never;
      render: (ctx: SearchFieldRenderCtx) => ReactNode;
    });

export interface SearchFormProps {
  /** 字段配置数组。 */
  fields: SearchField[];
  /** 受控值；缺省走内部 state（受控/非受控对称）。 */
  values?: Record<string, unknown>;
  /** 任一字段编辑时触发（受控回填）。 */
  onChange?: (values: Record<string, unknown>) => void;
  /** 查询 / 回车提交。 */
  onSearch: (values: Record<string, unknown>) => void;
  /** 重置（values = 各字段 default 后的值）。 */
  onReset?: (values: Record<string, unknown>) => void;
  /** 桌面列数。@default 3 */
  columns?: number;
  /** 行列间距（× 0.25rem）。@default 4 */
  gap?: number;
  /** 字段填不满一行时自动失效。@default true */
  collapsible?: boolean;
  /** 初始折叠。@default true */
  defaultCollapsed?: boolean;
  /** 主按钮文案。@default "查询" */
  submitText?: ReactNode;
  /** 重置按钮文案。@default "重置" */
  resetText?: ReactNode;
  /** 查询按钮 loading 态。@default false */
  loading?: boolean;
  className?: string;
}
