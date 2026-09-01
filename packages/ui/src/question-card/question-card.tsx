import { Card, CardBody } from "../card";
import { Chip } from "../chip";
import { Image } from "../image";
import { cn } from "../lib/cn";
import { warnOnce } from "../lib/warn-once";
import { Formula } from "../math/math";
import type { QuestionType } from "../question/question.types";
import { Tag } from "../tag";
import { Text } from "../text";
import { QuestionAnswerSection, QuestionTypeTag } from "./question-card.client";
import { QuestionStemBlock } from "./question-stem-block";
import type { QuestionCardProps, QuestionKind } from "./question-card.types";

// 题目卡片：教辅/题库场景的标准展示件。
// 题干、选项、小问一律走 Formula（KaTeX），因此分数、根号、上下标是真排版而不是
// "3/8" "x^2" 这种降级文本，也不是 CSS 拼出来的近似版式。上游数据没包 $ 时 Formula
// 会退到裸记号切分，题面照样排得出来 —— 也正因为吃 KaTeX，本件住在 @hulianui/ui/math。
// 带 issues 的题左侧亮警示边条 —— 从文档自动拆出来的题必须让人一眼看出哪些没把握。

/** 旧四型 → 七型。0.59 起 `kind` deprecated，下一个 minor 删这张表。 */
const KIND_TO_TYPE: Record<QuestionKind, QuestionType> = {
  choice: "single",
  fill: "blank",
  solution: "essay",
  judge: "judge",
};

export function QuestionCard({
  number,
  type,
  kind,
  typeLabel,
  kindLabel,
  difficulty,
  stem,
  options,
  parts,
  figure,
  resolveFigure,
  figureAlt,
  answer,
  analysis,
  showAnswer = false,
  source,
  chapter,
  topics,
  issues,
  actions,
  compact = false,
  className,
}: QuestionCardProps) {
  if (kind !== undefined && type === undefined) {
    warnOnce(
      "question-card:kind-deprecated",
      "[瑚琏] QuestionCard：`kind` 已弃用，请改用 `type`（single / multiple / judge / blank / short_answer / calculation / essay）。",
    );
  }
  const resolvedType: QuestionType | undefined = type ?? (kind ? KIND_TO_TYPE[kind] : undefined);
  const resolvedLabel = typeLabel ?? kindLabel;
  const flagged = (issues?.length ?? 0) > 0;
  const worst = issues?.some((i) => i.tone === "danger") ? "danger" : "warning";

  return (
    <Card
      className={cn(
        "overflow-hidden",
        // 左边条是「这题需要人看一眼」的唯一视觉信号，别用整卡染色（会盖住题干可读性）
        flagged && "border-l-4",
        flagged && (worst === "danger" ? "border-l-danger" : "border-l-warning"),
        className,
      )}
    >
      <CardBody className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {number != null && (
            <Text as="span" weight="medium" className="tabular-nums">
              {number}.
            </Text>
          )}
          {resolvedType && <QuestionTypeTag type={resolvedType} label={resolvedLabel} />}
          {difficulty != null && (
            <Tag size="sm" tone="neutral" variant="outline">
              {difficulty}
            </Tag>
          )}
          {issues?.map((issue) => (
            <Tag key={issue.label} size="sm" tone={issue.tone ?? "warning"} variant="soft" dot>
              {issue.label}
            </Tag>
          ))}
          {actions && <div className="ms-auto flex items-center gap-1">{actions}</div>}
        </div>

        <div className={cn("gap-4", figure && "sm:flex sm:items-start")}>
          <div className="min-w-0 flex-1 space-y-2">
            <QuestionStemBlock stem={stem} resolveFigure={resolveFigure} figureAlt={figureAlt} />

            {options && options.length > 0 && (
              <ul className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
                {options.map((opt) => {
                  const key = "key" in opt ? opt.key : opt.label;
                  return (
                    <li key={key} className="flex gap-1.5">
                      <Text as="span" tone="muted" className="shrink-0">
                        {key}.
                      </Text>
                      <Text as="span">
                        <Formula>{opt.text}</Formula>
                      </Text>
                    </li>
                  );
                })}
              </ul>
            )}

            {!compact && parts && parts.length > 0 && (
              <ul className="space-y-1">
                {parts.map((part, i) => (
                  <li key={i}>
                    <Text as="span" tone="muted">
                      <Formula>{part}</Formula>
                    </Text>
                  </li>
                ))}
              </ul>
            )}

            {showAnswer && (
              <QuestionAnswerSection type={resolvedType} answer={answer} analysis={analysis} />
            )}
          </div>

          {figure && (
            <Image
              src={figure.src}
              alt={figure.alt ?? (figureAlt ? figureAlt(1) : "题目附图")}
              radius="md"
              className="mt-2 shrink-0 self-start border border-border bg-white sm:mt-0"
              // 题目附图是线稿，尺寸差异极大（细高的数轴 vs 扁宽的表格）。
              // 限高并 object-contain：不限高的话一张细高图会把整张卡撑出大片空白；
              // 用默认的 object-cover 限高则会把图裁掉一半 —— 图被裁等于题看不懂。
              imgClassName="max-h-44 w-auto max-w-56 object-contain"
            />
          )}
        </div>

        {(chapter != null || source != null || (topics?.length ?? 0) > 0) && !compact && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-border pt-2.5">
            {chapter != null && (
              <Text as="span" size="sm" tone="muted">
                {chapter}
              </Text>
            )}
            {topics?.map((topic) => (
              <Chip key={topic} size="sm" variant="soft" tone="brand">
                {topic}
              </Chip>
            ))}
            {source != null && (
              <Text as="span" size="sm" tone="muted" className="ms-auto">
                {source}
              </Text>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
