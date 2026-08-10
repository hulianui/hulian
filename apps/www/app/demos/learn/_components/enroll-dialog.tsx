"use client";
import { copy } from "./enroll-dialog.content";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, StepsForm, Radio, RadioGroup, Tag, toast } from "@hulianui/ui";
import type { Course } from "../_data/types";
import {
  COURSE_LEVEL_NAME,
  priceLabel,
  lessonCount,
  totalMinutes,
  firstLessonId,
} from "../_data/courses";
import { useLearn } from "../_lib/learn-store";
import { sleep } from "../../lib/async";

interface Plan {
  key: string;
  name: string;
  desc: string;
  multiplier: number;
}

const PLANS: Plan[] = [
  {
    key: "standard",
    name: copy("standard"),
    desc: copy("fullCourseContentCoursewareDownload"),
    multiplier: 1,
  },
  {
    key: "plus",
    name: copy("advanced"),
    desc: copy("standardEditionInstructorQAClosingCertificate"),
    multiplier: 1.5,
  },
  {
    key: "team",
    name: copy("teamEdition"),
    desc: copy("advancedSeatsLearningForm"),
    multiplier: 4,
  },
];

export function EnrollDialog({
  course,
  open,
  onOpenChange,
}: {
  course: Course;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { enroll, setLastLesson } = useLearn();
  const [current, setCurrent] = useState(0);
  const [plan, setPlan] = useState("standard");

  // 关闭后重置向导，下次从第一步开始。
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setCurrent(0);
        setPlan("standard");
      }, 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  const selectedPlan = PLANS.find((p) => p.key === plan)!;
  const finalPrice = Math.round(course.price * selectedPlan.multiplier);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={copy("enrollCourseTitle", course.title)}
        className="w-[32rem] max-w-[calc(100vw-2rem)]"
      >
        <StepsForm
          current={current}
          onCurrentChange={setCurrent}
          steps={[
            {
              title: copy("confirmCourse"),
              content: (
                <div className="space-y-3 rounded-[var(--radius)] border border-border bg-surface p-4">
                  <div className="text-base font-semibold text-foreground">{course.title}</div>
                  <p className="text-sm text-muted-foreground">{course.subtitle}</p>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span>
                      {copy("instructor")} {course.instructor.name}
                    </span>
                    <span>
                      {lessonCount(course)} {copy("section")}
                    </span>
                    <span>
                      {copy("approx")} {totalMinutes(course)} {copy("minutes")}
                    </span>
                    <Tag tone="brand" variant="soft" size="sm">
                      {COURSE_LEVEL_NAME[course.level]}
                    </Tag>
                  </div>
                </div>
              ),
            },
            {
              title: copy("chooseAPlan"),
              content: (
                <RadioGroup value={plan} onValueChange={setPlan} aria-label={copy("chooseAPlan")}>
                  <div className="space-y-2">
                    {PLANS.map((p) => {
                      const price = Math.round(course.price * p.multiplier);
                      return (
                        <label
                          key={p.key}
                          className="flex cursor-pointer items-center justify-between gap-3 rounded-[var(--radius)] border border-border p-3 transition-colors hover:bg-surface-hover has-[input:checked]:border-primary has-[input:checked]:bg-primary/5"
                        >
                          <Radio
                            value={p.key}
                            label={<span className="font-medium text-foreground">{p.name}</span>}
                          />
                          <span className="flex-1 text-xs text-muted-foreground">{p.desc}</span>
                          <span className="shrink-0 font-semibold text-primary">
                            {priceLabel(price)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </RadioGroup>
              ),
            },
            {
              title: copy("done"),
              content: (
                <div className="space-y-2 rounded-[var(--radius)] border border-border bg-surface p-4 text-sm">
                  <Row label={copy("courses")} value={course.title} />
                  <Row label={copy("packages")} value={selectedPlan.name} />
                  <Row
                    label={copy("pay")}
                    value={
                      <span className="font-semibold text-primary">{priceLabel(finalPrice)}</span>
                    }
                  />
                  <p className="pt-1 text-xs text-muted-foreground">
                    {copy("clickSubmitToSimulateCompletingThePaymentAndJoiningMy")}
                  </p>
                </div>
              ),
            },
          ]}
          onFinish={async () => {
            await sleep(500); // 模拟支付/报名请求
            enroll(course.id);
            setLastLesson(course.id, firstLessonId(course));
            toast({
              title: copy("enrollmentSuccessful"),
              description: copy("addedToLearningPlan", selectedPlan.name),
              tone: "success",
            });
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
