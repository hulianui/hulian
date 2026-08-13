import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

/** 档位取值与内层的 Input / Textarea 同一套：内层就是它们俩，不为单元格另起第三套说法。 */
export type CellEditorVariant = "default" | "cell";
export type CellEditorSize = "xs" | "sm" | "md" | "lg";

/** 单行档与多行档共有的字段。原生属性不在这里，由下面两个接口各自继承对应元素的属性集。 */
export interface CellEditorBaseProps {
  /** 已提交值（受控数据源）：提交成功后父级把新值写回这里，组件据此重置内部草稿。 */
  value: string;
  /**
   * blur / Enter 触发。**值与上次提交相同时不会调用** —— 核对场景里用户大量「点进去看一眼
   * 再点走」，不判等会把一整屏空提交打到后端。
   * 返回 Promise 时组件自己进 pending 态并禁用，消费方不必再传 `disabled={saving}`。
   */
  onCommit?: (next: string) => void | Promise<void>;
  /**
   * 提交前校验：返回字符串＝这是错误消息，**拦住 `onCommit`**（值不出去）并在原地把该串显示出来；
   * 返回 `undefined` 即放行。
   *
   * 存在的理由是失焦即提交这条契约本身：没有这一层时非法值会先写进去再由消费方回滚，
   * 而那时光标已经跑到下一格，用户看到的是「我改的东西自己变回去了」。
   *
   * 拦住之后草稿**不回滚**（要让用户看见自己写错的那串继续改），判等基准也不推进 ——
   * 于是下一次 blur 会再校验一次，改对了才提交。Esc 仍然回滚并清掉错误。
   */
  validate?: (next: string) => string | undefined;
  /**
   * 草稿每次变化时的**只读回声**（每敲一个键一次），不影响判等 / 校验 / pending 任何既有语义。
   *
   * 给的是「随打字变化的派生 UI」一个落点：已填计数、实时预览、每键落 localStorage 这类。
   * 值真正出去仍然只看 `onCommit` —— 如果你在这里写落库，就把失焦即提交那条契约绕过去了，
   * 判等与 `validate` 都拦不住它。
   */
  onDraftChange?: (draft: string) => void;
  /**
   * `onCommit` 返回的 Promise reject 时，把草稿一并退回上一次提交值。默认 `false` = 只退判等基准。
   *
   * 基准无论开关都会退（reject 恰恰证明这个值没交出去），所以默认档下用户不改动直接再失焦
   * 就是重试一次；开了则界面也回到失败前的样子，代价是用户刚打的那串没了。
   * 值来自服务端缓存（SWR / React Query）时开它 —— 那种 `value` 在失败时不会变，
   * 消费方手上没有能拿来回滚的东西。
   */
  revertOnError?: boolean;
  /** Enter 提交后让出焦点。默认 `false` = 焦点留在格内。校验被拦下时不让出（错误就在这一格，得让用户改）。 */
  blurOnCommit?: boolean;
  /** Esc 回滚后让出焦点。默认 `false` = 焦点留在格内。 */
  blurOnEscape?: boolean;
  /** 「这个字段还没填」：降成 muted + italic，让「空」和「填了空格」一眼可分。 */
  missing?: boolean;
  disabled?: boolean;
  placeholder?: string;
  /**
   * 外观档，透传给内层 Input / Textarea。默认 `"cell"`：无边框透明底，静止态与纯文本同形。
   *
   * 换 `"default"` 是为了同一行里其余列也是普通输入框的表 —— 那种表里用户正是靠边框判断
   * 哪些格子可编辑，有框无框混排会逼人靠记忆而不是靠看。
   */
  variant?: CellEditorVariant;
  /** 字号档，透传给内层 Input / Textarea。不传即沿用它们的默认档。 */
  size?: CellEditorSize;
}

/**
 * 单行档：继承 `<input>` 的原生属性（`name` / `type` / `maxLength` / `autoComplete` …）。
 *
 * `size` 让位给档位 `size`：原生 `<input size>` 是字符宽度，同名不同义，两者不可能都留。
 * 需要按字符数定宽的用 CSS 宽度。
 */
export interface CellEditorSingleProps
  extends CellEditorBaseProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "defaultValue" | "value" | "size"> {
  /** 多行档（textarea + `field-sizing: content` 自增高）；默认单行 input。 */
  multiline?: false;
}

/** 多行档：继承 `<textarea>` 的原生属性，于是 `rows`（最少几行）这类只在多行档存在的字段自然可用。 */
export interface CellEditorMultilineProps
  extends CellEditorBaseProps,
    Omit<
      TextareaHTMLAttributes<HTMLTextAreaElement>,
      "onChange" | "defaultValue" | "value" | "size"
    > {
  multiline: true;
}

/**
 * 按 `multiline` 分叉：两档渲染的原生元素不同，属性集也就不同，合并成一个接口会让
 * `rows` 在单行档里也「看起来能传」。代价是 `multiline` 必须是字面量 —— 拿一个 boolean
 * 变量开关多行时 TS 认不出走哪一档，那种场合分支渲染两个 `CellEditor`。
 */
export type CellEditorProps = CellEditorSingleProps | CellEditorMultilineProps;
