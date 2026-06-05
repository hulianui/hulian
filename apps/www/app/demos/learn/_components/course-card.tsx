"use client";
import { useState } from "react";
import Link from "next/link";
import { Card, CardBody, Button, Tag, Rating, Progress, Image, toast } from "@hulianui/ui";
import { Users } from "lucide-react";
import type { Course } from "../_data/types";
import { coursePoster } from "../_data/poster";
import { CATEGORY_NAME, priceLabel, lessonCount, totalMinutes, firstLessonId } from "../_data/courses";
import { LEARN_BASE } from "./nav-config";
import { useLearn } from "../_lib/learn-store";
import { EnrollDialog } from "./enroll-dialog";

export function CourseCard({ course }: { course: Course }) {
  const { isEnrolled, enroll, setLastLesson, progressOf, lastLesson } = useLearn();
  const [enrollOpen, setEnrollOpen] = useState(false);
  const enrolled = isEnrolled(course.id);
  const progress = progressOf(course.id);
  const resumeLesson = lastLesson[course.id] ?? firstLessonId(course);
  const courseHref = `${LEARN_BASE}/courses/${course.id}`;

  const onPrimary = () => {
    if (course.price === 0) {
      // 免费课直接加入「我的学习」，不走支付向导。
      enroll(course.id);
      setLastLesson(course.id, firstLessonId(course));
      toast({ title: "已加入学习", description: course.title, tone: "info" });
    } else {
      setEnrollOpen(true);
    }
  };

  return (
    <Card variant="outline" className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
      <Link href={courseHref} className="block" aria-label={course.title}>
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={coursePoster(course.category, course.title)}
            alt={course.title}
            isZoomed
            radius="none"
            className="size-full"
            imgClassName="size-full object-cover"
          />
          <div className="absolute left-2 top-2 flex gap-1.5">
            <Tag tone="neutral" variant="solid" size="sm" className="bg-black/55 text-white">
              {CATEGORY_NAME[course.category]}
            </Tag>
            <Tag tone="brand" variant="solid" size="sm">
              {course.level}
            </Tag>
          </div>
        </div>
      </Link>

      <CardBody className="flex flex-1 flex-col gap-2 p-4">
        <Link href={courseHref} className="line-clamp-2 font-semibold text-foreground hover:text-primary">
          {course.title}
        </Link>
        <p className="line-clamp-1 text-xs text-muted">
          {course.instructor.name} · {course.instructor.title}
        </p>

        <div className="flex items-center gap-1.5 text-sm">
          <span className="font-semibold text-amber-500">{course.rating.toFixed(1)}</span>
          <Rating value={course.rating} readOnly size="sm" />
          <span className="text-xs text-muted">({course.ratingCount})</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" aria-hidden />
            {course.students.toLocaleString("zh-CN")}
          </span>
          <span>{lessonCount(course)} 节 · 约 {totalMinutes(course)} 分钟</span>
        </div>

        <div className="mt-auto pt-2">
          {enrolled ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">学习进度</span>
                <span className="font-medium text-foreground">{progress}%</span>
              </div>
              <Progress value={progress} />
              <Button
                variant="solid"
                size="sm"
                className="w-full"
                render={<Link href={`${courseHref}?lesson=${resumeLesson}`} />}
              >
                {progress > 0 ? "继续学习" : "开始学习"}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <span className="text-lg font-bold text-foreground">{priceLabel(course.price)}</span>
              <Button variant="solid" size="sm" onClick={onPrimary}>
                {course.price === 0 ? "免费学习" : "立即报名"}
              </Button>
            </div>
          )}
        </div>
      </CardBody>

      {course.price > 0 && <EnrollDialog course={course} open={enrollOpen} onOpenChange={setEnrollOpen} />}
    </Card>
  );
}
