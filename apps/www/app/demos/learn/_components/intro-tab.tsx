"use client";
import { copy } from "./intro-tab.content";
import { Descriptions, Markdown, Meter, FileTree, Avatar, toast } from "@hulianui/ui";
import type { Course, CourseFile } from "../_data/types";
import type { FileNode } from "@hulianui/ui";
import { CATEGORY_NAME, COURSE_LEVEL_NAME, lessonCount, totalMinutes } from "../_data/courses";

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
        <h3 className="mb-3 text-base font-semibold text-foreground">
          {copy("courseInformation")}
        </h3>
        <Descriptions
          column={2}
          bordered
          items={[
            { label: copy("categories"), children: CATEGORY_NAME[course.category] },
            { label: copy("difficulty"), children: COURSE_LEVEL_NAME[course.level] },
            {
              label: copy("lesson"),
              children: copy("lessonDurationSummary", lessonCount(course), totalMinutes(course)),
            },
            { label: copy("learners"), children: course.students.toLocaleString("zh-CN") },
            {
              label: copy("rating"),
              children: copy("ratingSummary", course.rating.toFixed(1), course.ratingCount),
            },
            { label: copy("myProgress"), children: `${progress}%` },
          ]}
        />
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">{copy("learningCompletion")}</span>
          <span className="text-muted">{progress}%</span>
        </div>
        <Meter value={progress} />
      </section>

      <section>
        <h3 className="mb-3 text-base font-semibold text-foreground">
          {copy("courseIntroduction")}
        </h3>
        <Markdown>{course.summary}</Markdown>
      </section>

      <section>
        <h3 className="mb-3 text-base font-semibold text-foreground">{copy("instructor")}</h3>
        <div className="flex items-center gap-3 rounded-[var(--radius)] border border-border bg-surface p-4">
          <Avatar fallback={course.instructor.name.slice(0, 1)} size="lg" />
          <div>
            <div className="font-medium text-foreground">{course.instructor.name}</div>
            <div className="text-sm text-muted">{course.instructor.title}</div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-base font-semibold text-foreground">
          {copy("supportingCourseware")}
        </h3>
        <div className="rounded-[var(--radius)] border border-border bg-surface p-2">
          <FileTree
            nodes={toFileNodes(course.files)}
            onSelect={(node) => {
              if (node.type === "file") {
                toast({ title: copy("startDownload"), description: node.name, tone: "info" });
              }
            }}
          />
        </div>
      </section>
    </div>
  );
}
