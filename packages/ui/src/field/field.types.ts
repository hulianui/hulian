import type { ReactNode } from "react";

export interface FieldProps {
  label?: ReactNode;
  description?: ReactNode; // help 文案
  error?: ReactNode; // 非空隐含 invalid，并强制渲染错误
  invalid?: boolean; // 显式覆盖；缺省时由 error 是否非空推导
  disabled?: boolean;
  /**
   * 必填态（#180）：label 前渲染红星，并把 `aria-required` 注入控件。
   *
   * 校验仍然只由规则表达（`useForm` 的 `rules`）—— 这个 prop 不产生校验，它解决的是
   * 「界面上看不出哪些字段必填、要先提交一次看哪几行飘红」。规则与标记的重复可以消掉：
   * `register()` 会按 `rules` 派生 `required`，直接 `<Field required={f.required}>` 即可。
   *
   * `aria-required` 只在 `children` 是**单个元素**时能注入（够得着的只有那一个节点）。
   * children 是多节点 / 纯文本时请自己给控件加 `aria-required`。
   */
  required?: boolean;
  /**
   * 必填标记的形态。默认 `true`（红星 `*`，在 label 前）。
   *
   * - `false`：不画标记，只保留 `aria-required` —— 整表都必填、靠说明文案统一告知时用。
   * - `ReactNode`：换成自家的标记（如 `<Tag size="sm">必填</Tag>`、后置星号自己排）。
   *
   * `required` 为假时本 prop 无效（不标记「选填」；那种反转口径请自己写进 label）。
   */
  requiredMark?: boolean | ReactNode;
  /** 提交标识，透传 Field.Root（YAGNI 逃生口；validate/validationMode 本批不暴露）。 */
  name?: string;
  /**
   * 排列方向。默认 `vertical`（label 在控件上方）。
   *
   * `horizontal` = 标签区在左、控件在右、错误另起一行占满整行 —— 设置页「一行一个设置项」
   * 那种版式（#161）。a11y 串联、invalid 传导、错误渲染与竖排完全一致，只是布局不同。
   *
   * 标签列宽度不另开 prop：横排时 Field.Root 是 `grid-cols-[1fr_auto]` 的网格，
   * 传 `className="grid-cols-[8rem_1fr]"` 即可换成定宽标签列 + 控件填满（走 twMerge 顶掉默认值）。
   */
  orientation?: "vertical" | "horizontal";
  /** 在 ProForm columns 栅格中跨整行（占满所有列）；栅格外无副作用。 */
  colSpan?: "full";
  className?: string; // 落在 Field.Root（竖排为 flex 列容器，横排为两列网格）
  /**
   * 追加到 label 上（与默认的 `text-sm font-medium text-foreground` 经 twMerge 合并，
   * 同族类会顶掉默认值，如传 `text-xs` 即 12px）。
   *
   * 为什么需要它：存量页面的字段排版往往整页统一（12px / muted / 右对齐之类），
   * 而 Field 内部三段此前是硬编码的 —— 对不齐就只能整页退回手搓 label，连带丢掉
   * `aria-describedby` 串联、`invalid` 联动、错误渲染（#153）。
   */
  labelClassName?: string;
  /** 追加到 description 上（默认 `text-xs text-muted-foreground`）。 */
  descriptionClassName?: string;
  /** 追加到 error 上（默认 `text-xs text-danger`）。 */
  errorClassName?: string;
  children: ReactNode; // 控件：hulian Input / Textarea（= Field.Control）
}
