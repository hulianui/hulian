"use client";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, GithubMark } from "../_icons";
import { Alert } from "../alert/alert";
import { Button } from "../button/button";
import { CodeBlock } from "../code-block/code-block";
import { Combobox, ComboboxContent, ComboboxItem, ComboboxTrigger } from "../combobox/combobox";
import type { ComboboxItemData } from "../combobox/combobox.types";
import { Field } from "../field/field";
import { Input } from "../input/input";
import { cn } from "../lib/cn";
import { zhCN } from "../config/locale";
import { useComponentLocale } from "../config/locale-context";
import { Markdown } from "../markdown/markdown";
import { MarkdownEditor } from "../markdown-editor/markdown-editor";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../select/select";
import { Tag } from "../tag/tag";
import { Textarea } from "../textarea/textarea";
import {
  buildIssueTemplates,
  GITHUB_URL_MAX_LENGTH,
  buildIssueUrl,
  createIssueDraft,
  isUrlTooLong,
} from "./issue-reporter.core";
import type {
  IssueDraft,
  IssueFieldValues,
  IssueReporterProps,
  IssueReporterText,
  IssueTemplate,
  IssueTemplateField,
} from "./issue-reporter.types";

// IssueReporter = 把「缺组件 / bug / 优化建议」整理成结构化 GitHub issue 草稿的表单。
//
// 边界写死在这里，看代码的人一眼能确认：
//
// 1. **不碰网络、不持 token**。组件只做两件事——`onSubmit(draft)` 回吐结构化草稿，
//    以及生成一条 GitHub 预填链接。真正的创建永远发生在 GitHub 自己的页面上，
//    用户点了那个绿色按钮才算数。想要「一键提交」的消费方请自己拿 draft 去调 API。
// 2. **不渲染 <form>**。它要能塞进 ModalForm/DrawerForm 的 <form> 里，嵌套 form 是非法 HTML。
//    所以值由本组件自己管，校验也自己做，提交入口经 apiRef.submit() 暴露给外层弹层。
// 3. **超长必须降级**。预填链接过长会被截断，此时藏掉「在 GitHub 上打开」并给出提示，
//    只留「复制 Markdown」——给一个点了会失败的按钮比不给更糟。

// 内置兜底：没包 ConfigProvider 时 useComponentLocale() 取不到字典，仍要有可用的中文文案。
const FALLBACK_TEXT: IssueReporterText = {
  templates: zhCN.components!.issueReporter!.templates,
  typeLabel: "类型",
  relatedComponentLabel: "相关组件",
  relatedComponentPlaceholder: "选择组件（可选）",
  relatedComponentSearch: "搜索组件…",
  relatedComponentEmpty: "无匹配组件",
  relatedComponentNone: "不指定",
  titleLabel: "标题",
  titlePlaceholder: "一句话说清问题，别写「求助」",
  previewLabel: "Markdown 预览",
  previewEmpty: "填写字段后这里会实时显示 issue 正文。",
  submit: "生成草稿",
  openOnGitHub: "在 GitHub 上打开",
  copyMarkdown: "复制 Markdown",
  copied: "已复制",
  tooLongTitle: "内容过长，不能用预填链接打开",
  tooLongDescription:
    "GitHub 的预填链接有长度上限，当前内容超出后会被截断。请复制 Markdown，到 GitHub 新建 issue 页手动粘贴。",
  requiredError: (label) => `${label} 必填`,
};

/** 相关组件字段的「不指定」项：Combobox 的 value 是对象，用空 slug 表示清空。 */
const NONE_SLUG = "";

function fieldRows(field: IssueTemplateField): number {
  return field.rows ?? 4;
}

function IssueReporterImpl({
  repo = "hulianui/hulian",
  templates: templatesProp,
  type,
  defaultType,
  onTypeChange,
  components,
  relatedComponent,
  defaultRelatedComponent = "",
  onRelatedComponentChange,
  defaultTitle = "",
  defaultValues,
  onDraftChange,
  onSubmit,
  showSubmit = true,
  openInNewTab = true,
  onOpenUrl,
  onCopy,
  preview = "source",
  urlLimit = GITHUB_URL_MAX_LENGTH,
  text,
  actions,
  apiRef,
  className,
}: IssueReporterProps) {
  // 优先级：text prop > ConfigProvider 的 locale > 内置中文兜底。
  const localeText = useComponentLocale().issueReporter ?? FALLBACK_TEXT;
  const t = useMemo<IssueReporterText>(() => ({ ...localeText, ...text }), [localeText, text]);

  // 内置模板的字段标签与产出的章节标题也跟着语言走 —— 它们会进提交给 GitHub 的正文，
  // 硬编码会让英文消费方拿到一份中文 issue（hulianui/hulian#96）。
  const templates = useMemo(
    () => templatesProp ?? buildIssueTemplates(localeText.templates ?? FALLBACK_TEXT.templates),
    [templatesProp, localeText],
  );

  const fallbackType = templates[0]?.type ?? "";
  const [internalType, setInternalType] = useState(defaultType ?? fallbackType);
  const currentType = type ?? internalType;
  const template: IssueTemplate | undefined =
    templates.find((item) => item.type === currentType) ?? templates[0];

  const [internalRelated, setInternalRelated] = useState(defaultRelatedComponent);
  const currentRelated = relatedComponent ?? internalRelated;

  const [titleValue, setTitleValue] = useState(defaultTitle);
  // 字段值跨模板共用一张表：切模板时同名字段（如 summary）的内容不会被抹掉。
  const [values, setValues] = useState<IssueFieldValues>(() => ({ ...defaultValues }));
  // 只有尝试过提交才展示必填错误——一进来满屏红字是最差的表单体验。
  const [attempted, setAttempted] = useState(false);
  const [copied, setCopied] = useState(false);

  const draft = useMemo<IssueDraft>(() => {
    if (!template) {
      return { type: currentType, title: titleValue.trim(), labels: [], values: {}, body: "" };
    }
    return createIssueDraft(
      {
        type: template.type,
        title: titleValue,
        relatedComponent: currentRelated || undefined,
        values,
      },
      template,
    );
  }, [template, currentType, titleValue, currentRelated, values]);

  const url = useMemo(() => buildIssueUrl(draft, repo), [draft, repo]);
  const tooLong = isUrlTooLong(url, urlLimit);

  const errors = useMemo(() => {
    const next: Record<string, string> = {};
    if (!titleValue.trim()) next.__title = t.requiredError(t.titleLabel);
    for (const field of template?.fields ?? []) {
      if (field.required && !(values[field.name] ?? "").trim()) {
        next[field.name] = t.requiredError(field.label);
      }
    }
    return next;
  }, [titleValue, template, values, t]);

  // onDraftChange 存 ref：消费方常传内联箭头函数，直接进依赖数组会每次渲染都重跑。
  const draftChangeRef = useRef(onDraftChange);
  draftChangeRef.current = onDraftChange;
  useEffect(() => {
    draftChangeRef.current?.(draft);
  }, [draft]);

  const setValue = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const changeType = (next: string) => {
    if (type === undefined) setInternalType(next);
    onTypeChange?.(next);
  };

  const changeRelated = (next: string) => {
    if (relatedComponent === undefined) setInternalRelated(next);
    onRelatedComponentChange?.(next);
  };

  const submit = useCallback((): IssueDraft | null => {
    setAttempted(true);
    if (Object.keys(errors).length > 0) return null;
    onSubmit?.(draft);
    return draft;
  }, [errors, draft, onSubmit]);

  const reset = useCallback(() => {
    setTitleValue(defaultTitle);
    setValues({ ...defaultValues });
    setAttempted(false);
    if (type === undefined) setInternalType(defaultType ?? fallbackType);
    if (relatedComponent === undefined) setInternalRelated(defaultRelatedComponent);
  }, [
    defaultTitle,
    defaultValues,
    type,
    defaultType,
    fallbackType,
    relatedComponent,
    defaultRelatedComponent,
  ]);

  useEffect(() => {
    if (apiRef) {
      apiRef.current = { submit, getDraft: () => draft, getUrl: () => url, reset };
    }
    return () => {
      if (apiRef) apiRef.current = null;
    };
  }, [apiRef, submit, draft, url, reset]);

  const openOnGitHub = () => {
    onOpenUrl?.(url);
    if (openInNewTab && typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const copyMarkdown = () => {
    void navigator.clipboard?.writeText(draft.body);
    onCopy?.(draft.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const typeItems = templates.map((item) => ({ value: item.type, label: item.label }));
  const componentItems: ComboboxItemData[] = useMemo(() => {
    const list = (components ?? []).map((item) => ({
      value: item.slug,
      label: item.name ?? item.slug,
    }));
    return [{ value: NONE_SLUG, label: t.relatedComponentNone }, ...list];
  }, [components, t.relatedComponentNone]);
  const relatedValue =
    componentItems.find((item) => item.value === currentRelated) ?? componentItems[0];

  const showError = (key: string) => (attempted ? errors[key] : undefined);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.typeLabel}>
          <Select
            items={typeItems}
            value={currentType}
            onValueChange={(next: string | null) => changeType(next ?? fallbackType)}
          >
            <SelectTrigger aria-label={t.typeLabel} />
            <SelectContent>
              {typeItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {components && components.length > 0 && (
          <Field label={t.relatedComponentLabel}>
            <Combobox
              items={componentItems}
              value={relatedValue}
              onValueChange={(next: ComboboxItemData | null) =>
                changeRelated(next?.value ?? NONE_SLUG)
              }
            >
              <ComboboxTrigger placeholder={t.relatedComponentPlaceholder} />
              <ComboboxContent
                searchPlaceholder={t.relatedComponentSearch}
                emptyMessage={t.relatedComponentEmpty}
              >
                {(item) => (
                  <ComboboxItem key={item.value} value={item}>
                    {item.label}
                  </ComboboxItem>
                )}
              </ComboboxContent>
            </Combobox>
          </Field>
        )}
      </div>

      <Field label={t.titleLabel} error={showError("__title")}>
        <Input
          value={titleValue}
          onChange={(event) => setTitleValue(event.target.value)}
          placeholder={t.titlePlaceholder}
        />
      </Field>

      {template?.fields.map((field) => (
        <Field
          key={field.name}
          label={field.label}
          description={field.description}
          error={showError(field.name)}
        >
          {field.control === "input" ? (
            <Input
              value={values[field.name] ?? ""}
              onChange={(event) => setValue(field.name, event.target.value)}
              placeholder={field.placeholder}
            />
          ) : field.control === "markdown" ? (
            <MarkdownEditor
              defaultValue={values[field.name] ?? ""}
              onChange={(markdown) => setValue(field.name, markdown)}
              placeholder={field.placeholder}
              minRows={fieldRows(field)}
              aria-label={field.label}
            />
          ) : (
            <Textarea
              value={values[field.name] ?? ""}
              onChange={(event) => setValue(field.name, event.target.value)}
              placeholder={field.placeholder}
              rows={fieldRows(field)}
            />
          )}
        </Field>
      ))}

      {preview !== false && (
        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{t.previewLabel}</span>
            {template && (
              <Tag size="sm" tone={template.tone ?? "neutral"} dot>
                {template.label}
              </Tag>
            )}
          </div>
          {draft.body ? (
            preview === "rendered" ? (
              <div className="rounded-[var(--radius)] border border-border bg-surface p-4">
                <Markdown size="sm">{draft.body}</Markdown>
              </div>
            ) : (
              <CodeBlock code={draft.body} lang="markdown" />
            )
          ) : (
            <p className="rounded-[var(--radius)] border border-dashed border-border p-4 text-sm text-muted-foreground">
              {t.previewEmpty}
            </p>
          )}
        </section>
      )}

      {tooLong && (
        <Alert tone="warning" title={t.tooLongTitle}>
          {t.tooLongDescription}
        </Alert>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {showSubmit && (
          <Button type="button" onClick={submit}>
            {t.submit}
          </Button>
        )}
        {!tooLong && (
          <Button type="button" variant="outline" onClick={openOnGitHub}>
            {/* 平台 mark 而不是通用外链图标：这颗按钮的去向是一个第三方平台，图标在这里承载的是
                **目的地识别**（扫一眼就知道会跳到哪），不是装饰。换成通用外链图标等于把那条信息
                丢了（#119）。 */}
            <GithubMark className="size-4" />
            {t.openOnGitHub}
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={copyMarkdown}>
          {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
          {copied ? t.copied : t.copyMarkdown}
        </Button>
        {actions}
      </div>
    </div>
  );
}

IssueReporterImpl.displayName = "IssueReporter";

// #89：父级稳定更新时 React 无法自己 bailout，只能靠 memo —— 与 Button/Checkbox/Chip 同一处方。
export const IssueReporter = memo(IssueReporterImpl);
IssueReporter.displayName = "IssueReporter";
