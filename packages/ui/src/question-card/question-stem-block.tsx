import { Image } from "../image";
import { Formula } from "../math/math";
import { stemFigureRefs, stripStemFigures } from "../question/question-stem";
import { Text } from "../text";

/**
 * 题干的唯一渲染路径：正文交给 Formula，`![](key)` 由 `resolveFigure` 解析后按出现顺序渲染在正文之后。
 * QuestionCard（题库 / 预览）与 QuestionAnswer（学生作答）共用这一块，同一份 stem 在两端看到的必须一样；
 * QuestionEditor 题干输入框底下那块预览也走它——老师看到的就该是学生会看到的。
 * 刻意无 hook：QuestionCard 是 RSC 安全的，这里也得是。
 */
export function QuestionStemBlock({
  stem,
  resolveFigure,
  figureAlt = (index) => `题目附图 ${index}`,
  macros,
}: {
  stem: string;
  resolveFigure?: (key: string) => string;
  figureAlt?: (index: number) => string;
  /** KaTeX 宏表，透传给正文的 Formula。消费方自定义的宏不该在这里被报成「未定义命令」。 */
  macros?: Record<string, string>;
}) {
  // 先切图再排公式：storage key 里合法地带着 `_` `^` `\`，交给 Formula 会被当成下标 / 命令吃成乱码。
  const figures = resolveFigure ? stemFigureRefs(stem) : null;
  const text = resolveFigure ? stripStemFigures(stem) : stem;
  return (
    <>
      <Text as="p" className="leading-7">
        <Formula macros={macros}>{text}</Formula>
      </Text>
      {figures && resolveFigure && figures.length > 0 && (
        <div data-slot="question-stem-figures" className="flex flex-wrap gap-2">
          {figures.map((ref, index) => (
            <Image
              key={`${ref.key}-${index}`}
              src={resolveFigure(ref.key)}
              // 引用自带 alt 就用它：导入线切出的行内公式图，方括号里那段就是这张图念出来是什么
              // （`![7x+5<5x+1](…)`），比「题目附图 2」有信息。没写 alt 才退回编号。
              alt={ref.alt.trim() === "" ? figureAlt(index + 1) : ref.alt}
              radius="md"
              className="border border-border bg-white"
              imgClassName="max-h-44 w-auto max-w-56 object-contain"
            />
          ))}
        </div>
      )}
    </>
  );
}
