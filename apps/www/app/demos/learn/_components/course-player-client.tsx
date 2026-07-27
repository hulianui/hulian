"use client";
import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Video,
  Tree,
  Tabs,
  TabsList,
  TabsTab,
  TabsPanel,
  Button,
  Tag,
  Rating,
  Meter,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  toast,
  formatTime,
  type TreeNode,
} from "@hulianui/ui";
import { ChevronLeft, CheckCircle2, Lock, PlayCircle, Circle, Share2, Bookmark } from "lucide-react";
import type { Course, Lesson } from "../_data/types";
import { coursePoster } from "../_data/poster";
import {
  allLessons,
  locateLesson,
  firstLessonId,
  CATEGORY_NAME,
  lessonCount,
  totalMinutes,
} from "../_data/courses";
import { LEARN_BASE } from "./nav-config";
import { useLearn } from "../_lib/learn-store";
import { EnrollDialog } from "./enroll-dialog";
import { IntroTab } from "./intro-tab";
import { NotesTab } from "./notes-tab";
import { DiscussionTab } from "./discussion-tab";

export function CoursePlayerClient({ course }: { course: Course }) {
  const searchParams = useSearchParams();
  const learn = useLearn();
  const { isEnrolled, isCompleted, toggleComplete, markComplete, resume, saveResume, setLastLesson, progressOf } =
    learn;
  const enrolled = isEnrolled(course.id);

  const flat = useMemo(() => allLessons(course), [course]);
  const lessonMap = useMemo(() => new Map(flat.map((l) => [l.id, l])), [flat]);

  const isLocked = (l: Lesson) => !enrolled && !l.preview;

  // 初始小节：URL ?lesson → 上次观看 → 首节；若锁定则退回首个可看节。
  const initialId = (() => {
    const want = searchParams.get("lesson") || learn.lastLesson[course.id] || firstLessonId(course);
    const wantLesson = lessonMap.get(want);
    if (wantLesson && !isLocked(wantLesson)) return want;
    return (flat.find((l) => !isLocked(l)) ?? flat[0]).id;
  })();

  const [currentId, setCurrentId] = useState(initialId);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const lastSavedRef = useRef(0);

  const loc = locateLesson(course, currentId)!;
  const current = loc.lesson;
  const progress = progressOf(course.id);

  const switchLesson = (id: string) => {
    const l = lessonMap.get(id);
    if (!l) return;
    if (isLocked(l)) {
      toast({ title: "报名后解锁本节", description: "可先免费试看带「试看」标记的小节", tone: "neutral" });
      setEnrollOpen(true);
      return;
    }
    lastSavedRef.current = 0;
    setCurrentId(id);
    if (enrolled) setLastLesson(course.id, id);
  };

  // 章节树节点：章 → 小节（自定义行：序号/试看/完成态 + 时长）。
  const treeNodes: TreeNode[] = course.chapters.map((ch) => ({
    key: ch.id,
    label: <span className="font-medium">{ch.title}</span>,
    children: ch.lessons.map((l) => {
      const done = isCompleted(l.id);
      const locked = isLocked(l);
      const active = l.id === currentId;
      return {
        key: l.id,
        label: (
          <span className="flex w-full items-center gap-2">
            <span className="shrink-0 text-muted">
              {locked ? (
                <Lock className="size-4" />
              ) : done ? (
                <CheckCircle2 className="size-4 text-success" />
              ) : active ? (
                <PlayCircle className="size-4 text-primary" />
              ) : (
                <Circle className="size-4" />
              )}
            </span>
            <span className="min-w-0 flex-1 truncate">{l.title}</span>
            {l.preview && !enrolled && (
              <Tag tone="brand" variant="soft" size="sm">
                试看
              </Tag>
            )}
            <span className="shrink-0 text-xs tabular-nums text-muted">{formatTime(l.duration)}</span>
          </span>
        ),
      };
    }),
  }));

  const onTreeSelect = (_keys: string[], node: TreeNode) => {
    if (lessonMap.has(node.key)) switchLesson(node.key);
  };

  // 续播位置（仅已报名 & 有记录时）。
  const startTime = enrolled ? resume[current.id] : undefined;

  const nextLesson = loc.nextId ? lessonMap.get(loc.nextId) : undefined;
  const nextPlayable = nextLesson && !isLocked(nextLesson);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      {/* 面包屑 */}
      <div className="mb-4">
        <Link
          href={LEARN_BASE}
          className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden />
          返回课程目录
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_22rem]">
        {/* 左：播放器 + 信息 + Tabs */}
        <div className="min-w-0">
          <Video
            key={current.id}
            src={current.videoSrc}
            poster={coursePoster(course.category, course.title)}
            title={current.title}
            className="w-full"
            chapters={current.markers}
            startTime={startTime}
            onTimeUpdate={(t) => {
              if (!enrolled) return;
              const sec = Math.floor(t);
              if (sec - lastSavedRef.current >= 5) {
                lastSavedRef.current = sec;
                saveResume(current.id, sec);
              }
            }}
            onEnded={() => {
              if (enrolled && !isCompleted(current.id)) {
                markComplete(current.id);
                toast({ title: "已完成本节", description: current.title, tone: "success" });
              }
            }}
            endScreen={
              <div className="flex flex-col items-center gap-3 text-center text-white">
                <div className="text-sm text-white/70">本节已结束</div>
                {nextPlayable ? (
                  <>
                    <div className="text-lg font-semibold">下一节 · {nextLesson!.title}</div>
                    <button
                      type="button"
                      onClick={() => switchLesson(loc.nextId!)}
                      className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      播放下一节
                    </button>
                  </>
                ) : (
                  <div className="text-base font-medium">🎉 已是最后一节</div>
                )}
              </div>
            }
          />

          {/* 当前小节标题 + 操作 */}
          <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs text-muted">{loc.chapter.title}</div>
              <h1 className="mt-0.5 text-lg font-semibold text-foreground">{current.title}</h1>
            </div>
            <div className="flex items-center gap-1.5">
              {enrolled && (
                <Button
                  variant={isCompleted(current.id) ? "outline" : "solid"}
                  size="sm"
                  onClick={() => {
                    toggleComplete(current.id);
                    toast({
                      title: isCompleted(current.id) ? "已标记为未完成" : "已标记为完成",
                      tone: "info",
                    });
                  }}
                >
                  {isCompleted(current.id) ? (
                    <>
                      <CheckCircle2 className="mr-1.5 size-4" />
                      已完成
                    </>
                  ) : (
                    "标记完成"
                  )}
                </Button>
              )}
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      aria-label="收藏课程"
                      onClick={() => toast({ title: "已加入收藏", tone: "info" })}
                      className="flex size-9 items-center justify-center rounded-[var(--radius)] text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
                    >
                      <Bookmark className="size-5" aria-hidden />
                    </button>
                  }
                />
                <TooltipContent>收藏课程</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      aria-label="分享课程"
                      onClick={() => toast({ title: "分享链接已复制", tone: "info" })}
                      className="flex size-9 items-center justify-center rounded-[var(--radius)] text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
                    >
                      <Share2 className="size-5" aria-hidden />
                    </button>
                  }
                />
                <TooltipContent>分享课程</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Tabs：简介 / 笔记 / 讨论 */}
          <div className="mt-6">
            <Tabs defaultValue="intro">
              <TabsList className="mb-5">
                <TabsTab value="intro">简介</TabsTab>
                <TabsTab value="notes">笔记</TabsTab>
                <TabsTab value="discussion">讨论</TabsTab>
              </TabsList>
              <TabsPanel value="intro">
                <IntroTab course={course} progress={progress} />
              </TabsPanel>
              <TabsPanel value="notes">
                {enrolled ? (
                  <NotesTab course={course} currentLesson={current} />
                ) : (
                  <LockedHint onEnroll={() => setEnrollOpen(true)} text="报名后即可记录课程笔记" />
                )}
              </TabsPanel>
              <TabsPanel value="discussion">
                <DiscussionTab course={course} />
              </TabsPanel>
            </Tabs>
          </div>
        </div>

        {/* 右：课程信息 + 章节树 */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-[var(--radius-lg,0.75rem)] border border-border bg-surface">
            <div className="border-b border-border p-4">
              <div className="mb-1.5 flex gap-1.5">
                <Tag tone="neutral" variant="soft" size="sm">
                  {CATEGORY_NAME[course.category]}
                </Tag>
                <Tag tone="brand" variant="soft" size="sm">
                  {course.level}
                </Tag>
              </div>
              <h2 className="text-base font-semibold text-foreground">{course.title}</h2>
              <p className="mt-1 text-xs text-muted">
                {course.instructor.name} · {lessonCount(course)} 节 · 约 {totalMinutes(course)} 分钟
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-sm font-semibold text-amber-500">{course.rating.toFixed(1)}</span>
                <Rating value={course.rating} readOnly size="sm" />
              </div>

              {enrolled ? (
                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted">学习进度</span>
                    <span className="font-medium text-foreground">{progress}%</span>
                  </div>
                  <Meter value={progress} />
                </div>
              ) : (
                <Button className="mt-3 w-full" onClick={() => setEnrollOpen(true)}>
                  报名学习
                </Button>
              )}
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              <Tree
                nodes={treeNodes}
                defaultExpandedKeys={course.chapters.map((c) => c.id)}
                selectedKeys={[currentId]}
                onSelect={onTreeSelect}
                aria-label="课程章节"
              />
            </div>
          </div>
        </aside>
      </div>

      {course.price >= 0 && <EnrollDialog course={course} open={enrollOpen} onOpenChange={setEnrollOpen} />}
    </div>
  );
}

function LockedHint({ onEnroll, text }: { onEnroll: () => void; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[var(--radius)] border border-dashed border-border bg-surface py-10 text-center">
      <Lock className="size-6 text-muted" aria-hidden />
      <p className="text-sm text-muted">{text}</p>
      <Button size="sm" onClick={onEnroll}>
        报名学习
      </Button>
    </div>
  );
}
