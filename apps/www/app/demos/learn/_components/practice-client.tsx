"use client";
import { copy } from "./practice-client.content";
import { useEffect, useMemo, useState } from "react";
import { Button, Card, Empty, Heading, Progress, Result, Skeleton, Text, toast } from "@hulianui/ui";
import { createCasComparator, MathField } from "@hulianui/ui/math-field";
import {
  QuestionAnswer,
  gradeObjective,
  isSubjective,
  type QuestionAnswerResult,
  type StudentAnswer,
} from "@hulianui/ui/math";
import { useMockData, usePending } from "../../lib/async";
import { useQuestionBank } from "../_lib/question-bank-store";

type Equivalent = (a: string, b: string) => boolean;

export function PracticeClient() {
  const bank = useQuestionBank();
  // 首屏加载态只借 useMockData 的延迟；题目本身直接读 store。
  const { loading } = useMockData(null, { delay: 500 });
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState<StudentAnswer | undefined>();
  const [result, setResult] = useState<QuestionAnswerResult | null>(null);
  const [pending, run] = usePending();
  const [equivalent, setEquivalent] = useState<Equivalent | undefined>();

  // CAS 比较器异步加载；没到位之前提交仍能判（只走前两档）。
  useEffect(() => {
    let alive = true;
    createCasComparator().then(
      (fn) => {
        if (alive) setEquivalent(() => fn);
      },
      () => {},
    );
    return () => {
      alive = false;
    };
  }, []);

  const rows = bank.questions;
  const current = rows[index];
  const done = !loading && rows.length > 0 && index >= rows.length;
  const subjective = current ? isSubjective(current.question.type) : false;
  const summary = useMemo(() => {
    let correct = 0;
    let score = 0;
    for (const row of rows) {
      const a = bank.attempts[row.id];
      if (!a) continue;
      if (a.correct) correct += 1;
      score += a.score;
    }
    return { correct, score };
  }, [rows, bank.attempts]);

  const submit = (answer: StudentAnswer) => {
    if (!current) return;
    void run(() => {
      const graded = gradeObjective(current.question, answer, { normalize: true, tolerance: 0.001, equivalent });
      bank.recordAttempt(current.id, { answer, correct: graded.correct, score: graded.score });
      setResult({ correct: graded.correct === true, correctAnswer: current.question.answer, analysis: current.question.analysis });
      toast({ title: copy("submitted"), tone: "info" });
    });
  };
  const next = () => {
    setIndex((i) => i + 1);
    setValue(undefined);
    setResult(null);
  };
  const again = () => {
    bank.resetAttempts();
    setIndex(0);
    setValue(undefined);
    setResult(null);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="mb-6">
        <Heading level={1}>{copy("title")}</Heading>
        <Text tone="muted">{copy("subtitle")}</Text>
      </div>

      {loading ? (
        <Skeleton shape="rect" className="h-64 w-full" />
      ) : rows.length === 0 ? (
        <Empty title={copy("emptyTitle")} description={copy("emptyHint")} />
      ) : done ? (
        <Result status="success" title={copy("finishTitle")} subTitle={copy("finishSubtitle", summary.correct, summary.score)}>
          <Button onClick={again}>{copy("again")}</Button>
        </Result>
      ) : (
        <Card className="space-y-4 p-4">
          <div className="space-y-1">
            <Text size="sm" tone="muted">
              {copy("progress", index + 1, rows.length)}
            </Text>
            <Progress value={((index + (result ? 1 : 0)) / rows.length) * 100} />
          </div>
          <QuestionAnswer
            question={{
              type: current.question.type,
              stem: current.question.stem,
              options: current.question.options,
              blankCount: current.question.type === "blank" && Array.isArray(current.question.answer) ? current.question.answer.length : undefined,
              difficulty: current.question.difficulty,
            }}
            value={value}
            onChange={setValue}
            result={result}
            pending={pending}
            onSubmit={subjective ? undefined : submit}
            blankInput="math"
            mathField={MathField}
            reason={copy("reason")}
            correctHint={copy("correctHint")}
          />
          {subjective && (
            <Text size="sm" tone="muted">
              {copy("subjectiveNote")}
            </Text>
          )}
          {(result !== null || subjective) && (
            <div className="flex justify-end">
              <Button onClick={next}>{copy("next")}</Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
