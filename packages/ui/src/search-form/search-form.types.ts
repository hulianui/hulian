import type { ReactNode } from "react";
import type { RemoteSelectFetcher, RemoteSelectResolver } from "../remote-select/remote-select.types";
import type { TreeNode } from "../tree/tree-core";

/** render 逃生舱回调上下文。 */
export interface SearchFieldRenderCtx {
  name: string;
  value: unknown;
  onChange: (value: unknown) => void;
}

/** 选项型字段（select / multi-select）的候选项。 */
export interface SearchFieldOption {
  value: string;
  label: ReactNode;
}

// 远程字段直接复用 RemoteSelect 自己的契约，不在这里另立一套平行类型
// ——否则两边任一方改签名都会在编译期撞车，而它们本就该是同一个东西。
export type { RemoteSelectFetcher, RemoteSelectResolver };

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

/**
 * 字段配置（按 type / render 区分；缺省即 input）。
 *
 * **区间类字段（`*-range`）的值恒为二元组** `[start, end]`，未填的那端是 `""`。
 * 多值字段（`multi-select` / `remote-select multiple`）的值是 `string[]`。
 * **层级字段（`cascader` / `region`）的值是路径数组** `string[]`（根 → 叶，未选为 `[]`）。
 * 其余是 `string`。重置后各自回到 `defaultValue` 或上述空形状。
 *
 * 注意：**operator（`LIKE` / `BETWEEN` 之类）不属于本组件**。那是后端查询契约，
 * 由消费方在 `onSearch` 里把 values 翻译成自家的请求形状，别塞进字段配置。
 */
export type SearchField =
  | (SearchFieldBase & {
      type?: "input";
      inputType?: string;
      options?: never;
      fetcher?: never;
      render?: never;
    })
  | (SearchFieldBase & {
      type: "number";
      /** 数字输入的步进/上下界，透传给原生 input。 */
      min?: number;
      max?: number;
      step?: number;
      inputType?: never;
      options?: never;
      fetcher?: never;
      render?: never;
    })
  | (SearchFieldBase & {
      type: "number-range";
      min?: number;
      max?: number;
      step?: number;
      inputType?: never;
      options?: never;
      fetcher?: never;
      render?: never;
    })
  | (SearchFieldBase & {
      type: "select";
      options: SearchFieldOption[];
      inputType?: never;
      fetcher?: never;
      render?: never;
    })
  | (SearchFieldBase & {
      type: "multi-select";
      options: SearchFieldOption[];
      inputType?: never;
      fetcher?: never;
      render?: never;
    })
  | (SearchFieldBase & {
      type: "remote-select";
      /** 远程数据源；多选时值为 `string[]`。签名同 RemoteSelect 的 `fetcher`。 */
      fetcher: RemoteSelectFetcher;
      /** 初值回显：把已有 value 解成 label（编辑态打开时 value 常不在首屏那页里）。 */
      resolveValue?: RemoteSelectResolver;
      multiple?: boolean;
      inputType?: never;
      options?: never;
      render?: never;
    })
  | (SearchFieldBase & {
      /**
       * 级联选择（组织架构 / 品类 / 门店三级这类）。值是**路径数组**（根 → 叶）。
       * 底座是 [Cascader](../cascader/cascader.md)。
       */
      type: "cascader";
      /** 级联候选树（即 Cascader 的 `nodes`）。 */
      options: TreeNode[];
      /** 允许选中间层级即提交（大区筛选很常见），默认必须选到末级。 */
      changeOnSelect?: boolean;
      /** 浮层顶部出搜索框（树深、节点多时开）。 */
      showSearch?: boolean;
      inputType?: never;
      fetcher?: never;
      render?: never;
    })
  | (SearchFieldBase & {
      /**
       * 省 / 市 / 区县筛选：数据内置（[RegionCascader](../region-cascader/region-cascader.md)），
       * 消费方不用喂 options。值是**行政区划 code 的路径数组**，如 `["11","1101","110101"]`；
       * 要名称路径请用 `render` 逃生舱自己接 RegionCascader 的第二个回调参数。
       *
       * 内置的区划表约 137KB，因此这一档是**按需加载**的：只有真的配了 `type: "region"` 的
       * 页面才会去拉那个 chunk，其余 SearchForm / ProTable 页面不受影响。
       */
      type: "region";
      /** 联动层级：3 = 省/市/区县（默认）；2 = 省/市。 */
      level?: 2 | 3;
      /** 允许选到中间级即提交（只筛到省 / 市）。 */
      changeOnSelect?: boolean;
      /** 浮层内搜索框，默认开。 */
      showSearch?: boolean;
      options?: never;
      inputType?: never;
      fetcher?: never;
      render?: never;
    })
  | (SearchFieldBase & {
      type: "date";
      inputType?: never;
      options?: never;
      fetcher?: never;
      render?: never;
    })
  | (SearchFieldBase & {
      type: "date-range";
      inputType?: never;
      options?: never;
      fetcher?: never;
      render?: never;
    })
  | (SearchFieldBase & {
      type: "datetime";
      inputType?: never;
      options?: never;
      fetcher?: never;
      render?: never;
    })
  | (SearchFieldBase & {
      type: "datetime-range";
      inputType?: never;
      options?: never;
      fetcher?: never;
      render?: never;
    })
  | (SearchFieldBase & {
      type?: never;
      inputType?: never;
      options?: never;
      fetcher?: never;
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
