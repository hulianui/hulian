"use client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  StepsForm,
  Radio,
  RadioGroup,
  Tag,
  toast,
} from "@hulian/ui";
import type { Course } from "../_data/types";
import { priceLabel, lessonCount, totalMinutes, firstLessonId } from "../_data/courses";
import { useLearn } from "../_lib/learn-store";
import { sleep } from "../../lib/async";

interface Plan {
  key: string;
  name: string;
  desc: string;
  multiplier: number;
}

const PLANS: Plan[] = [
  { key: "standard", name: "标准版", desc: "全部课程内容 + 课件下载", multiplier: 1 },
  { key: "plus", name: "进阶版", desc: "标准版 + 讲师答疑 + 结课证书", multiplier: 1.5 },
  { key: "team", name: "团队版", desc: "进阶版 + 5 人席位 + 学习报表", multiplier: 4 },
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
      <DialogContent title={`报名 · ${course.title}`} className="w-[32rem] max-w-[calc(100vw-2rem)]">
        <StepsForm
          current={current}
          onCurrentChange={setCurrent}
          steps={[
            {
              title: "确认课程",
              content: (
                <div className="space-y-3 rounded-[var(--radius)] border border-border bg-surface p-4">
                  <div className="text-base font-semibold text-foreground">{course.title}</div>
                  <p className="text-sm text-muted">{course.subtitle}</p>
                  <div className="flex flex-wrap gap-3 text-sm text-muted">
                    <span>讲师 · {course.instructor.name}</span>
                    <span>{lessonCount(course)} 节</span>
                    <span>约 {totalMinutes(course)} 分钟</span>
                    <Tag tone="brand" variant="soft" size="sm">
                      {course.level}
                    </Tag>
                  </div>
                </div>
              ),
            },
            {
              title: "选择套餐",
              content: (
                <RadioGroup value={plan} onValueChange={setPlan} aria-label="选择套餐">
                  <div className="space-y-2">
                    {PLANS.map((p) => {
                      const price = Math.round(course.price * p.multiplier);
                      return (
                        <label
                          key={p.key}
                          className="flex cursor-pointer items-center justify-between gap-3 rounded-[var(--radius)] border border-border p-3 transition-colors hover:bg-surface-hover has-[input:checked]:border-primary has-[input:checked]:bg-primary/5"
                        >
                          <Radio value={p.key} label={<span className="font-medium text-foreground">{p.name}</span>} />
                          <span className="flex-1 text-xs text-muted">{p.desc}</span>
                          <span className="shrink-0 font-semibold text-primary">{priceLabel(price)}</span>
                        </label>
                      );
                    })}
                  </div>
                </RadioGroup>
              ),
            },
            {
              title: "完成",
              content: (
                <div className="space-y-2 rounded-[var(--radius)] border border-border bg-surface p-4 text-sm">
                  <Row label="课程" value={course.title} />
                  <Row label="套餐" value={selectedPlan.name} />
                  <Row label="应付" value={<span className="font-semibold text-primary">{priceLabel(finalPrice)}</span>} />
                  <p className="pt-1 text-xs text-muted">点「提交」即模拟完成支付并加入「我的学习」。</p>
                </div>
              ),
            },
          ]}
          onFinish={async () => {
            await sleep(500); // 模拟支付/报名请求
            enroll(course.id);
            setLastLesson(course.id, firstLessonId(course));
            toast({
              title: "报名成功",
              description: `已加入「我的学习」· ${selectedPlan.name}`,
              tone: "info",
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
      <span className="text-muted">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
