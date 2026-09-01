"use client";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Question, StudentAnswer } from "@hulianui/ui/math";
import { seedQuestions } from "../_data/questions";

export interface BankQuestion {
  id: string;
  courseId: string;
  question: Question;
  updatedAt: string;
}

export interface Attempt {
  answer: StudentAnswer;
  /** null = 主观题，等老师批。 */
  correct: boolean | null;
  score: number;
}

export interface QuestionBank {
  questions: BankQuestion[];
  add: (courseId: string, question: Question) => BankQuestion;
  update: (id: string, question: Question) => void;
  remove: (id: string) => void;
  attempts: Record<string, Attempt>;
  recordAttempt: (id: string, attempt: Attempt) => void;
  resetAttempts: () => void;
}

const Ctx = createContext<QuestionBank | null>(null);

// 固定时间戳，不读系统时钟（静态导出下 SSR 与客户端首帧要一致，见 #181）。
const SEED_TIME = "2026-09-01T09:00:00";

export function QuestionBankProvider({ children }: { children: ReactNode }) {
  const [questions, setQuestions] = useState<BankQuestion[]>(() =>
    seedQuestions.map((s) => ({ id: s.id, courseId: s.courseId, question: s.question, updatedAt: SEED_TIME })),
  );
  const [attempts, setAttempts] = useState<Record<string, Attempt>>({});
  const [serial, setSerial] = useState(seedQuestions.length);

  const add = useCallback<QuestionBank["add"]>(
    (courseId, question) => {
      const next = serial + 1;
      const row: BankQuestion = { id: `q${next}`, courseId, question, updatedAt: SEED_TIME };
      setSerial(next);
      setQuestions((list) => [row, ...list]);
      return row;
    },
    [serial],
  );
  const update = useCallback<QuestionBank["update"]>((id, question) => {
    setQuestions((list) => list.map((row) => (row.id === id ? { ...row, question } : row)));
  }, []);
  const remove = useCallback<QuestionBank["remove"]>((id) => {
    setQuestions((list) => list.filter((row) => row.id !== id));
    setAttempts((map) => {
      if (!(id in map)) return map;
      const { [id]: _dropped, ...rest } = map;
      return rest;
    });
  }, []);
  const recordAttempt = useCallback<QuestionBank["recordAttempt"]>((id, attempt) => {
    setAttempts((map) => ({ ...map, [id]: attempt }));
  }, []);
  const resetAttempts = useCallback(() => setAttempts({}), []);

  const value = useMemo<QuestionBank>(
    () => ({ questions, add, update, remove, attempts, recordAttempt, resetAttempts }),
    [questions, add, update, remove, attempts, recordAttempt, resetAttempts],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useQuestionBank(): QuestionBank {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useQuestionBank must be used within QuestionBankProvider");
  return ctx;
}
