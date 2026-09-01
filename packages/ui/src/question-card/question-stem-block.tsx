import { Image } from "../image";
import { Formula } from "../math/math";
import { splitStemFigures } from "../question/question-stem";
import { Text } from "../text";

/**
 * 题干的唯一渲染路径：正文交给 Formula，`![](key)` 由 `resolveFigure` 解析后按出现顺序渲染在正文之后。
 * QuestionCard（题库 / 预览）与 QuestionAnswer（学生作答）共用这一块，同一份 stem 在两端看到的必须一样。
 * 刻意无 hook：QuestionCard 是 RSC 安全的，这里也得是。
 */
export function QuestionStemBlock({
  stem,
  resolveFigure,
  figureAlt = (index) => `题目附图 ${index}`,
}: {
  stem: string;
  resolveFigure?: (key: string) => string;
  figureAlt?: (index: number) => string;
}) {
  // 先切图再排公式：storage key 里合法地带着 `_` `^` `\`，交给 Formula 会被当成下标 / 命令吃成乱码。
  const split = resolveFigure ? splitStemFigures(stem) : null;
  return (
    <>
      <Text as="p" className="leading-7">
        <Formula>{split ? split.text : stem}</Formula>
      </Text>
      {split && resolveFigure && split.figures.length > 0 && (
        <div data-slot="question-stem-figures" className="flex flex-wrap gap-2">
          {split.figures.map((key, index) => (
            <Image
              key={`${key}-${index}`}
              src={resolveFigure(key)}
              alt={figureAlt(index + 1)}
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
