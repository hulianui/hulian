"use client";
import type { ShowcaseSpec } from "@hulian/ui";
import {
  buttonShowcase,
  switchShowcase,
  dialogShowcase,
  badgeShowcase,
  cardShowcase,
  skeletonShowcase,
  avatarShowcase,
  inputShowcase,
  textareaShowcase,
  fieldShowcase,
} from "@hulian/ui";

// 唯一 import @hulian/ui 渲染 spec 的地方；只被 ComponentDoc client 岛 import。
export const specBySlug: Record<string, ShowcaseSpec> = {
  button: buttonShowcase,
  switch: switchShowcase,
  dialog: dialogShowcase,
  badge: badgeShowcase,
  card: cardShowcase,
  skeleton: skeletonShowcase,
  avatar: avatarShowcase,
  input: inputShowcase,
  textarea: textareaShowcase,
  field: fieldShowcase,
};
