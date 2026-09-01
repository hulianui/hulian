import { copy } from "./nav-config.content";
export const LEARN_BASE = "/demos/learn";

export const brand = {
  name: copy("hanxue"),
  nameEn: "HanLearn",
  slogan: copy("turnEveryLearningIntoVisibleProgress"),
};

export const primaryNav = [
  { label: copy("courseCatalog"), href: LEARN_BASE },
  { label: copy("myLearning"), href: `${LEARN_BASE}?view=mine` },
  { label: copy("questionBank"), href: `${LEARN_BASE}/questions` },
  { label: copy("practice"), href: `${LEARN_BASE}/practice` },
];
