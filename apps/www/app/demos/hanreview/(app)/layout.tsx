import type { ReactNode } from "react";
import { ReviewShell } from "../_components/review-shell";

export default function HanReviewAppLayout({ children }: { children: ReactNode }) {
  return <ReviewShell>{children}</ReviewShell>;
}
