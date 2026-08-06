import type { MutableRefObject, ReactElement, ReactNode } from "react";
import type { TagTone } from "../tag/tag.types";

/** 模板字段用哪种控件渲染。默认 textarea。 */
export type IssueFieldControl = "input" | "textarea" | "markdown";

/** 模板字段值表：字段 name → 用户输入的原始字符串。 */
export type IssueFieldValues = Record<string, string>;

/** 相关组件候选项。由消费方传入（组件不自行请求 llms.txt / registry）。 */
export interface IssueComponentOption {
  /** 组件 slug（写进 markdown 的标识），如 `button`。 */
  slug: string;
  /** 展示名，如 `Button 按钮`。缺省时回退用 slug。 */
  name?: string;
}

/** 模板中的一个输入字段。 */
export interface IssueTemplateField {
  /** 字段名：既是 values 的 key，也是 toMarkdown 读取的 key。 */
  name: string;
  /** 字段标签（表单上的可见文案）。 */
  label: string;
  /**
   * 控件类型。默认 `textarea`。
   * `markdown` 会渲染 MarkdownEditor —— 它依赖 tiptap，内置模板刻意不用，按需自行开启。
   */
  control?: IssueFieldControl;
  placeholder?: string;
  /** 字段下方的说明小字。 */
  description?: string;
  /** 必填：为空时阻止提交并标红。 */
  required?: boolean;
  /** textarea 行数下限。@default 4 */
  rows?: number;
}

/**
 * issue 模板：表单字段清单 + 一个把字段值拼成 markdown 的**纯函数**。
 * 换模板 = 换这个对象，组件本体不含任何模板知识。
 */
export interface IssueTemplate {
  /** 模板标识（写进 draft.type）。 */
  type: string;
  /** 模板显示名（类型下拉里的文案）。 */
  label: string;
  /** 该模板对应的 GitHub labels，进 draft.labels 与预填 URL 的 `labels` 参数。 */
  labels?: string[];
  /** 类型标签的语气色。@default "neutral" */
  tone?: TagTone;
  fields: IssueTemplateField[];
  /**
   * 纯函数：字段值 → markdown 正文。
   * `values` 除模板自身字段外，还含保留键 `relatedComponent`（相关组件 slug，可能为空串）。
   * 约定：字段为空时**不要产出空章节**（用 `issueSection` 帮你兜住）。
   */
  toMarkdown: (values: IssueFieldValues) => string;
}

/** 构造草稿的输入（body 由 renderIssueMarkdown 算出，不用自己填）。 */
export interface IssueDraftInput {
  type: string;
  title: string;
  /** 相关组件 slug。 */
  relatedComponent?: string;
  labels?: string[];
  values: IssueFieldValues;
}

/** 结构化 issue 草稿。组件只回吐它，从不代替你调用 GitHub。 */
export interface IssueDraft extends IssueDraftInput {
  labels: string[];
  /** 渲染后的 markdown 正文。 */
  body: string;
}

/** apiRef 命令式句柄。 */
export interface IssueReporterApi {
  /** 校验 → 通过则触发 onSubmit 并返回草稿；不通过返回 null 且在表单上标红。 */
  submit: () => IssueDraft | null;
  /** 读当前草稿（不校验、不触发回调）。 */
  getDraft: () => IssueDraft;
  /** 读当前预填 URL（不判断长度）。 */
  getUrl: () => string;
  /** 清空所有字段，回到初值。 */
  reset: () => void;
}

/** 可覆盖的界面文案。 */
export interface IssueReporterText {
  typeLabel: string;
  relatedComponentLabel: string;
  relatedComponentPlaceholder: string;
  relatedComponentSearch: string;
  relatedComponentEmpty: string;
  relatedComponentNone: string;
  titleLabel: string;
  titlePlaceholder: string;
  previewLabel: string;
  previewEmpty: string;
  submit: string;
  openOnGitHub: string;
  copyMarkdown: string;
  copied: string;
  tooLongTitle: string;
  tooLongDescription: string;
  /** 必填校验文案。 */
  requiredError: (label: string) => string;
}

export interface IssueReporterProps {
  /** 目标仓库 `owner/name`（也接受完整 GitHub URL，内部会规范化）。@default "hulianui/hulian" */
  repo?: string;
  /** 模板集合。@default BUILTIN_ISSUE_TEMPLATES（bug / feature / enhancement） */
  templates?: IssueTemplate[];
  /** 受控当前模板 type。 */
  type?: string;
  /** 非受控初始模板 type。@default templates[0].type */
  defaultType?: string;
  onTypeChange?: (type: string) => void;
  /** 相关组件候选项；为空数组/不传则不渲染该字段。 */
  components?: IssueComponentOption[];
  /** 相关组件受控值（slug）。 */
  relatedComponent?: string;
  defaultRelatedComponent?: string;
  onRelatedComponentChange?: (slug: string) => void;
  /** 标题初值。 */
  defaultTitle?: string;
  /** 模板字段初值（按字段 name）。 */
  defaultValues?: IssueFieldValues;
  /** 任一输入变化后回吐最新草稿（含已渲染的 body）。 */
  onDraftChange?: (draft: IssueDraft) => void;
  /** 提交回调：拿到结构化草稿。**组件自身不调用任何 GitHub API、不持有 token**。 */
  onSubmit?: (draft: IssueDraft) => void;
  /** 是否渲染内置的提交按钮（弹层版由 ModalForm 提供页脚按钮，故置 false）。@default true */
  showSubmit?: boolean;
  /** 点「在 GitHub 上打开」时是否自动 window.open。@default true */
  openInNewTab?: boolean;
  /** 生成预填链接后的回调（无论是否自动开新标签页都会调）。 */
  onOpenUrl?: (url: string) => void;
  /** 复制 markdown 后的回调。 */
  onCopy?: (markdown: string) => void;
  /** markdown 预览形态：源码 / 渲染后 / 关闭。@default "source" */
  preview?: "source" | "rendered" | false;
  /** 预填 URL 长度上限，超过即降级为「复制 markdown」。@default GITHUB_URL_MAX_LENGTH(8000) */
  urlLimit?: number;
  /** 界面文案覆盖（与 GitHub 的 labels 无关，那个在模板上）。 */
  text?: Partial<IssueReporterText>;
  /** 动作区追加的自定义按钮。 */
  actions?: ReactNode;
  apiRef?: MutableRefObject<IssueReporterApi | null>;
  className?: string;
}

export interface IssueReporterModalProps extends IssueReporterProps {
  /** 受控开关。 */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** 触发元素（非受控打开）。 */
  trigger?: ReactElement;
  /** 弹层标题。@default "反馈 issue" */
  modalTitle?: string;
  submitText?: string;
  cancelText?: string;
  /** 弹层容器 className（宽度等）；表单本体的 className 仍走 `className`。 */
  modalClassName?: string;
}
