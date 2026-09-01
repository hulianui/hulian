import { copy } from "./questions.content";
import type { Question } from "@hulianui/ui/math";

export interface SeedQuestion {
  id: string;
  /** 挂在哪门课下（复用 courses.ts 的 id）。 */
  courseId: string;
  question: Question;
}

// 六道题覆盖 single / multiple / judge / blank（单空、双空）/ calculation。
// 客观题全部能被 gradeObjective 判；calculation 在练习页只读展示，提醒「需老师批阅」。
export const seedQuestions: SeedQuestion[] = [
  {
    id: "q1",
    courseId: "react-foundations",
    question: {
      type: "single",
      stem: copy("q1Stem"),
      options: [
        { key: "A", text: copy("q1OptA") },
        { key: "B", text: copy("q1OptB") },
        { key: "C", text: copy("q1OptC") },
        { key: "D", text: copy("q1OptD") },
      ],
      answer: "A",
      analysis: copy("q1Analysis"),
      difficulty: 2,
      score: 5,
    },
  },
  {
    id: "q2",
    courseId: "react-foundations",
    question: {
      type: "multiple",
      stem: copy("q2Stem"),
      options: [
        { key: "A", text: copy("q2OptA") },
        { key: "B", text: copy("q2OptB") },
        { key: "C", text: copy("q2OptC") },
        { key: "D", text: copy("q2OptD") },
      ],
      answer: ["A", "C"],
      analysis: copy("q2Analysis"),
      difficulty: 3,
      score: 5,
    },
  },
  {
    id: "q3",
    courseId: "react-foundations",
    question: { type: "judge", stem: copy("q3Stem"), options: null, answer: true, analysis: copy("q3Analysis"), difficulty: 1, score: 2 },
  },
  {
    id: "q4",
    courseId: "react-foundations",
    question: { type: "blank", stem: copy("q4Stem"), options: null, answer: [["\\frac{5}{6}"]], analysis: copy("q4Analysis"), difficulty: 2, score: 5 },
  },
  {
    id: "q5",
    courseId: "react-foundations",
    question: { type: "blank", stem: copy("q5Stem"), options: null, answer: [["5"], ["6"]], analysis: copy("q5Analysis"), difficulty: 2, score: 6 },
  },
  {
    id: "q6",
    courseId: "react-foundations",
    question: {
      type: "calculation",
      stem: copy("q6Stem"),
      options: null,
      answer: {
        reference: copy("q6Reference"),
        rubric: [
          { point: copy("q6Point1"), score: 3 },
          { point: copy("q6Point2"), score: 3 },
          { point: copy("q6Point3"), score: 4 },
        ],
      },
      analysis: "",
      difficulty: 4,
      score: 10,
    },
  },
];
