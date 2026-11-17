"use client";
import { copy } from "./page.content";

import { useState } from "react";
import Link from "next/link";
import { Check, FileText, Send, SquareCheckBig, TriangleAlert, Workflow } from "lucide-react";
import {
  Alert,
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogTrigger,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Descriptions,
  DescriptionsItem,
  Field,
  Heading,
  Progress,
  Result,
  Skeleton,
  Stat,
  Steps,
  Tag,
  Text,
  Textarea,
  toast,
} from "@hulianui/ui";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";
import { useMockData, usePending } from "../../../lib/async";
import { findPaper } from "../../_data/papers";
import { reviews } from "../../_data/reviews";
import { ROOT } from "../../_components/nav-config";

const PAPER = findPaper("git");
const OPEN_COMMENTS = reviews.filter((r) => r.status !== "resolved").length;
const STEPS = [
  { title: copy("stepsPrepare"), description: copy("stepsPrepareDesc") },
  { title: copy("stepsCheck"), description: copy("stepsCheckDesc") },
  { title: copy("stepsProof"), description: copy("stepsProofDesc") },
  { title: copy("stepsSubmit"), description: copy("stepsSubmitDesc") },
];

function SubmitSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex flex-col gap-4">
        <Skeleton shape="rect" className="h-24 w-full" />
        <Skeleton shape="rect" className="h-64 w-full" />
        <Skeleton shape="rect" className="h-56 w-full" />
      </div>
      <Skeleton shape="rect" className="h-96 w-full" />
    </div>
  );
}

function CheckRow({ title, description, passed }: { title: string; description: string; passed: boolean }) {
  return (
    <div className="flex items-start gap-3 rounded-[var(--radius)] border border-border p-3">
      <span className={passed ? "mt-0.5 text-success" : "mt-0.5 text-warning"}>
        {passed ? <Check className="size-4" /> : <TriangleAlert className="size-4" />}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Text size="sm" weight="medium">
          {title}
        </Text>
        <Text size="xs" tone="muted">
          {description}
        </Text>
      </div>
      <Tag size="sm" tone={passed ? "success" : "warning"}>
        {copy(passed ? "ok" : "warn")}
      </Tag>
    </div>
  );
}

function SubmitPageInner() {
  const [formatChecked, setFormatChecked] = useState(false);
  const [figuresChecked, setFiguresChecked] = useState(false);
  const [refsChecked, setRefsChecked] = useState(false);
  const [declarations, setDeclarations] = useState({ authorship: false, conflict: false, data: false });
  const [cover, setCover] = useState("");
  const [checkedAt, setCheckedAt] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [checking, runChecks] = usePending();
  const [submitting, runSubmit] = usePending();

  const declared = declarations.authorship && declarations.conflict && declarations.data;
  const checksPassed = formatChecked && figuresChecked && refsChecked && declared;
  const canSubmit = checksPassed && cover.trim().length > 0;
  const readiness = [formatChecked, figuresChecked, refsChecked, declarations.authorship, declarations.conflict, declarations.data, cover.trim() !== ""].filter(Boolean).length;
  const readyPercent = Math.round((readiness / 7) * 100);
  const currentStep = submitted ? 3 : canSubmit ? 2 : formatChecked ? 1 : 0;

  const check = () =>
    void runChecks(() => {
      setFormatChecked(true);
      setFiguresChecked(true);
      setRefsChecked(true);
      setCheckedAt(Date.now());
      toast({ tone: "success", title: copy("checksPassed") });
    });

  const submit = () =>
    void runSubmit(() => {
      setConfirmOpen(false);
      setSubmitted(true);
      toast({ tone: "success", title: copy("submittedToast") });
    });

  if (submitted) {
    return (
      <Result
        status="success"
        title={copy("submittedTitle")}
        subTitle={copy("submittedBody", PAPER?.title ?? "Git")}
      >
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="outline" render={<Link href={ROOT} />}>
            {copy("backToWorkbench")}
          </Button>
          <Button render={<Link href={`${ROOT}/papers/git`} />}>
            <FileText className="size-4" />
            {copy("openPaper")}
          </Button>
        </div>
      </Result>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex max-w-3xl flex-col gap-1">
          <Heading level={1} size="xl">
            {copy("pageTitle")}
          </Heading>
          <Text size="sm" tone="muted">
            {copy("pageDescription")}
          </Text>
        </div>
        <Tag size="sm" tone={canSubmit ? "success" : "warning"} dot pulse={canSubmit}>
          {copy(canSubmit ? "ready" : "notReady")}
        </Tag>
      </header>

      <Steps items={STEPS} current={currentStep} size="sm" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={copy("statWords")} value={copy("wordsValue", PAPER?.words.toLocaleString() ?? "0")} icon={<FileText className="size-4" />} tone="brand" />
        <Stat label={copy("statFigures")} value={copy("figuresValue", PAPER?.figures ?? 0)} icon={<Workflow className="size-4" />} tone="info" />
        <Stat label={copy("statRefs")} value={copy("refsValue", PAPER?.references ?? 0)} hint={copy("statRefsHint")} icon={<SquareCheckBig className="size-4" />} tone="success" />
        <Stat label={copy("statOpen")} value={copy("openCommentsValue", OPEN_COMMENTS)} icon={<Send className="size-4" />} tone={OPEN_COMMENTS ? "warning" : "success"} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-4">
          <Card>
            <CardHeader
              title={copy("preflightTitle")}
              description={copy("preflightHint")}
              extra={
                <Button size="sm" variant="outline" loading={checking} disabled={checking} onClick={check}>
                  {checkedAt ? copy("rerunChecks") : copy("runChecks")}
                </Button>
              }
            />
            <CardBody className="flex flex-col gap-3">
              <Text size="xs" tone="muted">
                {checkedAt
                  ? copy("lastChecked", new Date(checkedAt).toLocaleTimeString(DOCS_LOCALE === "en" ? "en-US" : "zh-CN"))
                  : copy("neverChecked")}
              </Text>
              <CheckRow title={copy("checkFormat")} description={copy("checkFormatDesc")} passed={formatChecked} />
              <CheckRow title={copy("checkFigures")} description={copy("checkFiguresDesc")} passed={figuresChecked} />
              <CheckRow title={copy("checkRefs")} description={copy("checkRefsDesc")} passed={refsChecked} />
              <Alert tone={checksPassed ? "success" : "warning"} title={copy(checksPassed ? "checksPassed" : "checksFailed")} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={copy("coverTitle")} description={copy("coverDescription")} />
            <CardBody>
              <Field label={copy("coverLabel")}>
                <Textarea
                  rows={7}
                  value={cover}
                  onChange={(e) => setCover(e.target.value)}
                  placeholder={copy("coverPlaceholder")}
                />
              </Field>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={copy("declarationsTitle")} description={copy("declarationsDescription")} />
            <CardBody className="flex flex-col gap-3">
              <Checkbox
                checked={declarations.authorship}
                onCheckedChange={(v) => setDeclarations((d) => ({ ...d, authorship: v }))}
                label={copy("declAuthorship")}
                labelClassName="text-sm"
              />
              <Text size="xs" tone="muted" className="ps-7">
                {copy("declAuthorshipDesc")}
              </Text>
              <Checkbox
                checked={declarations.conflict}
                onCheckedChange={(v) => setDeclarations((d) => ({ ...d, conflict: v }))}
                label={copy("declConflict")}
                labelClassName="text-sm"
              />
              <Text size="xs" tone="muted" className="ps-7">
                {copy("declConflictDesc")}
              </Text>
              <Checkbox
                checked={declarations.data}
                onCheckedChange={(v) => setDeclarations((d) => ({ ...d, data: v }))}
                label={copy("declData")}
                labelClassName="text-sm"
              />
              <Text size="xs" tone="muted" className="ps-7">
                {copy("declDataDesc")}
              </Text>
            </CardBody>
          </Card>
        </div>

        <aside className="flex min-w-0 flex-col gap-3">
          <Card>
            <CardHeader title={copy("summaryTitle")} description={copy("summaryHint")} />
            <CardBody className="flex flex-col gap-4">
              <Descriptions column={1} size="sm" layout="vertical">
                <DescriptionsItem label={copy("venueLabel")}>{copy("venueValue")}</DescriptionsItem>
                <DescriptionsItem label={copy("deadlineLabel")}>{copy("deadlineValue")}</DescriptionsItem>
                <DescriptionsItem label={copy("contactLabel")}>{copy("contactValue")}</DescriptionsItem>
              </Descriptions>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <Text size="xs" tone="muted">
                    {copy("readiness")}
                  </Text>
                  <span className="text-sm font-semibold tabular-nums">{readyPercent}%</span>
                </div>
                <Progress value={readyPercent} tone={canSubmit ? "success" : "primary"} />
              </div>
              {OPEN_COMMENTS > 0 ? (
                <Alert
                  tone="warning"
                  title={copy("warningOpenComments", OPEN_COMMENTS)}
                  action={
                    <Button size="xs" variant="outline" render={<Link href={`${ROOT}/review`} />}>
                      {copy("goReview")}
                    </Button>
                  }
                />
              ) : null}
              {!canSubmit ? <Text size="xs" tone="muted">{copy("warningChecks")}</Text> : null}
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" render={<Link href={`${ROOT}/figures`} />}>
                  <Workflow className="size-4" />
                  {copy("openFigures")}
                </Button>
                <Button size="sm" variant="ghost" render={<Link href={`${ROOT}/papers/git`} />}>
                  {copy("openPaper")}
                </Button>
              </div>
              <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogTrigger
                  render={
                    <Button className="w-full" disabled={!canSubmit}>
                      <Send className="size-4" />
                      {copy("submit")}
                    </Button>
                  }
                />
                <AlertDialogContent
                  title={copy("confirmTitle", PAPER?.title ?? "Git")}
                  description={copy("confirmBody")}
                >
                  <AlertDialogClose render={<Button variant="outline" size="sm" disabled={submitting}>{copy("cancel")}</Button>} />
                  <Button size="sm" loading={submitting} disabled={submitting} onClick={submit}>
                    {copy(submitting ? "submitting" : "confirmOk")}
                  </Button>
                </AlertDialogContent>
              </AlertDialog>
              {!canSubmit ? (
                <Text size="xs" tone="muted">
                  {copy("submitBlocked")}
                </Text>
              ) : null}
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}

export default function SubmitPage() {
  const { loading, error, reload } = useMockData(true, { failOnce: true });
  if (loading) return <SubmitSkeleton />;
  if (error) {
    return (
      <Result status="error" title={copy("loadFailedTitle")} subTitle={error}>
        <Button size="sm" onClick={() => void reload()}>
          {copy("retry")}
        </Button>
      </Result>
    );
  }
  return <SubmitPageInner />;
}
