import { Suspense } from "react";
import { notFound } from "next/navigation";
import { courses, courseById } from "../../../_data/courses";
import { CoursePlayerClient } from "../../../_components/course-player-client";

// www 为 output:export 静态导出，动态路由须枚举所有 id（generateStaticParams 仅服务端可导出，故本页保持 server）。
export function generateStaticParams() {
  return courses.map((c) => ({ id: c.id }));
}

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = courseById[id];
  if (!course) notFound();
  // useSearchParams（?lesson=）在 output:export 下须包 Suspense。
  return (
    <Suspense>
      <CoursePlayerClient course={course} />
    </Suspense>
  );
}
