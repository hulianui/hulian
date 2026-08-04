"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Button } from "../button";
import { QuestionCard } from "./question-card";

const kindLabels = {
  choice: "选择题",
  fill: "填空题",
  solution: "解答题",
  judge: "判断题",
} as const;

export const questionCardShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "选择题",
      description: "题干与选项里的分数走 Formula（KaTeX）真排版；出处与知识点在页脚。",
      code: `<QuestionCard
  number="3"
  kind="choice"
  kindLabel="选择题"
  difficulty="A 组"
  stem="如图,图形①②都由完全相同的小正方形拼成。若图形①的边长为 4,则图形②的面积用分数表示为( )。"
  options={[
    { label: "A", text: "\\\\frac{1}{9}" },
    { label: "B", text: "\\\\frac{5}{9}" },
    { label: "C", text: "\\\\frac{16}{9}" },
    { label: "D", text: "\\\\frac{80}{9}" },
  ]}
  chapter="第1章 有理数 · 1.1.1 自然数、分数和小数"
  topics={["有理数", "分数"]}
  source="学能评价 七上 · 第 3 页 · 第 3 题"
/>`,
      render: () => (
        <div className="w-full max-w-2xl">
          <QuestionCard
            number="3"
            kind="choice"
            kindLabel={kindLabels.choice}
            difficulty="A 组"
            stem="如图,图形①②都由完全相同的小正方形拼成。若图形①的边长为 4,则图形②的面积用分数表示为( )。"
            options={[
              { label: "A", text: "\\frac{1}{9}" },
              { label: "B", text: "\\frac{5}{9}" },
              { label: "C", text: "\\frac{16}{9}" },
              { label: "D", text: "\\frac{80}{9}" },
            ]}
            chapter="第1章 有理数 · 1.1.1 自然数、分数和小数"
            topics={["有理数", "分数"]}
            source="学能评价 七上 · 第 3 页 · 第 3 题"
          />
        </div>
      ),
    },
    {
      title: "填空题 + 小问",
      description: "填空槽是可书写的空位；小问逐条列出。",
      code: `<QuestionCard
  number="11"
  kind="fill"
  kindLabel="填空题"
  stem="规定盈利为正,某公司去年亏损了 3 万元,可记作____万元。"
  parts={["(1)数轴上点 B 表示的数 b 为____。", "(2)点 P 表示的数为____。"]}
/>`,
      render: () => (
        <div className="w-full max-w-2xl">
          <QuestionCard
            number="11"
            kind="fill"
            kindLabel={kindLabels.fill}
            stem="规定盈利为正,某公司去年亏损了 3 万元,可记作____万元。"
            parts={["(1)数轴上点 B 表示的数 b 为____。", "(2)点 P 表示的数为____。"]}
            chapter="第1章 有理数"
          />
        </div>
      ),
    },
    {
      title: "待复核",
      description: "自动拆题拿不准的条目亮左侧警示边条，绝不混进正常题里。",
      code: `<QuestionCard
  number="7"
  kind="choice"
  kindLabel="选择题"
  stem="下列各式中,正确的是( )。"
  issues={[{ label: "选项不足 4 个" }, { label: "题号不连续" }]}
  actions={<Button size="sm" variant="ghost">去校对</Button>}
/>`,
      render: () => (
        <div className="w-full max-w-2xl">
          <QuestionCard
            number="7"
            kind="choice"
            kindLabel={kindLabels.choice}
            stem="下列各式中,正确的是( )。"
            options={[{ label: "A", text: "-|-16|>0" }]}
            issues={[{ label: "选项不足 4 个" }, { label: "题号不连续" }]}
            actions={
              <Button size="sm" variant="ghost">
                去校对
              </Button>
            }
          />
        </div>
      ),
    },
  ],
  controls: [
    { prop: "number", type: "text", defaultValue: "3", label: "题号" },
    {
      prop: "kind",
      type: "select",
      options: ["choice", "fill", "solution", "judge"],
      defaultValue: "choice",
      label: "题型",
    },
    { prop: "stem", type: "text", defaultValue: "将 \\frac{3}{8} 化成小数为( )。", label: "题干" },
    { prop: "difficulty", type: "text", defaultValue: "A 组", label: "分层" },
    { prop: "compact", type: "boolean", defaultValue: false, label: "紧凑" },
  ],
  states: [
    {
      name: "选择题",
      render: () => (
        <QuestionCard
          number="2"
          kind="choice"
          kindLabel={kindLabels.choice}
          stem="将 \\frac{3}{8} 化成小数为( )。"
          options={[
            { label: "A", text: "0.125" },
            { label: "B", text: "0.250" },
            { label: "C", text: "0.375" },
            { label: "D", text: "0.625" },
          ]}
        />
      ),
    },
    {
      name: "填空题",
      render: () => <QuestionCard number="11" kind="fill" kindLabel={kindLabels.fill} stem="去年亏损 3 万元,可记作____万元。" />,
    },
    {
      name: "解答题",
      render: () => (
        <QuestionCard
          number="17"
          kind="solution"
          kindLabel={kindLabels.solution}
          stem="把下列各数填入相应的集合圈内:"
          parts={["(1)正数集合", "(2)负整数集合"]}
        />
      ),
    },
    {
      name: "待复核",
      render: () => (
        <QuestionCard number="7" kind="choice" kindLabel={kindLabels.choice} stem="下列各式中,正确的是( )。" issues={[{ label: "选项不足 4 个" }]} />
      ),
    },
    {
      name: "紧凑",
      render: () => <QuestionCard number="5" kind="fill" kindLabel={kindLabels.fill} stem="当 m<0 时,|-3m|=____。" compact />,
    },
  ],
  renderWithProps: (p) => (
    <QuestionCard
      number={String(p.number ?? "")}
      kind={p.kind as "choice" | "fill" | "solution" | "judge"}
      kindLabel={kindLabels[(p.kind as keyof typeof kindLabels) ?? "choice"]}
      difficulty={String(p.difficulty ?? "")}
      stem={String(p.stem ?? "")}
      compact={Boolean(p.compact)}
    />
  ),
  toCode: (p) =>
    `<QuestionCard number="${String(p.number ?? "")}" kind="${String(p.kind ?? "choice")}" kindLabel="${kindLabels[(p.kind as keyof typeof kindLabels) ?? "choice"]}" stem={${JSON.stringify(String(p.stem ?? ""))}} />`,
};
