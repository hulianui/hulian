"use client";
import {
  Descriptions,
  Markdown,
  Meter,
  FileTree,
  Avatar,
  toast,
} from "@hulian/ui";
import type { Course, CourseFile } from "../_data/types";
import type { FileNode } from "@hulian/ui";
import { CATEGORY_NAME, lessonCount, totalMinutes } from "../_data/courses";

function toFileNodes(files: CourseFile[]): FileNode[] {
  return files.map((f) => ({
    name: f.size ? `${f.name}  ·  ${f.size}` : f.name,
    type: f.type,
    children: f.children ? toFileNodes(f.children) : undefined,
    defaultExpanded: true,
  }));
}

export function IntroTab({ course, progress }: { course: Course; progress: number }) {
  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-3 text-base font-semibold text-foreground">课程信息</h3>
        <Descriptions
          column={2}
          bordered
          items={[
            { label: "分类", children: CATEGORY_NAME[course.category] },
            { label: "难度", children: course.level },
            { label: "课时", children: `${lessonCount(course)} 节 · 约 ${totalMinutes(course)} 分钟` },
            { label: "学员", children: course.students.toLocaleString("zh-CN") },
            { label: "评分", children: `${course.rating.toFixed(1)} / 5.0（${course.ratingCount} 人）` },
            { label: "我的进度", children: `${progress}%` },
          ]}
        />
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">学习完成度</span>
          <span className="text-muted">{progress}%</span>
        </div>
        <Meter value={progress} />
      </section>

      <section>
        <h3 className="mb-3 text-base font-semibold text-foreground">课程简介</h3>
        <Markdown>{course.summary}</Markdown>
      </section>

      <section>
        <h3 className="mb-3 text-base font-semibold text-foreground">讲师</h3>
        <div className="flex items-center gap-3 rounded-[var(--radius)] border border-border bg-surface p-4">
          <Avatar fallback={course.instructor.name.slice(0, 1)} size="lg" />
          <div>
            <div className="font-medium text-foreground">{course.instructor.name}</div>
            <div className="text-sm text-muted">{course.instructor.title}</div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-base font-semibold text-foreground">配套课件</h3>
        <div className="rounded-[var(--radius)] border border-border bg-surface p-2">
          <FileTree
            nodes={toFileNodes(course.files)}
            onSelect={(node) => {
              if (node.type === "file") {
                toast({ title: "开始下载", description: node.name, tone: "info" });
              }
            }}
          />
        </div>
      </section>
    </div>
  );
}
