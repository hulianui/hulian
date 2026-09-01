"use client";
import { copy } from "./question-bank-client.content";
import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Drawer,
  DrawerContent,
  Empty,
  Heading,
  Popconfirm,
  Segmented,
  Skeleton,
  Stack,
  Text,
  toast,
} from "@hulianui/ui";
import { MathField } from "@hulianui/ui/math-field";
import {
  QuestionCard,
  QuestionEditor,
  emptyQuestion,
  validateQuestion,
  type Question,
  type QuestionType,
} from "@hulianui/ui/math";
import { Plus } from "lucide-react";
import { useMockData, usePending } from "../../lib/async";
import { useQuestionBank, type BankQuestion } from "../_lib/question-bank-store";

type Filter = "all" | "single" | "multiple" | "judge" | "blank" | "subjective";
const SUBJECTIVE: QuestionType[] = ["short_answer", "calculation", "essay"];
const DEFAULT_COURSE = "react-foundations";

function matches(row: BankQuestion, filter: Filter) {
  if (filter === "all") return true;
  if (filter === "subjective") return SUBJECTIVE.includes(row.question.type);
  return row.question.type === filter;
}

export function QuestionBankClient() {
  const bank = useQuestionBank();
  // 首屏加载态只借 useMockData 的延迟；列表本身直接读 store，增删改立刻可见。
  const { loading } = useMockData(null, { delay: 500 });
  const [filter, setFilter] = useState<Filter>("all");
  const [editing, setEditing] = useState<{ id: string | null; draft: Question } | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [pending, run] = usePending();

  const rows = useMemo(() => bank.questions.filter((row) => matches(row, filter)), [bank.questions, filter]);

  const openNew = () => {
    setShowAll(false);
    setEditing({ id: null, draft: emptyQuestion("single") });
  };
  const openEdit = (row: BankQuestion) => {
    setShowAll(false);
    setEditing({ id: row.id, draft: row.question });
  };
  const save = () => {
    if (!editing) return;
    if (validateQuestion(editing.draft).length > 0) {
      setShowAll(true);
      toast({ title: copy("fixIssues"), tone: "danger" });
      return;
    }
    void run(() => {
      if (editing.id) {
        bank.update(editing.id, editing.draft);
        toast({ title: copy("saved"), tone: "info" });
      } else {
        bank.add(DEFAULT_COURSE, editing.draft);
        toast({ title: copy("created"), tone: "info" });
      }
      setEditing(null);
    });
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Heading level={1}>{copy("title")}</Heading>
          <Text tone="muted">{copy("subtitle")}</Text>
        </div>
        <Button onClick={openNew}>
          <Plus className="size-4" aria-hidden />
          {copy("newQuestion")}
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Segmented
          value={filter}
          onValueChange={(v) => setFilter(v as Filter)}
          items={[
            { value: "all", label: copy("filterAll") },
            { value: "single", label: copy("typeSingle") },
            { value: "multiple", label: copy("typeMultiple") },
            { value: "judge", label: copy("typeJudge") },
            { value: "blank", label: copy("typeBlank") },
            { value: "subjective", label: copy("typeSubjective") },
          ]}
        />
        <Text size="sm" tone="muted">
          {copy("count", rows.length)}
        </Text>
      </div>

      {loading ? (
        <Stack gap={4}>
          <Skeleton shape="rect" className="h-40 w-full" />
          <Skeleton shape="rect" className="h-40 w-full" />
        </Stack>
      ) : rows.length === 0 ? (
        <Empty title={copy("emptyTitle")} description={copy("emptyHint")} />
      ) : (
        <Stack gap={4}>
          {rows.map((row) => (
            <Card key={row.id} className="p-4">
              <QuestionCard
                type={row.question.type}
                stem={row.question.stem}
                options={row.question.options ?? undefined}
                answer={row.question.answer}
                analysis={row.question.analysis}
                showAnswer
              />
              <div className="mt-3 flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
                  {copy("edit")}
                </Button>
                <Popconfirm
                  title={copy("deleteConfirm")}
                  danger
                  onConfirm={() => {
                    bank.remove(row.id);
                    toast({ title: copy("deleted"), tone: "info" });
                  }}
                >
                  <Button size="sm" variant="ghost" tone="danger">
                    {copy("delete")}
                  </Button>
                </Popconfirm>
              </div>
            </Card>
          ))}
        </Stack>
      )}

      <Drawer open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DrawerContent
          side="right"
          title={editing?.id ? copy("editQuestion") : copy("newQuestion")}
          className="w-[min(880px,96vw)] overflow-y-auto"
        >
          {editing && (
            <div className="space-y-4">
              <QuestionEditor
                value={editing.draft}
                onChange={(draft) => setEditing({ id: editing.id, draft })}
                visualEditor={MathField}
                showAllIssues={showAll}
                disabled={pending}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditing(null)} disabled={pending}>
                  {copy("cancel")}
                </Button>
                <Button onClick={save} loading={pending}>
                  {copy("save")}
                </Button>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
