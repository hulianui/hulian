import { t, type Dictionary } from "intlayer";
import english from "./block-fixtures.en.json";
import { fixtureChineseBranch } from "../../lib/fixture-copy";

export const blockFixturesContent = {
  "zh-CN": fixtureChineseBranch(english),
  en: english,
};

const dictionary: Dictionary = {
  key: "block-fixtures",
  content: t(blockFixturesContent),
};

export default dictionary;
