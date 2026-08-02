import { t, type Dictionary } from "intlayer";
import english from "./page-fixtures.en.json";
import { fixtureChineseBranch } from "../../lib/fixture-copy";

export const pageFixturesContent = {
  "zh-CN": fixtureChineseBranch(english),
  en: english,
};

const dictionary: Dictionary = {
  key: "page-fixtures",
  content: t(pageFixturesContent),
};

export default dictionary;
