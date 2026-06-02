"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Rating } from "./rating";

function Demo() {
  const [v, setV] = useState<number | null>(3);
  return <Rating value={v ?? 0} onValueChange={setV} />;
}

export const ratingShowcase: ShowcaseSpec = {
  controls: [
    { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md", label: "尺寸" },
    { prop: "readOnly", type: "boolean", defaultValue: false, label: "只读" },
  ],
  states: [
    { name: "可交互", render: () => <Demo /> },
    { name: "只读", render: () => <Rating value={4} readOnly /> },
    { name: "lg", render: () => <Rating defaultValue={3} size="lg" /> },
  ],
  renderWithProps: (p) => (
    <Rating defaultValue={3} size={(p.size as "sm" | "md" | "lg") ?? "md"} readOnly={p.readOnly === true} />
  ),
  toCode: (p) => `<Rating defaultValue={3} size="${p.size ?? "md"}"${p.readOnly ? " readOnly" : ""} />`,
};
