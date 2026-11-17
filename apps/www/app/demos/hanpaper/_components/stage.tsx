"use client";
import { copy } from "./stage.content";
import { Tag } from "@hulianui/ui";
import type { PaperStage } from "../_data/types";

/** Pipeline order. Stage values are protocol keys; labels come from the dictionary. */
export const STAGES: PaperStage[] = ["topic", "survey", "drafting", "figures", "review", "submission", "published"];

export const STAGE_LABEL: Record<PaperStage, string> = {
  topic: copy("topic"),
  survey: copy("survey"),
  drafting: copy("drafting"),
  figures: copy("figures"),
  review: copy("review"),
  submission: copy("submission"),
  published: copy("published"),
};

const TONE: Record<PaperStage, "neutral" | "brand" | "info" | "success" | "warning" | "danger"> = {
  topic: "neutral",
  survey: "neutral",
  drafting: "info",
  figures: "info",
  review: "warning",
  submission: "brand",
  published: "success",
};

export function StageTag({ stage }: { stage: PaperStage }) {
  return (
    <Tag tone={TONE[stage]} size="sm" dot pulse={stage === "review" || stage === "submission"}>
      {STAGE_LABEL[stage]}
    </Tag>
  );
}
