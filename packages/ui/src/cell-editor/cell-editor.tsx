"use client";
import { useId, useRef, useState } from "react";
import type {
  ChangeEvent,
  FocusEvent,
  InputHTMLAttributes,
  KeyboardEvent,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "../lib/cn";
import { Input } from "../input";
import { Textarea } from "../textarea";
import type { CellEditorBaseProps, CellEditorProps } from "./cell-editor.types";

type CellElement = HTMLInputElement | HTMLTextAreaElement;

/**
 * 实现内部把两档并成一套。对外分叉是为了让消费方只看见自己那档的原生属性，而在实现里
 * 解构会切断判别式收窄（TS 已知限制：`multiline` 一旦被解构出来，剩下的 rest 就不再跟着它走），
 * 于是两个渲染分支各要断言一次。把并集声明在这里，断言就只剩函数开头那一处。
 */
type CellEditorAnyProps = CellEditorBaseProps & { multiline?: boolean } & Omit<
    InputHTMLAttributes<CellElement> & TextareaHTMLAttributes<CellElement>,
    "onChange" | "defaultValue" | "value" | "size"
  >;

/**
 * 单元格内联编辑器：默认无边框透明底、静止态与纯文本同形，失焦 / Enter 即提交这一格。
 * （同一行里其余列是普通输入框的表，把档位换回 default 跟邻居保持一致 —— 那种表里用户
 * 正是靠边框判断哪些格子可编辑。）
 *
 * 与 EditableTable 是两种交互契约，不是一个东西的两种皮肤：EditableTable 是**行级**的
 * （点编辑 → 改 → 保存整行），本组件是**逐格**的（永远可编辑、单格提交）。核对 / 补录场景下
 * 用户是「扫一遍、看到不对的就地改一个字」，任何「先点编辑再点保存」的往返都会把它变成体力活。
 *
 * 只做编辑器这一层，表格外壳交给 Table —— 这样表格能力（排序 / 冻结列 / 虚拟滚动）不必在
 * 编辑器里重造一遍。
 */
export function CellEditor(props: CellEditorProps) {
  const {
    value,
    onCommit,
    validate,
    onDraftChange,
    revertOnError = false,
    blurOnCommit = false,
    blurOnEscape = false,
    missing = false,
    multiline = false,
    disabled = false,
    placeholder,
    variant = "cell",
    size,
    className,
    onBlur,
    onKeyDown,
    ...rest
  } = props as CellEditorAnyProps;

  const [draft, setDraft] = useState(value);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const errorId = useId();

  /**
   * 最新草稿的镜像。blur() 是同步的：它会在 `setDraft` 落到下一次渲染之前就触发 handleBlur，
   * 那时闭包里的 `draft` 还是上一版 —— Esc 之后自动让出焦点会因此把用户刚想丢弃的那串提交出去。
   * 提交一律读这个 ref 而不是闭包值，那条时序就不存在了（也不必去维护一个「刚按过 Esc」的标志位）。
   */
  const draftRef = useRef(value);

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
    draftRef.current = value;
    committedRef.current = value;
    // 外部换了值，界面上那条错误说的已经不是眼下这格的内容了。
    setError(undefined);
  }

  // 并发提交时只让最后一次决定 pending 何时结束：先发的慢请求后回来，不该把后发的 pending 抹掉。
  const pendingToken = useRef(0);

  /** 返回值是「这次按键之后该不该让出焦点」：被 validate 拦下时不该，错误就在这一格，得让用户接着改。 */
  const commit = (next: string): boolean => {
    if (next === committedRef.current) {
      // 值改回了上次提交的样子＝错的那版已经不在了，红线要跟着撤，否则一格会一直挂着
      // 一条与当前内容无关的错误（校验被拦时判等基准没推进，这条路径必然会被走到）。
      setError(undefined);
      return true;
    }
    // 校验在判等之后、写出之前：已提交过的值不重复校验（那是上一次已经放行的），
    // 拦下时**不推进 committedRef** —— 基准一推进，下次 blur 就会判等短路，等于放过了非法值。
    // 空串按放行处理：一条看不见的错误却拦着提交，比不校验更糟——用户只会看到「这格存不进去」
    // 而屏幕上什么都没有。想拦就给一句能读的话。
    const message = validate?.(next);
    if (message != null && message !== "") {
      setError(message);
      return false;
    }
    setError(undefined);
    // 基准在 onCommit 之前推进（而不是等 resolve）：pending 期间用户再失焦一次不该把同一个值
    // 重发一遍。代价是失败时基准记的是一件没发生的事，所以下面 reject 分支要把它退回来。
    const previous = committedRef.current;
    committedRef.current = next;
    const result: unknown = onCommit?.(next);
    // 认 thenable 而不是 `instanceof Promise`：消费方的提交常常来自 axios / SWR mutate 这类
    // 自带 promise 实现的库，同步返回时也不该白挂一个 pending 态。
    if (typeof (result as Promise<void> | undefined)?.then !== "function") return true;
    const token = ++pendingToken.current;
    setPending(true);
    const isLatest = () => pendingToken.current === token;
    const settle = () => {
      if (isLatest()) setPending(false);
    };
    // 失败两个分支不能合并：reject 恰恰证明这个值没交出去，而基准记成「已交出去」会让用户
    // 不改动直接再失焦时被判等短路 —— 保存失败之后连重试都点不动。所以先把基准退回上一版。
    // 回滚有两道门：这次提交仍是最新的那次，且基准还停在它身上 —— 期间外部写进来的新值
    // （渲染期重同步已经把基准推到它）是更近的真相，不能被一个旧请求的失败盖回去。
    const revert = () => {
      settle();
      if (!isLatest() || committedRef.current !== next) return;
      committedRef.current = previous;
      // 草稿默认留在失败的那串上（让用户看着自己刚打的东西继续改）；开了 revertOnError
      // 才一并退回 —— 值来自服务端缓存时消费方手上没有别的东西可以拿来回滚。
      if (revertOnError) {
        setDraft(previous);
        draftRef.current = previous;
      }
    };
    void Promise.resolve(result as Promise<void>).then(settle, revert);
    return true;
  };

  const handleChange = (event: ChangeEvent<CellElement>) => {
    const next = event.target.value;
    setDraft(next);
    draftRef.current = next;
    // 一开始改就把红线撤掉：那条错误说的是刚才那一版。改完再 blur 会重新校验。
    setError(undefined);
    // 只读回声，放在最后：即使消费方在这里抛错，组件自己的草稿状态也已经是一致的。
    onDraftChange?.(next);
  };

  const handleBlur = (event: FocusEvent<CellElement>) => {
    commit(draftRef.current);
    onBlur?.(event);
  };

  const handleKeyDown = (event: KeyboardEvent<CellElement>) => {
    let releaseFocus = false;
    if (event.key === "Enter" && !event.shiftKey) {
      // 单行档里 Enter 会提交所在 form、多行档里会插入换行，两者都不是「提交这一格」。
      // 多行档的换行让给 Shift+Enter。
      event.preventDefault();
      releaseFocus = commit(draftRef.current) && blurOnCommit;
    } else if (event.key === "Escape") {
      setDraft(committedRef.current);
      draftRef.current = committedRef.current;
      // 回滚到上一次提交值＝回到一个已经放行过的状态，错误随之作废。
      setError(undefined);
      releaseFocus = blurOnEscape;
    }
    // 让出焦点排在消费方的 onKeyDown 之后：blur 会同步走一遍 handleBlur 与消费方的 onBlur，
    // 先 blur 就等于让 onBlur 插到 onKeyDown 前面去。currentTarget 先取出来，回调结束后它会被清空。
    const target = event.currentTarget;
    onKeyDown?.(event);
    if (releaseFocus) target.blur();
  };

  const shared = {
    value: draft,
    placeholder,
    variant,
    size,
    disabled: disabled || pending,
    // 红线复用 Input / Textarea 的 cell 档已有的 data-invalid 内嵌下划线（inset shadow，零布局位移），
    // 不另起一套错误皮肤：一屏几十格里再多一种红，读的人分不清哪种红是哪回事。
    invalid: error != null,
    onChange: handleChange,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
    ...rest,
    ...(error != null && {
      "aria-describedby": [rest["aria-describedby"], errorId].filter(Boolean).join(" "),
    }),
  };

  const control = multiline ? (
    <Textarea
      // 默认档（cell）的自增高由 Textarea 用 CSS 的 field-sizing 做，不走 autoResize 那条
      // JS 测高：表格里几十个格同时读 scrollHeight 会在滚动时明显掉帧，而且和列宽变化互相触发。
      className={cn("break-words", missing && "italic text-muted-foreground", className)}
      {...shared}
    />
  ) : (
    <Input
      // 灰斜体里只有斜体能留在外壳上：Input 内层控件自带前景色，颜色挂在外壳会被它盖掉，
      // 所以颜色得用后代选择器直接命中真正的 <input>。
      className={cn(missing && "italic [&_input]:text-muted-foreground", className)}
      {...shared}
    />
  );

  // 错误行是控件的**兄弟节点**而不是包一层容器：套容器会让「出错那一刻」控件的父节点类型变掉，
  // React 于是卸载重挂输入框——正在编辑的那格会当场失焦，而 Enter 校验失败恰恰是焦点还在的时候。
  // Fragment 不产生 DOM，控件始终是第 0 个孩子，位置不变即不重挂；没有错误时渲染结果与从前逐字相同。
  return (
    <>
      {control}
      {error != null && (
        <span id={errorId} className="mt-0.5 block text-xs text-danger">
          {error}
        </span>
      )}
    </>
  );
}
