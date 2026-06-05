"use client";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { courses, allLessons } from "../_data/courses";

export interface Note {
  id: string;
  lessonId: string;
  lessonTitle: string;
  /** markdown 正文。 */
  body: string;
  createdAt: string;
}

interface LearnState {
  enrolled: Set<string>;
  /** 已完成的小节 id。 */
  completed: Set<string>;
  /** 续播位置：lessonId → 秒。 */
  resume: Record<string, number>;
  /** 每门课最后观看的小节。 */
  lastLesson: Record<string, string>;
  notes: Note[];
}

interface LearnStore extends LearnState {
  isEnrolled: (courseId: string) => boolean;
  enroll: (courseId: string) => void;
  isCompleted: (lessonId: string) => boolean;
  toggleComplete: (lessonId: string) => void;
  markComplete: (lessonId: string) => void;
  saveResume: (lessonId: string, seconds: number) => void;
  setLastLesson: (courseId: string, lessonId: string) => void;
  /** 课程完成进度 0~100（按已完成小节比例）。 */
  progressOf: (courseId: string) => number;
  addNote: (note: Omit<Note, "id" | "createdAt">) => void;
  deleteNote: (id: string) => void;
}

const Ctx = createContext<LearnStore | null>(null);

// 预置种子：部分课程已报名 + 已完成若干小节（让「我的学习」与进度条一进来就有戏）。
function seed(): LearnState {
  const enrolled = new Set<string>();
  const completed = new Set<string>();
  const lastLesson: Record<string, string> = {};
  for (const c of courses) {
    if (c.seedEnrolled) {
      enrolled.add(c.id);
      const done = c.seedCompletedLessonIds ?? [];
      done.forEach((id) => completed.add(id));
      // 最后观看 = 第一个未完成的小节，否则最后一节
      const flat = allLessons(c);
      const next = flat.find((l) => !completed.has(l.id)) ?? flat[flat.length - 1];
      if (next) lastLesson[c.id] = next.id;
    }
  }
  return {
    enrolled,
    completed,
    resume: { l4: 4 }, // 演示续播：React 课第 4 节从第 4 秒续播
    lastLesson,
    notes: [
      {
        id: "seed-note-1",
        lessonId: "l2",
        lessonTitle: "02 组件、Props 与组合优于继承",
        body: "**组合优于继承**：用 children / render props 传递，而不是层层 extends。",
        createdAt: "2 天前",
      },
    ],
  };
}

export function LearnStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LearnState>(seed);

  const isEnrolled = useCallback((id: string) => state.enrolled.has(id), [state.enrolled]);
  const enroll = useCallback((id: string) => {
    setState((s) => {
      if (s.enrolled.has(id)) return s;
      const enrolled = new Set(s.enrolled);
      enrolled.add(id);
      return { ...s, enrolled };
    });
  }, []);

  const isCompleted = useCallback((id: string) => state.completed.has(id), [state.completed]);
  const toggleComplete = useCallback((id: string) => {
    setState((s) => {
      const completed = new Set(s.completed);
      if (completed.has(id)) completed.delete(id);
      else completed.add(id);
      return { ...s, completed };
    });
  }, []);
  const markComplete = useCallback((id: string) => {
    setState((s) => {
      if (s.completed.has(id)) return s;
      const completed = new Set(s.completed);
      completed.add(id);
      return { ...s, completed };
    });
  }, []);

  const saveResume = useCallback((lessonId: string, seconds: number) => {
    setState((s) => ({ ...s, resume: { ...s.resume, [lessonId]: seconds } }));
  }, []);
  const setLastLesson = useCallback((courseId: string, lessonId: string) => {
    setState((s) => ({ ...s, lastLesson: { ...s.lastLesson, [courseId]: lessonId } }));
  }, []);

  const progressOf = useCallback(
    (courseId: string) => {
      const c = courses.find((x) => x.id === courseId);
      if (!c) return 0;
      const flat = allLessons(c);
      if (flat.length === 0) return 0;
      const done = flat.filter((l) => state.completed.has(l.id)).length;
      return Math.round((done / flat.length) * 100);
    },
    [state.completed],
  );

  const addNote = useCallback((note: Omit<Note, "id" | "createdAt">) => {
    setState((s) => ({
      ...s,
      notes: [
        { ...note, id: `note-${s.notes.length}-${note.lessonId}`, createdAt: "刚刚" },
        ...s.notes,
      ],
    }));
  }, []);
  const deleteNote = useCallback((id: string) => {
    setState((s) => ({ ...s, notes: s.notes.filter((n) => n.id !== id) }));
  }, []);

  const value = useMemo<LearnStore>(
    () => ({
      ...state,
      isEnrolled,
      enroll,
      isCompleted,
      toggleComplete,
      markComplete,
      saveResume,
      setLastLesson,
      progressOf,
      addNote,
      deleteNote,
    }),
    [state, isEnrolled, enroll, isCompleted, toggleComplete, markComplete, saveResume, setLastLesson, progressOf, addNote, deleteNote],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLearn(): LearnStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLearn 必须在 LearnStoreProvider 内使用");
  return ctx;
}
