"use client";
import { useRef, useState } from "react";
import type { ChangeEvent, FocusEvent, KeyboardEvent } from "react";
import { cn } from "../lib/cn";
import { Input } from "../input";
import { Textarea } from "../textarea";
import type { CellEditorProps } from "./cell-editor.types";

type CellElement = HTMLInputElement | HTMLTextAreaElement;

/**
 * 单元格内联编辑器：无边框透明底、静止态与纯文本同形，失焦 / Enter 即提交这一格。
 *
 * 与 EditableTable 是两种交互契约，不是一个东西的两种皮肤：EditableTable 是**行级**的
 * （点编辑 → 改 → 保存整行），本组件是**逐格**的（永远可编辑、单格提交）。核对 / 补录场景下
 * 用户是「扫一遍、看到不对的就地改一个字」，任何「先点编辑再点保存」的往返都会把它变成体力活。
 *
 * 只做编辑器这一层，表格外壳交给 Table —— 这样表格能力（排序 / 冻结列 / 虚拟滚动）不必在
 * 编辑器里重造一遍。
 */
export function CellEditor({
  value,
  onCommit,
  missing = false,
  multiline = false,
  disabled = false,
  placeholder,
  className,
  onBlur,
  onKeyDown,
  ...props
}: CellEditorProps) {
  const [draft, setDraft] = useState(value);
  const [pending, setPending] = useState(false);

  /**
   * 上次提交出去的值。判等（值没变不发）与 Esc 回滚共用同一个基准，于是「Esc 之后紧跟的 blur
   * 不能再提交一次旧值」这条顺序自然成立：Esc 把草稿写回基准，blur 时判等直接短路 ——
   * 不需要额外维护一个「刚按过 Esc」的标志位（那个标志位什么时候清才是真正难写对的地方）。
   */
  const committedRef = useRef(value);

  // 外部值变化（提交成功后父级回写、或别处刷新了这一格）同步进草稿。写在渲染期而不是 effect 里：
  // effect 会先拿旧草稿画一帧，一屏几十个格同时闪一下。
  const [syncedValue, setSyncedValue] = useState(value);
  if (value !== syncedValue) {
    setSyncedValue(value);
    setDraft(value);
    committedRef.current = value;
  }

  // 并发提交时只让最后一次决定 pending 何时结束：先发的慢请求后回来，不该把后发的 pending 抹掉。
  const pendingToken = useRef(0);

  const commit = (next: string) => {
    if (next === committedRef.current) return;
    committedRef.current = next;
    const result: unknown = onCommit?.(next);
    // 认 thenable 而不是 `instanceof Promise`：消费方的提交常常来自 axios / SWR mutate 这类
    // 自带 promise 实现的库，同步返回时也不该白挂一个 pending 态。
    if (typeof (result as Promise<void> | undefined)?.then !== "function") return;
    const token = ++pendingToken.current;
    setPending(true);
    const settle = () => {
      if (pendingToken.current === token) setPending(false);
    };
    // 失败只结束 pending 态：回滚与报错文案要看业务语义，只能由消费方在 onCommit 里自己 catch。
    void Promise.resolve(result as Promise<void>).then(settle, settle);
  };

  const handleChange = (event: ChangeEvent<CellElement>) => setDraft(event.target.value);

  const handleBlur = (event: FocusEvent<CellElement>) => {
    commit(draft);
    onBlur?.(event);
  };

  const handleKeyDown = (event: KeyboardEvent<CellElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      // 单行档里 Enter 会提交所在 form、多行档里会插入换行，两者都不是「提交这一格」。
      // 多行档的换行让给 Shift+Enter。
      event.preventDefault();
      commit(draft);
    } else if (event.key === "Escape") {
      setDraft(committedRef.current);
    }
    onKeyDown?.(event);
  };

  const shared = {
    value: draft,
    placeholder,
    disabled: disabled || pending,
    onChange: handleChange,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
    ...props,
  };

  if (multiline) {
    return (
      <Textarea
        variant="cell"
        // 自增高由 Textarea 的 cell 档用 CSS field-sizing-content 做，不走 autoResize 那条
        // JS 测高：表格里几十个格同时读 scrollHeight 会在滚动时明显掉帧，而且和列宽变化互相触发。
        className={cn("break-words", missing && "italic text-muted-foreground", className)}
        {...shared}
      />
    );
  }

  return (
    <Input
      variant="cell"
      // 灰斜体里只有斜体能留在外壳上：Input 内层控件自带 text-foreground，颜色挂在外壳会被它盖掉，
      // 所以颜色得用后代选择器直接命中真正的 <input>。
      className={cn(missing && "italic [&_input]:text-muted-foreground", className)}
      {...shared}
    />
  );
}
