import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

// 题干 / 选项 / 解析。公式段两边语言一致，只翻自然语言。
export const content = {
  "zh-CN": {
    q1Stem: "已知 $\\sin A=\\frac{3}{5}$ 且 $A$ 为锐角，则 $\\cos A$ 的值为（ ）",
    q1OptA: "$\\frac{4}{5}$",
    q1OptB: "$\\frac{3}{4}$",
    q1OptC: "$\\frac{5}{4}$",
    q1OptD: "$\\frac{5}{3}$",
    q1Analysis: "由 $\\sin^2 A+\\cos^2 A=1$ 得 $\\cos A=\\frac{4}{5}$。",
    q2Stem: "下列函数中，在 $(0,+\\infty)$ 上单调递增的有（ ）",
    q2OptA: "$y=x^2$",
    q2OptB: "$y=\\frac{1}{x}$",
    q2OptC: "$y=\\ln x$",
    q2OptD: "$y=-x$",
    q2Analysis: "$y=x^2$ 与 $y=\\ln x$ 在 $(0,+\\infty)$ 上递增。",
    q3Stem: "函数 $y=\\sin x$ 是奇函数。",
    q3Analysis: "$\\sin(-x)=-\\sin x$，是奇函数。",
    q4Stem: "计算 $\\frac{1}{2}+\\frac{1}{3}$ 的值：____",
    q4Analysis: "通分：$\\frac{3}{6}+\\frac{2}{6}=\\frac{5}{6}$。",
    q5Stem: "方程 $x^2-5x+6=0$ 的两根之和为 ____，两根之积为 ____",
    q5Analysis: "由韦达定理：$x_1+x_2=5$，$x_1x_2=6$。",
    q6Stem: "求函数 $f(x)=x^3-3x$ 的极值。",
    q6Reference: "$f'(x)=3x^2-3$，令 $f'(x)=0$ 得 $x=\\pm 1$；极大值 $f(-1)=2$，极小值 $f(1)=-2$。",
    q6Point1: "正确求导",
    q6Point2: "求出驻点",
    q6Point3: "判断极大 / 极小并求值",
  },
  en: {
    q1Stem: "Given $\\sin A=\\frac{3}{5}$ with $A$ acute, the value of $\\cos A$ is ( )",
    q1OptA: "$\\frac{4}{5}$",
    q1OptB: "$\\frac{3}{4}$",
    q1OptC: "$\\frac{5}{4}$",
    q1OptD: "$\\frac{5}{3}$",
    q1Analysis: "From $\\sin^2 A+\\cos^2 A=1$ we get $\\cos A=\\frac{4}{5}$.",
    q2Stem: "Which of the following functions are increasing on $(0,+\\infty)$? ( )",
    q2OptA: "$y=x^2$",
    q2OptB: "$y=\\frac{1}{x}$",
    q2OptC: "$y=\\ln x$",
    q2OptD: "$y=-x$",
    q2Analysis: "$y=x^2$ and $y=\\ln x$ are increasing on $(0,+\\infty)$.",
    q3Stem: "The function $y=\\sin x$ is odd.",
    q3Analysis: "$\\sin(-x)=-\\sin x$, so it is odd.",
    q4Stem: "Compute the value of $\\frac{1}{2}+\\frac{1}{3}$: ____",
    q4Analysis: "Common denominator: $\\frac{3}{6}+\\frac{2}{6}=\\frac{5}{6}$.",
    q5Stem: "For the equation $x^2-5x+6=0$, the sum of the roots is ____ and the product is ____",
    q5Analysis: "By Vieta's formulas: $x_1+x_2=5$ and $x_1x_2=6$.",
    q6Stem: "Find the extreme values of $f(x)=x^3-3x$.",
    q6Reference: "$f'(x)=3x^2-3$; setting $f'(x)=0$ gives $x=\\pm 1$; the maximum is $f(-1)=2$ and the minimum is $f(1)=-2$.",
    q6Point1: "Differentiates correctly",
    q6Point2: "Finds the critical points",
    q6Point3: "Classifies maximum and minimum and evaluates them",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>(
    (text, value, index) => text.replaceAll(`{${index}}`, String(value)),
    content[DOCS_LOCALE][key],
  );
}

const dictionary: Dictionary = {
  key: "demo-learn-data-questions",
  content: t(content),
};

export default dictionary;
