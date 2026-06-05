"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Segmented,
  Skeleton,
  Alert,
  Empty,
  Button,
  Card,
  CardBody,
  Meter,
} from "@hulian/ui";
import { BookOpen, Compass } from "lucide-react";
import { courses, CATEGORIES } from "../_data/courses";
import { CourseCard } from "./course-card";
import { useLearn } from "../_lib/learn-store";
import { LEARN_BASE } from "./nav-config";
import { useMockData } from "../../lib/async";

type Sort = "hot" | "rating" | "new";

export function CatalogClient() {
  const searchParams = useSearchParams();
  const mine = searchParams.get("view") === "mine";
  // 首屏加载态 + 故意失败一次演示重试（铁律二：演完整生命周期）。
  const { data, loading, error, reload } = useMockData(courses, { failOnce: true });
  const { isEnrolled, progressOf, enrolled } = useLearn();

  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState<Sort>("hot");

  const list = useMemo(() => {
    let rows = data ?? [];
    if (mine) rows = rows.filter((c) => isEnrolled(c.id));
    if (cat !== "all") rows = rows.filter((c) => c.category === cat);
    const sorted = [...rows];
    if (sort === "hot") sorted.sort((a, b) => b.students - a.students);
    else if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    else sorted.reverse();
    return sorted;
  }, [data, mine, cat, sort, isEnrolled]);

  const catItems = [
    { value: "all", label: "全部" },
    ...CATEGORIES.map((c) => ({ value: c.key, label: c.name })),
  ];

  // 「我的学习」总体完成度（已报名课程的平均进度）。
  const myCourses = (data ?? []).filter((c) => isEnrolled(c.id));
  const overall =
    myCourses.length > 0
      ? Math.round(myCourses.reduce((s, c) => s + progressOf(c.id), 0) / myCourses.length)
      : 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      {/* 头部 */}
      {mine ? (
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">我的学习</h1>
          <p className="mt-1 text-sm text-muted">继续你已报名的 {enrolled.size} 门课程</p>
          {myCourses.length > 0 && (
            <Card variant="outline" className="mt-4">
              <CardBody className="flex items-center gap-4 p-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
                  <BookOpen className="size-5" aria-hidden />
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-muted">总体完成度</span>
                    <span className="font-semibold text-foreground">{overall}%</span>
                  </div>
                  <Meter value={overall} />
                </div>
              </CardBody>
            </Card>
          )}
        </header>
      ) : (
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">课程目录</h1>
          <p className="mt-1 text-sm text-muted">和 {(courses.reduce((s, c) => s + c.students, 0)).toLocaleString("zh-CN")} 名学员一起，把学习变成可见的进步</p>
        </header>
      )}

      {/* 筛选区 */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Segmented items={catItems} value={cat} onValueChange={setCat} size="sm" aria-label="分类筛选" />
        <Segmented
          items={[
            { value: "hot", label: "最热门" },
            { value: "rating", label: "评分高" },
            { value: "new", label: "最新" },
          ]}
          value={sort}
          onValueChange={(v) => setSort(v as Sort)}
          size="sm"
          aria-label="排序"
        />
      </div>

      {/* 加载态 */}
      {loading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} variant="outline" className="overflow-hidden">
              <Skeleton shape="rect" className="aspect-video w-full rounded-none" />
              <CardBody className="space-y-3 p-4">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3 w-3/5" />
                <Skeleton className="h-3 w-2/5" />
                <Skeleton className="h-8 w-full" />
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* 失败态 + 重试 */}
      {!loading && error && (
        <Alert
          tone="danger"
          title="课程加载失败"
          action={
            <Button size="sm" variant="outline" tone="danger" onClick={reload}>
              重试
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* 内容 / 空态 */}
      {!loading && !error && (
        <>
          {list.length === 0 ? (
            <Empty
              title={mine ? "还没有报名任何课程" : "没有符合条件的课程"}
              description={mine ? "去课程目录挑一门感兴趣的开始吧" : "换个分类或排序看看"}
            >
              {mine ? (
                <Button render={<Link href={LEARN_BASE} />}>
                  <Compass className="mr-1.5 size-4" aria-hidden />
                  逛逛课程
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setCat("all")}>
                  查看全部课程
                </Button>
              )}
            </Empty>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
